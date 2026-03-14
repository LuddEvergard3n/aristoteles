/**
 * graph-engine.js
 * Motor de grafo force-directed para o mapa de relações entre filósofos.
 * Renderiza em Canvas 2D nativo, sem dependências externas.
 *
 * Algoritmo: Fruchterman-Reingold simplificado com repulsão nó-a-nó,
 * atracção por aresta e força de gravidade central. Integração Euler
 * com amortecimento progressivo.
 *
 * API pública:
 *   GraphEngine.render(container, authors, options?)
 *   GraphEngine.destroy()
 */

export const GraphEngine = (() => {

  /* ------------------------------------------------------------------
   * Constantes de layout
   * ------------------------------------------------------------------ */

  const K_REPULSION   = 12000;  // força de repulsão entre todos os nós
  const K_ATTRACTION  = 0.04;   // força de atracção por aresta
  const K_GRAVITY     = 0.015;  // força de gravidade para o centro
  const DAMPING       = 0.82;   // amortecimento de velocidade por iteração
  const MIN_DIST      = 30;     // distância mínima para evitar singularidade
  const NODE_RADIUS   = 22;     // raio base dos nós
  const ITERATIONS    = 600;    // iterações máximas de simulação antes de parar

  /* Paleta: usa variáveis CSS do projecto quando disponíveis */
  const COLORS = {
    'Pré-Socrática':              '#6b5a3e',
    'Pré-Socrático':              '#6b5a3e',
    'Clássico':                   '#8b3a2a',
    'Filosofia Antiga':           '#8b3a2a',
    'Helenístico':                '#5a7a5a',
    'Imperial Romano':            '#5a7a5a',
    'Imperial Romano / Helenístico': '#5a7a5a',
    'Filosofia Medieval':         '#5a4a7a',
    'Medieval':                   '#5a4a7a',
    'Filosofia Moderna':          '#2b4b7e',
    'Moderno / Idealismo Alemão': '#2b4b7e',
    'Moderno / Século XIX':       '#2b4b7e',
    'Moderno / Contemporâneo':    '#2b4b7e',
    'Contemporâneo / Século XX':  '#3a6a6a',
  };

  const COLOR_DEFAULT = '#8b6e45';
  const COLOR_EDGE    = 'rgba(180,160,130,0.35)';
  const COLOR_EDGE_HI = 'rgba(139,58,42,0.75)';

  /* ------------------------------------------------------------------
   * Estado do módulo
   * ------------------------------------------------------------------ */

  let _canvas   = null;
  let _ctx      = null;
  let _nodes    = [];
  let _edges    = [];
  let _rafId    = null;
  let _iter     = 0;
  let _hovered  = null;   // índice do nó sob o cursor
  let _selected = null;   // índice do nó seleccionado (clicado)
  let _dragging = null;   // índice do nó em drag
  let _dragOff  = { x: 0, y: 0 };
  let _onSelect = null;   // callback(author) ao clicar nó
  let _transform = { x: 0, y: 0, scale: 1 };  // pan/zoom
  let _panStart  = null;
  let _filterSchool = null;  // filtro de escola activo
  let _ro = null; // ResizeObserver

  /* ------------------------------------------------------------------
   * API pública
   * ------------------------------------------------------------------ */

  return {

    /**
     * Inicializa e renderiza o grafo.
     * @param {HTMLElement} container — elemento pai onde o canvas é inserido
     * @param {Array}       authors   — array de autores de authors.json
     * @param {Object}      options   — { onSelect(author) }
     */
    render(container, authors, options = {}) {
      this.destroy();

      _onSelect = options.onSelect || null;
      _filterSchool = null;

      // Canvas
      _canvas = document.createElement('canvas');
      _canvas.className = 'graph-canvas';
      _canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:none;';
      container.appendChild(_canvas);
      _ctx = _canvas.getContext('2d');

      _resize();
      _buildGraph(authors);
      _bindEvents();
      _startSimulation();

      // ResizeObserver
      _ro = new ResizeObserver(_resize);
      _ro.observe(container);
    },

    /** Destrói o grafo e liberta recursos. */
    destroy() {
      if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
      if (_ro)    { _ro.disconnect(); _ro = null; }
      if (_canvas) {
        _canvas.removeEventListener('mousemove', _onMouseMove);
        _canvas.removeEventListener('mousedown', _onMouseDown);
        _canvas.removeEventListener('mouseup',   _onMouseUp);
        _canvas.removeEventListener('wheel',     _onWheel);
        _canvas.removeEventListener('touchstart',_onTouchStart);
        _canvas.removeEventListener('touchmove', _onTouchMove);
        _canvas.removeEventListener('touchend',  _onTouchEnd);
        _canvas.remove();
        _canvas = null;
      }
      _nodes = []; _edges = [];
      _hovered = _selected = _dragging = _panStart = null;
      _transform = { x: 0, y: 0, scale: 1 };
      _iter = 0;
    },

    /** Filtra o grafo por escola (null = todos). */
    setFilter(school) {
      _filterSchool = school || null;
      _iter = 0;  // reinicia animação de fade
      if (_rafId === null) _startSimulation();
    },

    /** Reseta a transformação de câmara ao centro. */
    resetView() {
      if (!_canvas) return;
      _transform = { x: 0, y: 0, scale: 1 };
      _draw();
    },
  };

  /* ------------------------------------------------------------------
   * Construção do grafo
   * ------------------------------------------------------------------ */

  function _buildGraph(authors) {
    const W = _canvas.width;
    const H = _canvas.height;
    const cx = W / 2, cy = H / 2;

    // Nós: posição inicial aleatória ao redor do centro
    _nodes = authors.map((a, i) => {
      const angle = (i / authors.length) * Math.PI * 2;
      const r     = Math.min(W, H) * 0.3;
      return {
        id:      a.id,
        label:   a.name,
        period:  a.period || '',
        school:  a.school || '',
        author:  a,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0,
        pinned: false,
      };
    });

    // Índice por id
    const idx = new Map(_nodes.map((n, i) => [n.id, i]));

    // Arestas: de related_authors (deduplicadas)
    const seen = new Set();
    _edges = [];
    authors.forEach(a => {
      (a.related_authors || []).forEach(rid => {
        const key = [a.id, rid].sort().join('|');
        if (!seen.has(key) && idx.has(a.id) && idx.has(rid)) {
          seen.add(key);
          _edges.push({ s: idx.get(a.id), t: idx.get(rid) });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
   * Simulação force-directed
   * ------------------------------------------------------------------ */

  function _startSimulation() {
    _iter = 0;
    function step() {
      _simulate();
      _draw();
      _iter++;
      // Continua sempre (para suportar drag e hover sem parar)
      _rafId = requestAnimationFrame(step);
    }
    _rafId = requestAnimationFrame(step);
  }

  function _simulate() {
    if (_iter >= ITERATIONS && _dragging === null) return;

    const W = _canvas.width;
    const H = _canvas.height;
    const cx = W / 2, cy = H / 2;
    const n = _nodes.length;

    // Temperatura decai com as iterações
    const t = Math.max(0.05, 1 - _iter / ITERATIONS);

    for (let i = 0; i < n; i++) {
      if (_nodes[i].pinned) continue;
      let fx = 0, fy = 0;

      // Repulsão nó-a-nó
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = _nodes[i].x - _nodes[j].x;
        const dy = _nodes[i].y - _nodes[j].y;
        const d  = Math.max(MIN_DIST, Math.sqrt(dx * dx + dy * dy));
        const f  = K_REPULSION / (d * d);
        fx += (dx / d) * f;
        fy += (dy / d) * f;
      }

      // Gravidade para o centro
      fx += (cx - _nodes[i].x) * K_GRAVITY;
      fy += (cy - _nodes[i].y) * K_GRAVITY;

      // Integração Euler
      _nodes[i].vx = (_nodes[i].vx + fx) * DAMPING;
      _nodes[i].vy = (_nodes[i].vy + fy) * DAMPING;
      _nodes[i].x += _nodes[i].vx * t;
      _nodes[i].y += _nodes[i].vy * t;

      // Contém dentro do canvas com margem
      const m = NODE_RADIUS + 10;
      _nodes[i].x = Math.max(m, Math.min(W - m, _nodes[i].x));
      _nodes[i].y = Math.max(m, Math.min(H - m, _nodes[i].y));
    }

    // Atracção por aresta
    _edges.forEach(e => {
      const a = _nodes[e.s], b = _nodes[e.t];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = Math.max(MIN_DIST, Math.sqrt(dx * dx + dy * dy));
      const f  = K_ATTRACTION * d * t;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    });
  }

  /* ------------------------------------------------------------------
   * Renderização
   * ------------------------------------------------------------------ */

  function _draw() {
    if (!_ctx || !_canvas) return;
    const W = _canvas.width;
    const H = _canvas.height;
    const dpr = window.devicePixelRatio || 1;

    _ctx.clearRect(0, 0, W, H);
    _ctx.save();

    // Pan / zoom
    _ctx.translate(
      _transform.x + W / 2,
      _transform.y + H / 2
    );
    _ctx.scale(_transform.scale, _transform.scale);
    _ctx.translate(-W / 2, -H / 2);

    // Conjuntos de vizinhos do nó seleccionado/hovered
    const focus   = _selected !== null ? _selected : _hovered;
    const neighbours = focus !== null ? _getNeighbours(focus) : null;

    // Arestas
    _edges.forEach(e => {
      const a = _nodes[e.s], b = _nodes[e.t];
      const hidden = _filterSchool && a.school !== _filterSchool && b.school !== _filterSchool;
      const hi     = neighbours && (e.s === focus || e.t === focus);
      const alpha  = hidden ? 0.07 : hi ? 1 : (neighbours ? 0.15 : 1);
      _drawEdge(a, b, hi, alpha);
    });

    // Nós
    _nodes.forEach((n, i) => {
      const hidden = _filterSchool && n.school !== _filterSchool;
      const dimmed = (neighbours && !neighbours.has(i) && i !== focus);
      const alpha  = hidden ? 0.12 : dimmed ? 0.25 : 1;
      _drawNode(n, i, alpha);
    });

    _ctx.restore();
  }

  function _drawEdge(a, b, highlight, alpha) {
    _ctx.save();
    _ctx.globalAlpha = alpha;
    _ctx.strokeStyle = highlight ? COLOR_EDGE_HI : COLOR_EDGE;
    _ctx.lineWidth   = highlight ? 2 : 1;
    _ctx.beginPath();
    _ctx.moveTo(a.x, a.y);
    _ctx.lineTo(b.x, b.y);
    _ctx.stroke();
    _ctx.restore();
  }

  function _drawNode(node, idx, alpha) {
    const r       = NODE_RADIUS;
    const isHov   = idx === _hovered;
    const isSel   = idx === _selected;
    const color   = COLORS[node.period] || COLOR_DEFAULT;
    const rr      = isHov || isSel ? r + 4 : r;

    _ctx.save();
    _ctx.globalAlpha = alpha;

    // Sombra para nó activo
    if (isHov || isSel) {
      _ctx.shadowColor   = color;
      _ctx.shadowBlur    = 14;
    }

    // Círculo de fundo
    _ctx.beginPath();
    _ctx.arc(node.x, node.y, rr, 0, Math.PI * 2);
    _ctx.fillStyle = isSel ? color : _hexAlpha(color, 0.18);
    _ctx.fill();

    // Borda
    _ctx.strokeStyle = color;
    _ctx.lineWidth   = isSel ? 2.5 : isHov ? 2 : 1.5;
    _ctx.stroke();
    _ctx.shadowBlur = 0;

    // Inicial (primeira letra do nome)
    _ctx.fillStyle   = isSel ? '#f5efe3' : color;
    _ctx.font        = `${isSel ? 600 : 400} ${Math.round(rr * 0.72)}px 'EB Garamond', serif`;
    _ctx.textAlign   = 'center';
    _ctx.textBaseline = 'middle';
    _ctx.fillText(node.label.charAt(0), node.x, node.y + 1);

    // Label abaixo (só quando hovered/selected)
    if (isHov || isSel) {
      _ctx.shadowColor  = 'rgba(0,0,0,0.6)';
      _ctx.shadowBlur   = 6;
      _ctx.font         = `500 12px 'EB Garamond', serif`;
      _ctx.fillStyle    = isSel ? color : '#1a1410';
      _ctx.fillText(_truncate(node.label, 20), node.x, node.y + rr + 14);
      _ctx.shadowBlur   = 0;
    }

    _ctx.restore();
  }

  /* ------------------------------------------------------------------
   * Utilitários
   * ------------------------------------------------------------------ */

  function _getNeighbours(idx) {
    const s = new Set([idx]);
    _edges.forEach(e => {
      if (e.s === idx) s.add(e.t);
      if (e.t === idx) s.add(e.s);
    });
    return s;
  }

  function _hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function _truncate(s, n) {
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  function _resize() {
    if (!_canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = _canvas.parentElement.getBoundingClientRect();
    _canvas.width  = rect.width  * dpr;
    _canvas.height = rect.height * dpr;
    _ctx.scale(dpr, dpr);
    _canvas.style.width  = rect.width  + 'px';
    _canvas.style.height = rect.height + 'px';
    _draw();
  }

  /* ------------------------------------------------------------------
   * Coordenadas: ecrã → espaço do grafo
   * ------------------------------------------------------------------ */

  function _screenToGraph(x, y) {
    const W = _canvas.offsetWidth;
    const H = _canvas.offsetHeight;
    return {
      x: (x - _transform.x - W / 2) / _transform.scale + W / 2,
      y: (y - _transform.y - H / 2) / _transform.scale + H / 2,
    };
  }

  function _hitTest(gx, gy) {
    for (let i = _nodes.length - 1; i >= 0; i--) {
      const n = _nodes[i];
      const dx = gx - n.x, dy = gy - n.y;
      if (dx * dx + dy * dy <= (NODE_RADIUS + 6) * (NODE_RADIUS + 6)) return i;
    }
    return null;
  }

  /* ------------------------------------------------------------------
   * Eventos de interacção
   * ------------------------------------------------------------------ */

  function _bindEvents() {
    _canvas.addEventListener('mousemove', _onMouseMove, { passive: true });
    _canvas.addEventListener('mousedown', _onMouseDown);
    _canvas.addEventListener('mouseup',   _onMouseUp);
    _canvas.addEventListener('mouseleave', () => { _hovered = null; });
    _canvas.addEventListener('wheel',     _onWheel, { passive: false });
    _canvas.addEventListener('touchstart',_onTouchStart, { passive: false });
    _canvas.addEventListener('touchmove', _onTouchMove,  { passive: false });
    _canvas.addEventListener('touchend',  _onTouchEnd);
  }

  function _clientXY(e) {
    const rect = _canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function _onMouseMove(e) {
    const { x, y } = _clientXY(e);
    if (_dragging !== null) {
      const gp = _screenToGraph(x, y);
      _nodes[_dragging].x = gp.x + _dragOff.x;
      _nodes[_dragging].y = gp.y + _dragOff.y;
      _nodes[_dragging].vx = 0;
      _nodes[_dragging].vy = 0;
      _iter = Math.min(_iter, ITERATIONS - 60);
      return;
    }
    if (_panStart) {
      _transform.x += x - _panStart.x;
      _transform.y += y - _panStart.y;
      _panStart = { x, y };
      _draw();
      return;
    }
    const gp = _screenToGraph(x, y);
    const hit = _hitTest(gp.x, gp.y);
    if (hit !== _hovered) {
      _hovered = hit;
      _canvas.style.cursor = hit !== null ? 'pointer' : 'grab';
    }
  }

  function _onMouseDown(e) {
    const { x, y } = _clientXY(e);
    const gp  = _screenToGraph(x, y);
    const hit = _hitTest(gp.x, gp.y);
    if (hit !== null) {
      _dragging = hit;
      _nodes[hit].pinned = true;
      _dragOff = {
        x: _nodes[hit].x - gp.x,
        y: _nodes[hit].y - gp.y,
      };
      _canvas.style.cursor = 'grabbing';
    } else {
      _panStart = { x, y };
      _canvas.style.cursor = 'grabbing';
    }
    e.preventDefault();
  }

  function _onMouseUp(e) {
    const { x, y } = _clientXY(e);
    if (_dragging !== null) {
      const gp = _screenToGraph(x, y);
      const dx = Math.abs(_nodes[_dragging].x - (gp.x + _dragOff.x));
      const dy = Math.abs(_nodes[_dragging].y - (gp.y + _dragOff.y));
      // Click (sem deslocamento) → selecciona
      if (dx < 3 && dy < 3) {
        _selected = _selected === _dragging ? null : _dragging;
        if (_selected !== null && _onSelect) {
          _onSelect(_nodes[_selected].author);
        }
      }
      _nodes[_dragging].pinned = false;
      _dragging = null;
    }
    _panStart = null;
    _canvas.style.cursor = _hovered !== null ? 'pointer' : 'grab';
  }

  function _onWheel(e) {
    e.preventDefault();
    const { x, y } = _clientXY(e);
    const delta  = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, _transform.scale * delta));
    const W = _canvas.offsetWidth, H = _canvas.offsetHeight;
    // Zoom centrado no cursor
    _transform.x = x - (x - _transform.x) * (newScale / _transform.scale);
    _transform.y = y - (y - _transform.y) * (newScale / _transform.scale);
    _transform.scale = newScale;
    _draw();
  }

  // Touch: pan de um dedo, zoom de dois
  let _lastTouches = null;
  function _onTouchStart(e) {
    e.preventDefault();
    _lastTouches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
    if (e.touches.length === 1) {
      const rect = _canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      const gp  = _screenToGraph(x, y);
      const hit = _hitTest(gp.x, gp.y);
      if (hit !== null) {
        _dragging = hit;
        _dragOff = { x: _nodes[hit].x - gp.x, y: _nodes[hit].y - gp.y };
      } else {
        _panStart = { x, y };
      }
    }
  }

  function _onTouchMove(e) {
    e.preventDefault();
    const touches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
    if (touches.length === 2 && _lastTouches && _lastTouches.length === 2) {
      const d0 = Math.hypot(_lastTouches[1].x - _lastTouches[0].x, _lastTouches[1].y - _lastTouches[0].y);
      const d1 = Math.hypot(touches[1].x - touches[0].x, touches[1].y - touches[0].y);
      const delta = d1 / Math.max(d0, 1);
      _transform.scale = Math.max(0.3, Math.min(3, _transform.scale * delta));
      _draw();
    } else if (touches.length === 1) {
      const rect = _canvas.getBoundingClientRect();
      const x = touches[0].x - rect.left, y = touches[0].y - rect.top;
      if (_dragging !== null) {
        const gp = _screenToGraph(x, y);
        _nodes[_dragging].x = gp.x + _dragOff.x;
        _nodes[_dragging].y = gp.y + _dragOff.y;
      } else if (_panStart) {
        _transform.x += x - _panStart.x;
        _transform.y += y - _panStart.y;
        _panStart = { x, y };
        _draw();
      }
    }
    _lastTouches = touches;
  }

  function _onTouchEnd(e) {
    if (_dragging !== null) {
      _nodes[_dragging].pinned = false;
      _dragging = null;
    }
    _panStart = null;
    _lastTouches = null;
  }

})();
