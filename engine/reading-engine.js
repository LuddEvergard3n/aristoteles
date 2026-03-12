/**
 * reading-engine.js
 * Responsável pela exibição de textos filosóficos, leitura guiada,
 * destaque de termos e notas contextuais.
 *
 * Dependências: state.js (State), ui.js (UI)
 */

import { State } from '../js/state.js';
import { UI } from '../js/ui.js';

export const ReadingEngine = (() => {

  /* ------------------------------------------------------------------
   * Estado interno do motor
   * ------------------------------------------------------------------ */
  let _currentText     = null;  // objeto de texto ativo (data/texts.json)
  let _currentSegment  = 0;     // índice do segmento guiado ativo
  let _guideActive     = false; // leitura guiada ligada/desligada
  let _container       = null;  // elemento DOM raiz para renderização

  /* ------------------------------------------------------------------
   * API pública
   * ------------------------------------------------------------------ */

  /**
   * Inicializa o motor num contêiner DOM específico.
   * @param {HTMLElement} container
   */
  function init(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('ReadingEngine.init: container deve ser um HTMLElement');
    }
    _container = container;
  }

  /**
   * Carrega e renderiza um texto pelo seu id (texts.json).
   * @param {string} textId
   * @param {Object[]} textsData  — array completo de texts.json
   * @returns {boolean} sucesso
   */
  function loadText(textId, textsData) {
    const text = textsData.find(t => t.id === textId);
    if (!text) {
      console.warn(`ReadingEngine.loadText: texto "${textId}" não encontrado`);
      return false;
    }
    _currentText    = text;
    _currentSegment = 0;
    _guideActive    = false;
    _render();
    return true;
  }

  /**
   * Ativa ou desativa o modo de leitura guiada.
   * @param {boolean} active
   */
  function setGuideMode(active) {
    _guideActive    = Boolean(active);
    _currentSegment = 0;
    _render();
  }

  /**
   * Avança para o próximo segmento guiado.
   * @returns {boolean} false se já está no último segmento
   */
  function nextSegment() {
    if (!_currentText || !_guideActive) return false;
    const max = _currentText.guided_reading.length - 1;
    if (_currentSegment >= max) return false;
    _currentSegment++;
    _renderGuideStep();
    return true;
  }

  /**
   * Volta ao segmento guiado anterior.
   * @returns {boolean} false se já está no primeiro
   */
  function prevSegment() {
    if (!_currentText || !_guideActive) return false;
    if (_currentSegment <= 0) return false;
    _currentSegment--;
    _renderGuideStep();
    return true;
  }

  /**
   * Retorna o texto atualmente carregado.
   * @returns {Object|null}
   */
  function getCurrentText() {
    return _currentText;
  }

  /* ------------------------------------------------------------------
   * Renderização interna
   * ------------------------------------------------------------------ */

  function _render() {
    if (!_container || !_currentText) return;
    _container.innerHTML = '';

    const article = document.createElement('article');
    article.className = 'reading-text';
    article.setAttribute('aria-label', `Texto: ${_currentText.title}`);

    // Cabeçalho do texto
    article.appendChild(_buildHeader());

    // Corpo do texto
    if (_guideActive) {
      article.appendChild(_buildGuidedBody());
    } else {
      article.appendChild(_buildFullBody());
    }

    // Termos-chave
    if (_currentText.key_terms && _currentText.key_terms.length > 0) {
      article.appendChild(_buildKeyTerms());
    }

    // Questões para reflexão
    if (_currentText.questions && _currentText.questions.length > 0) {
      article.appendChild(_buildQuestions());
    }

    _container.appendChild(article);

    // Controles de modo
    _container.appendChild(_buildControls());
  }

  function _buildHeader() {
    const header = document.createElement('header');
    header.className = 'reading-header';

    const title = document.createElement('h2');
    title.className = 'reading-title';
    title.textContent = _currentText.title;

    const meta = document.createElement('p');
    meta.className = 'reading-meta';
    meta.innerHTML =
      `<span class="reading-source">${UI.escape(_currentText.source)}</span>` +
      ` &mdash; ` +
      `<span class="reading-period">${UI.escape(_currentText.period)}</span>`;

    header.appendChild(title);
    header.appendChild(meta);
    return header;
  }

  function _buildFullBody() {
    const section = document.createElement('section');
    section.className = 'reading-body';

    const text = _highlightKeyTerms(_currentText.text);

    const p = document.createElement('p');
    p.className = 'reading-paragraph';
    p.innerHTML = text;

    section.appendChild(p);
    return section;
  }

  function _buildGuidedBody() {
    const section = document.createElement('section');
    section.className = 'reading-body reading-guided';

    const progress = document.createElement('div');
    progress.className = 'reading-guide-progress';

    const total = _currentText.guided_reading.length;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'guide-dot' + (i === _currentSegment ? ' guide-dot--active' : '');
      dot.setAttribute('aria-label', `Segmento ${i + 1} de ${total}`);
      progress.appendChild(dot);
    }
    section.appendChild(progress);

    // Renderiza todos os segmentos, destaca o ativo
    _currentText.guided_reading.forEach((seg, idx) => {
      const segEl = document.createElement('div');
      segEl.className = 'reading-segment' +
        (idx === _currentSegment ? ' reading-segment--active' : ' reading-segment--dimmed') +
        (seg.highlight ? ' reading-segment--highlighted' : '');
      segEl.dataset.index = idx;

      const segText = document.createElement('blockquote');
      segText.className = 'segment-text';
      segText.textContent = seg.segment;

      segEl.appendChild(segText);

      if (idx === _currentSegment && seg.note) {
        const note = document.createElement('p');
        note.className = 'segment-note';
        note.textContent = seg.note;
        segEl.appendChild(note);
      }

      // Clique num segmento navega para ele
      segEl.addEventListener('click', () => {
        _currentSegment = idx;
        _renderGuideStep();
      });

      section.appendChild(segEl);
    });

    // Botões de navegação
    section.appendChild(_buildGuideNav());

    return section;
  }

  function _renderGuideStep() {
    // Re-renderiza só o corpo guiado sem destruir toda a UI
    const existing = _container.querySelector('.reading-guided');
    if (!existing) { _render(); return; }

    const newBody = _buildGuidedBody();
    existing.replaceWith(newBody);
  }

  function _buildGuideNav() {
    const nav = document.createElement('nav');
    nav.className = 'reading-guide-nav';
    nav.setAttribute('aria-label', 'Navegação da leitura guiada');

    const prev = document.createElement('button');
    prev.className = 'btn btn--secondary';
    prev.textContent = 'Anterior';
    prev.disabled = _currentSegment === 0;
    prev.addEventListener('click', () => prevSegment());

    const label = document.createElement('span');
    label.className = 'guide-nav-label';
    const total = _currentText.guided_reading.length;
    label.textContent = `${_currentSegment + 1} / ${total}`;

    const next = document.createElement('button');
    next.className = 'btn btn--primary';
    next.textContent = 'Próximo';
    next.disabled = _currentSegment >= total - 1;
    next.addEventListener('click', () => nextSegment());

    nav.appendChild(prev);
    nav.appendChild(label);
    nav.appendChild(next);
    return nav;
  }

  function _buildKeyTerms() {
    const section = document.createElement('section');
    section.className = 'reading-keyterms';

    const heading = document.createElement('h3');
    heading.className = 'reading-section-title';
    heading.textContent = 'Termos centrais';
    section.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'keyterm-list';

    _currentText.key_terms.forEach(term => {
      const item = document.createElement('li');
      item.className = 'keyterm-item';
      item.textContent = term;
      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  }

  function _buildQuestions() {
    const section = document.createElement('section');
    section.className = 'reading-questions';

    const heading = document.createElement('h3');
    heading.className = 'reading-section-title';
    heading.textContent = 'Questões para reflexão';
    section.appendChild(heading);

    const ol = document.createElement('ol');
    ol.className = 'question-list';

    _currentText.questions.forEach(q => {
      const item = document.createElement('li');
      item.className = 'question-item';
      item.textContent = q;
      ol.appendChild(item);
    });

    section.appendChild(ol);
    return section;
  }

  function _buildControls() {
    const controls = document.createElement('div');
    controls.className = 'reading-controls';

    const guideBtn = document.createElement('button');
    guideBtn.className = 'btn ' + (_guideActive ? 'btn--active' : 'btn--secondary');
    guideBtn.textContent = _guideActive ? 'Leitura livre' : 'Leitura guiada';
    guideBtn.setAttribute('aria-pressed', String(_guideActive));
    guideBtn.addEventListener('click', () => {
      setGuideMode(!_guideActive);
    });

    controls.appendChild(guideBtn);
    return controls;
  }

  /**
   * Envolve ocorrências dos termos-chave em spans destacados.
   * Opera sobre HTML-escaped text para segurança.
   * @param {string} rawText
   * @returns {string} HTML
   */
  function _highlightKeyTerms(rawText) {
    if (!_currentText.key_terms || _currentText.key_terms.length === 0) {
      return UI.escape(rawText);
    }

    let result = UI.escape(rawText);

    _currentText.key_terms.forEach(term => {
      const escapedTerm = UI.escape(term);
      // Case-insensitive, word-boundary para termos simples
      const regex = new RegExp(
        `(${escapedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi'
      );
      result = result.replace(
        regex,
        '<mark class="reading-highlight" tabindex="0" aria-label="Termo central: $1">$1</mark>'
      );
    });

    return result;
  }

  /* ------------------------------------------------------------------
   * Exportação
   * ------------------------------------------------------------------ */
  return {
    init,
    loadText,
    setGuideMode,
    nextSegment,
    prevSegment,
    getCurrentText
  };

})();
