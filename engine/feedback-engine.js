/**
 * feedback-engine.js
 * Gera painéis de feedback estruturado para exercícios.
 * Sem estado persistente — funções puras de construção de DOM.
 */

export const FeedbackEngine = (() => {

  /**
   * Constrói o elemento de feedback para um resultado de exercício.
   * @param {Object} result  — retorno de _evaluate() no argument-engine
   * @param {Object} exercise — exercício completo (para explanation)
   * @returns {HTMLElement}
   */
  function buildFeedbackPanel(result, exercise) {
    const panel = document.createElement('div');
    panel.className = 'exercise-feedback';
    panel.setAttribute('role', 'alert');
    panel.setAttribute('aria-live', 'polite');

    // Cabeçalho com pontuação
    const header = document.createElement('div');
    header.className = 'feedback-header';

    const scoreClass = result.percentage >= 70
      ? 'feedback-score--good'
      : result.percentage >= 40
        ? 'feedback-score--partial'
        : 'feedback-score--low';

    const score = document.createElement('span');
    score.className = `feedback-score ${scoreClass}`;
    score.textContent = result.percentage != null
      ? `${result.score} / ${result.total}`
      : 'Resultado';

    const message = document.createElement('p');
    message.className = 'feedback-message';
    message.textContent = _getMessage(result);

    header.appendChild(score);
    header.appendChild(message);
    panel.appendChild(header);

    // Detalhes por item
    if (result.items && result.items.length > 0) {
      panel.appendChild(_buildItemDetails(result.items, exercise));
    }

    // Nota geral do exercício
    if (exercise && exercise.explanation) {
      const note = document.createElement('div');
      note.className = 'feedback-explanation';

      const noteTitle = document.createElement('strong');
      noteTitle.textContent = 'Explicação:';
      note.appendChild(noteTitle);

      const noteText = document.createElement('p');
      noteText.textContent = exercise.explanation;
      note.appendChild(noteText);

      panel.appendChild(note);
    }

    // Nota adicional do resultado
    if (result.note) {
      const extra = document.createElement('p');
      extra.className = 'feedback-note';
      extra.textContent = result.note;
      panel.appendChild(extra);
    }

    return panel;
  }

  function _getMessage(result) {
    if (result.percentage == null) return result.note || '';
    if (result.percentage === 100) return 'Excelente. Todas as respostas estão corretas.';
    if (result.percentage >= 70)  return 'Bom desempenho. Revise os itens assinalados.';
    if (result.percentage >= 40)  return 'Metade do caminho. Releia o texto antes de tentar novamente.';
    return 'Recomenda-se rever o conceito e a leitura guiada antes de tentar novamente.';
  }

  function _buildItemDetails(items, exercise) {
    const list = document.createElement('ul');
    list.className = 'feedback-items';

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'feedback-item ' + (item.correct ? 'feedback-item--correct' : 'feedback-item--wrong');

      const icon = document.createElement('span');
      icon.className = 'feedback-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.correct ? '✓' : '✗';

      const body = document.createElement('div');
      body.className = 'feedback-item-body';

      if (item.text) {
        const text = document.createElement('p');
        text.className = 'feedback-item-text';
        text.textContent = item.text;
        body.appendChild(text);
      }

      if (!item.correct) {
        const given = document.createElement('p');
        given.className = 'feedback-given';
        given.innerHTML = `<span>Sua resposta:</span> ${escapeHTML(item.given || '(sem resposta)')}`;

        const expected = document.createElement('p');
        expected.className = 'feedback-expected';
        expected.innerHTML = `<span>Esperado:</span> ${escapeHTML(String(item.expected || ''))}`;

        body.appendChild(given);
        body.appendChild(expected);
      }

      if (item.explanation) {
        const expl = document.createElement('p');
        expl.className = 'feedback-item-explanation';
        expl.textContent = item.explanation;
        body.appendChild(expl);
      }

      if (item.problem) {
        const prob = document.createElement('p');
        prob.className = 'feedback-item-problem';
        prob.textContent = `Problema filosófico: ${item.problem}`;
        body.appendChild(prob);
      }

      li.appendChild(icon);
      li.appendChild(body);
      list.appendChild(li);
    });

    return list;
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { buildFeedbackPanel };
})();

/* ====================================================================
 * hint-system.js
 * Gerencia dicas progressivas sem entregar a resposta.
 * ==================================================================== */

export const HintSystem = (() => {

  /**
   * Retorna a dica de um exercício no formato adequado ao seu tipo.
   * @param {Object} exercise
   * @returns {Object} { type, text, visual }
   */
  function getHint(exercise) {
    if (!exercise || !exercise.hint) {
      return { type: 'text', text: 'Sem dica disponível para este exercício.' };
    }
    return { ...exercise.hint };
  }

  /**
   * Constrói elemento DOM da dica.
   * @param {Object} hint
   * @returns {HTMLElement}
   */
  function buildHintElement(hint) {
    const el = document.createElement('div');
    el.className = `hint hint--${hint.type || 'text'}`;
    el.setAttribute('role', 'note');

    const label = document.createElement('span');
    label.className = 'hint-label';
    label.textContent = 'Dica:';

    const text = document.createElement('p');
    text.className = 'hint-text';
    text.textContent = hint.text;

    el.appendChild(label);
    el.appendChild(text);
    return el;
  }

  return { getHint, buildHintElement };
})();

/* ====================================================================
 * comparison-engine.js
 * Compara autores, escolas e correntes numa estrutura tabular.
 * ==================================================================== */

export const ComparisonEngine = (() => {

  /**
   * Compara dois ou mais autores nos conceitos especificados.
   * @param {string[]}  authorIds    — ids de autores
   * @param {Object[]}  authorsData  — authors.json
   * @param {string[]}  dimensions   — campos a comparar
   * @returns {Object} tabela de comparação
   */
  function compareAuthors(authorIds, authorsData, dimensions) {
    const authors = authorIds
      .map(id => authorsData.find(a => a.id === id))
      .filter(Boolean);

    if (authors.length === 0) return { error: 'Nenhum autor encontrado.' };

    const rows = dimensions.map(dim => {
      const row = { dimension: dim, cells: {} };
      authors.forEach(author => {
        row.cells[author.id] = _extractDimension(author, dim);
      });
      return row;
    });

    return {
      authors: authors.map(a => ({ id: a.id, name: a.name, period: a.period })),
      rows
    };
  }

  /**
   * Compara escolas em dimensões especificadas.
   * @param {string[]}  schoolIds
   * @param {Object[]}  schoolsData
   * @param {string[]}  dimensions
   * @returns {Object}
   */
  function compareSchools(schoolIds, schoolsData, dimensions) {
    const schools = schoolIds
      .map(id => schoolsData.find(s => s.id === id))
      .filter(Boolean);

    if (schools.length === 0) return { error: 'Nenhuma escola encontrada.' };

    const rows = dimensions.map(dim => {
      const row = { dimension: dim, cells: {} };
      schools.forEach(school => {
        row.cells[school.id] = _extractDimension(school, dim);
      });
      return row;
    });

    return {
      schools: schools.map(s => ({ id: s.id, name: s.name, era: s.era })),
      rows
    };
  }

  /**
   * Constrói tabela DOM a partir de uma comparação.
   * @param {Object} comparison — retorno de compareAuthors / compareSchools
   * @returns {HTMLElement}
   */
  function buildComparisonTable(comparison) {
    if (comparison.error) {
      const p = document.createElement('p');
      p.textContent = comparison.error;
      return p;
    }

    const entities = comparison.authors || comparison.schools || [];

    const table = document.createElement('table');
    table.className = 'comparison-table';
    table.setAttribute('role', 'table');

    // Cabeçalho
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const dimTh = document.createElement('th');
    dimTh.scope = 'col';
    dimTh.textContent = 'Dimensão';
    headerRow.appendChild(dimTh);

    entities.forEach(entity => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = entity.name;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corpo
    const tbody = document.createElement('tbody');
    comparison.rows.forEach(row => {
      const tr = document.createElement('tr');

      const dimTd = document.createElement('th');
      dimTd.scope = 'row';
      dimTd.className = 'comparison-dimension';
      dimTd.textContent = row.dimension;
      tr.appendChild(dimTd);

      entities.forEach(entity => {
        const td = document.createElement('td');
        td.className = 'comparison-cell';
        const value = row.cells[entity.id];
        td.textContent = Array.isArray(value) ? value.join(', ') : (value || '—');
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
  }

  function _extractDimension(obj, dim) {
    switch (dim) {
      case 'período':      return obj.period || obj.era || '—';
      case 'método':       return obj.method || '—';
      case 'escola':       return obj.school || '—';
      case 'conceitos':    return obj.concepts || [];
      case 'problemas':    return obj.core_questions || obj.problems || [];
      case 'obras':        return obj.works || [];
      case 'ideia central': return obj.key_ideas ? obj.key_ideas[0] : (obj.summary || '—');
      case 'resumo':       return obj.summary || '—';
      default:             return obj[dim] || '—';
    }
  }

  return { compareAuthors, compareSchools, buildComparisonTable };
})();

/* ====================================================================
 * timeline-engine.js
 * Responsável pela linha do tempo interativa de filósofos e escolas.
 * ==================================================================== */

export const TimelineEngine = (() => {

  // Constantes de layout
  const CANVAS_HEIGHT  = 120;   // px por linha de era
  const YEAR_MIN       = -650;
  const YEAR_MAX       = 2000;
  const YEAR_RANGE     = YEAR_MAX - YEAR_MIN;

  /**
   * Inicializa e renderiza a linha do tempo num contêiner.
   * @param {HTMLElement} container
   * @param {Object[]}    timelineData — timeline.json
   * @param {Object}      options      — { filterEra, highlightId }
   */
  function render(container, timelineData, options = {}) {
    if (!(container instanceof HTMLElement)) return;
    container.innerHTML = '';

    const data = options.filterEra
      ? timelineData.filter(e => e.era === options.filterEra)
      : timelineData;

    if (data.length === 0) {
      container.textContent = 'Nenhum dado para o filtro selecionado.';
      return;
    }

    // Eras presentes
    const eras = [...new Set(data.map(e => e.era))];

    const wrap = document.createElement('div');
    wrap.className = 'timeline-wrap';

    // Controles de filtro
    wrap.appendChild(_buildEraFilter(timelineData, container, options));

    // Linha do tempo visual
    const track = document.createElement('div');
    track.className = 'timeline-track';
    track.setAttribute('role', 'list');
    track.setAttribute('aria-label', 'Linha do tempo filosófica');

    eras.forEach(era => {
      const eraItems = data.filter(e => e.era === era);
      track.appendChild(_buildEraRow(era, eraItems, options.highlightId));
    });

    wrap.appendChild(track);

    // Régua de datas
    wrap.appendChild(_buildRuler(data));

    container.appendChild(wrap);
  }

  function _buildEraFilter(allData, container, currentOptions) {
    const eras = [...new Set(allData.map(e => e.era))];

    const controls = document.createElement('div');
    controls.className = 'timeline-controls';

    const label = document.createElement('span');
    label.className = 'timeline-filter-label';
    label.textContent = 'Filtrar por época:';

    const select = document.createElement('select');
    select.className = 'timeline-filter-select';
    select.setAttribute('aria-label', 'Filtrar linha do tempo por época');

    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Todas as épocas';
    select.appendChild(allOption);

    eras.forEach(era => {
      const opt = document.createElement('option');
      opt.value = era;
      opt.textContent = era;
      if (currentOptions.filterEra === era) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      render(container, allData, {
        ...currentOptions,
        filterEra: select.value || undefined
      });
    });

    controls.appendChild(label);
    controls.appendChild(select);
    return controls;
  }

  function _buildEraRow(era, items, highlightId) {
    const row = document.createElement('div');
    row.className = 'timeline-era-row';

    const eraLabel = document.createElement('div');
    eraLabel.className = 'timeline-era-label';
    eraLabel.textContent = era;

    const strip = document.createElement('div');
    strip.className = 'timeline-strip';

    items.forEach(entry => {
      strip.appendChild(_buildEntry(entry, highlightId));
    });

    row.appendChild(eraLabel);
    row.appendChild(strip);
    return row;
  }

  function _buildEntry(entry, highlightId) {
    const el = document.createElement('div');
    el.className = 'timeline-entry' + (entry.id === highlightId ? ' timeline-entry--highlighted' : '');
    el.setAttribute('role', 'listitem');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `${entry.name}, ${_formatYear(entry.year)}`);

    const yearLabel = document.createElement('span');
    yearLabel.className = 'timeline-year';
    yearLabel.textContent = _formatYear(entry.year);

    const name = document.createElement('span');
    name.className = 'timeline-name';
    name.textContent = entry.name;

    const school = document.createElement('span');
    school.className = 'timeline-school';
    school.textContent = entry.school || '';

    // Tooltip com summary
    el.title = entry.summary || entry.name;

    el.appendChild(yearLabel);
    el.appendChild(name);
    el.appendChild(school);

    // Painel expandido ao clicar
    el.addEventListener('click', () => _toggleDetail(el, entry));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _toggleDetail(el, entry); }
    });

    return el;
  }

  function _toggleDetail(el, entry) {
    const existing = el.querySelector('.timeline-detail');
    if (existing) {
      existing.remove();
      el.setAttribute('aria-expanded', 'false');
      return;
    }

    const detail = document.createElement('div');
    detail.className = 'timeline-detail';

    const summary = document.createElement('p');
    summary.className = 'timeline-detail-summary';
    summary.textContent = entry.summary || '';

    const sig = document.createElement('p');
    sig.className = 'timeline-detail-significance';
    sig.textContent = entry.significance || '';

    detail.appendChild(summary);
    if (entry.significance) detail.appendChild(sig);

    el.appendChild(detail);
    el.setAttribute('aria-expanded', 'true');
  }

  function _buildRuler(data) {
    const ruler = document.createElement('div');
    ruler.className = 'timeline-ruler';
    ruler.setAttribute('aria-hidden', 'true');

    const centuries = [];
    const startCentury = Math.floor(Math.min(...data.map(e => e.year)) / 100) * 100;
    const endCentury   = Math.ceil( Math.max(...data.map(e => e.year)) / 100) * 100;

    for (let c = startCentury; c <= endCentury; c += 100) {
      centuries.push(c);
    }

    centuries.forEach(c => {
      const mark = document.createElement('span');
      mark.className = 'timeline-ruler-mark';
      mark.textContent = _formatYear(c);
      ruler.appendChild(mark);
    });

    return ruler;
  }

  function _formatYear(year) {
    if (year === 0) return '0';
    return year < 0 ? `${Math.abs(year)} a.C.` : `${year} d.C.`;
  }

  return { render };
})();
