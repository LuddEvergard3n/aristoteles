/**
 * argument-engine.js
 * Responsável pela execução dos exercícios de argumento:
 * marcação de premissas, reconstrução de ordem, comparação de posições.
 *
 * Dependências: logic-engine.js, feedback-engine.js, ui.js
 */

import { LogicEngine }   from './logic-engine.js';
import { FeedbackEngine } from './feedback-engine.js';
import { UI }            from '../js/ui.js';

export const ArgumentEngine = (() => {

  /* ------------------------------------------------------------------
   * Estado de sessão do exercício ativo
   * ------------------------------------------------------------------ */
  let _exercise    = null;  // exercício carregado (exercises.json)
  let _container   = null;  // elemento DOM raiz
  let _userAnswers = {};    // respostas do usuário { itemId: valor }
  let _submitted   = false; // exercício submetido?

  /* ------------------------------------------------------------------
   * API pública
   * ------------------------------------------------------------------ */

  /**
   * Inicializa o motor num contêiner DOM.
   * @param {HTMLElement} container
   */
  function init(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('ArgumentEngine.init: container deve ser HTMLElement');
    }
    _container = container;
  }

  /**
   * Carrega e renderiza um exercício.
   * @param {string}   exerciseId
   * @param {Object[]} exercisesData — array completo de exercises.json
   * @returns {boolean} sucesso
   */
  function loadExercise(exerciseId, exercisesData) {
    const ex = exercisesData.find(e => e.id === exerciseId);
    if (!ex) {
      console.warn(`ArgumentEngine.loadExercise: exercício "${exerciseId}" não encontrado`);
      return false;
    }
    _exercise    = ex;
    _userAnswers = {};
    _submitted   = false;
    _render();
    return true;
  }

  /**
   * Submete as respostas do usuário para avaliação.
   * @returns {Object} resultado da avaliação
   */
  function submit() {
    if (!_exercise || _submitted) return null;
    _submitted = true;

    const result = _evaluate();
    _renderFeedback(result);
    return result;
  }

  /**
   * Reinicia o exercício atual.
   */
  function reset() {
    if (!_exercise) return;
    _userAnswers = {};
    _submitted   = false;
    _render();
  }

  /* ------------------------------------------------------------------
   * Renderização por tipo de exercício
   * ------------------------------------------------------------------ */

  function _render() {
    if (!_container || !_exercise) return;
    _container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = `exercise exercise--${_exercise.type}`;
    wrap.setAttribute('data-exercise-id', _exercise.id);

    wrap.appendChild(_buildExerciseHeader());

    switch (_exercise.type) {
      case 'classify':         wrap.appendChild(_buildClassifyUI());    break;
      case 'mark-premises':    wrap.appendChild(_buildMarkPremisesUI()); break;
      case 'reconstruct':      wrap.appendChild(_buildReconstructUI()); break;
      case 'mapping':          wrap.appendChild(_buildMappingUI());     break;
      case 'comparison':       wrap.appendChild(_buildComparisonUI());  break;
      default:
        wrap.appendChild(_buildUnsupported());
    }

    wrap.appendChild(_buildSubmitBar());
    _container.appendChild(wrap);
  }

  function _buildExerciseHeader() {
    const header = document.createElement('header');
    header.className = 'exercise-header';

    const badge = document.createElement('span');
    badge.className = `exercise-badge exercise-badge--difficulty-${_exercise.difficulty || 1}`;
    badge.textContent = `Nível ${_exercise.difficulty || 1}`;

    const title = document.createElement('h3');
    title.className = 'exercise-title';
    title.textContent = _exercise.title;

    const instruction = document.createElement('p');
    instruction.className = 'exercise-instruction';
    instruction.textContent = _exercise.instruction;

    header.appendChild(badge);
    header.appendChild(title);
    header.appendChild(instruction);
    return header;
  }

  /* Exercício: classificar itens */
  function _buildClassifyUI() {
    const section = document.createElement('div');
    section.className = 'exercise-body';

    _exercise.items.forEach(item => {
      const block = document.createElement('div');
      block.className = 'classify-item';
      block.dataset.id = item.id;

      const text = document.createElement('p');
      text.className = 'classify-text';
      text.textContent = item.text;

      const options = _buildClassifyOptions(item);
      block.appendChild(text);
      block.appendChild(options);
      section.appendChild(block);
    });

    return section;
  }

  function _buildClassifyOptions(item) {
    const group = document.createElement('div');
    group.className = 'classify-options';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', `Classificação para: ${item.text.substring(0, 40)}...`);

    const optionValues = _getClassifyOptions();

    optionValues.forEach(opt => {
      const label = document.createElement('label');
      label.className = 'classify-option';

      const radio = document.createElement('input');
      radio.type  = 'radio';
      radio.name  = `classify-${item.id}`;
      radio.value = opt.value;

      radio.addEventListener('change', () => {
        _userAnswers[item.id] = opt.value;
      });

      label.appendChild(radio);
      label.appendChild(document.createTextNode(' ' + opt.label));
      group.appendChild(label);
    });

    return group;
  }

  function _getClassifyOptions() {
    // Opções de classificação baseadas no tipo/conceitos do exercício
    const concepts = _exercise.concepts || [];
    if (concepts.includes('argumento') && concepts.includes('opinião')) {
      return [
        { value: 'opinião',              label: 'Opinião' },
        { value: 'argumento',            label: 'Argumento' },
        { value: 'argumento incompleto', label: 'Argumento incompleto' }
      ];
    }
    if (concepts.includes('silogismo') && concepts.includes('validade')) {
      return [
        { value: 'válido',               label: 'Válido' },
        { value: 'inválido',             label: 'Inválido' },
        { value: 'válido com premissa falsa', label: 'Válido com premissa falsa' }
      ];
    }
    if (concepts.includes('questão filosófica')) {
      return [
        { value: 'filosófica',           label: 'Filosófica' },
        { value: 'empírica',             label: 'Empírica' },
        { value: 'ambígua',              label: 'Ambígua' }
      ];
    }
    // Fallback genérico
    return [
      { value: 'sim',  label: 'Sim' },
      { value: 'não',  label: 'Não' }
    ];
  }

  /* Exercício: marcar premissas num texto */
  function _buildMarkPremisesUI() {
    const section = document.createElement('div');
    section.className = 'exercise-body';

    const argText = document.createElement('div');
    argText.className = 'argument-text';

    // Divide o argumento em sentenças para seleção
    const sentences = _exercise.argument
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0);

    sentences.forEach((sentence, idx) => {
      const span = document.createElement('span');
      span.className = 'argument-sentence';
      span.dataset.idx = idx;
      span.textContent = sentence + ' ';
      span.setAttribute('role', 'checkbox');
      span.setAttribute('aria-checked', 'false');
      span.setAttribute('tabindex', '0');

      const toggle = () => {
        const isSelected = span.classList.toggle('argument-sentence--selected');
        span.setAttribute('aria-checked', String(isSelected));
        if (isSelected) {
          _userAnswers[`sentence-${idx}`] = sentence;
        } else {
          delete _userAnswers[`sentence-${idx}`];
        }
      };

      span.addEventListener('click', toggle);
      span.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });

      argText.appendChild(span);
    });

    const instruction = document.createElement('p');
    instruction.className = 'mark-instruction';
    instruction.textContent = 'Clique nas sentenças que são premissas do argumento.';

    section.appendChild(instruction);
    section.appendChild(argText);
    return section;
  }

  /* Exercício: reconstruir ordem das premissas */
  function _buildReconstructUI() {
    const section = document.createElement('div');
    section.className = 'exercise-body';

    const list = document.createElement('ol');
    list.className = 'reconstruct-list';
    list.setAttribute('aria-label', 'Organize os elementos do argumento na ordem correta');

    // Embaralha os itens para exibição
    const shuffled = _shuffleArray([..._exercise.items]);

    // Armazena ordem atual como user answer
    _userAnswers.order = shuffled.map(i => i.id);

    shuffled.forEach(item => {
      const li = document.createElement('li');
      li.className = 'reconstruct-item';
      li.dataset.id = item.id;
      li.setAttribute('draggable', 'true');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-grabbed', 'false');

      const grip = document.createElement('span');
      grip.className = 'reconstruct-grip';
      grip.setAttribute('aria-hidden', 'true');
      grip.textContent = '≡';

      const text = document.createElement('span');
      text.className = 'reconstruct-text';
      text.textContent = item.text;

      li.appendChild(grip);
      li.appendChild(text);

      // Botões de mover (acessibilidade + teclado)
      const moveUp = document.createElement('button');
      moveUp.className = 'btn btn--icon';
      moveUp.textContent = '▲';
      moveUp.setAttribute('aria-label', 'Mover para cima');
      moveUp.addEventListener('click', () => _moveItem(list, li, -1));

      const moveDown = document.createElement('button');
      moveDown.className = 'btn btn--icon';
      moveDown.textContent = '▼';
      moveDown.setAttribute('aria-label', 'Mover para baixo');
      moveDown.addEventListener('click', () => _moveItem(list, li, 1));

      li.appendChild(moveUp);
      li.appendChild(moveDown);
      list.appendChild(li);
    });

    _setupDragDrop(list);
    section.appendChild(list);
    return section;
  }

  /* Exercício: mapeamento simbólico */
  function _buildMappingUI() {
    const section = document.createElement('div');
    section.className = 'exercise-body';

    _exercise.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'mapping-row';

      const symbol = document.createElement('span');
      symbol.className = 'mapping-symbol';
      symbol.textContent = item.symbol;

      const arrow = document.createElement('span');
      arrow.className = 'mapping-arrow';
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden', 'true');

      const select = document.createElement('select');
      select.className = 'mapping-select';
      select.setAttribute('aria-label', `Significado de: ${item.symbol}`);

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = '— selecione —';
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);

      item.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        _userAnswers[item.id] = select.value;
      });

      row.appendChild(symbol);
      row.appendChild(arrow);
      row.appendChild(select);
      section.appendChild(row);
    });

    return section;
  }

  /* Exercício: comparação de posições */
  function _buildComparisonUI() {
    const section = document.createElement('div');
    section.className = 'exercise-body';

    _exercise.positions.forEach(pos => {
      const card = document.createElement('div');
      card.className = 'comparison-card';

      const text = document.createElement('blockquote');
      text.className = 'comparison-text';
      text.textContent = pos.text;

      const hint = document.createElement('p');
      hint.className = 'comparison-hint';
      hint.textContent = `Pista: ${pos.author_hint}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'comparison-input';
      input.placeholder = 'Nome do filósofo ou escola...';
      input.setAttribute('aria-label', `Identificar autor da posição ${pos.id}`);

      input.addEventListener('input', () => {
        _userAnswers[`pos-${pos.id}`] = input.value.trim();
      });

      card.appendChild(text);
      card.appendChild(hint);
      card.appendChild(input);
      section.appendChild(card);
    });

    return section;
  }

  function _buildUnsupported() {
    const p = document.createElement('p');
    p.textContent = `Tipo de exercício "${_exercise.type}" não suportado nesta versão.`;
    return p;
  }

  function _buildSubmitBar() {
    const bar = document.createElement('div');
    bar.className = 'exercise-submit-bar';

    const hint = _buildHintButton();
    const submit = document.createElement('button');
    submit.className = 'btn btn--primary';
    submit.textContent = 'Verificar resposta';
    submit.addEventListener('click', () => this.submit ? this.submit() : window._argEngineSubmit?.());

    // Bind direto para evitar problemas de referência
    submit.addEventListener('click', () => {
      if (!_submitted) {
        const result = _evaluateAndShow();
        void result;
      }
    });

    bar.appendChild(hint);
    bar.appendChild(submit);
    return bar;
  }

  function _buildHintButton() {
    if (!_exercise.hint) return document.createDocumentFragment();

    const btn = document.createElement('button');
    btn.className = 'btn btn--secondary';
    btn.textContent = 'Ver dica';
    btn.setAttribute('aria-expanded', 'false');

    const hintPanel = document.createElement('div');
    hintPanel.className = 'hint-panel hint-panel--hidden';
    hintPanel.setAttribute('role', 'alert');
    hintPanel.setAttribute('aria-live', 'polite');
    hintPanel.textContent = _exercise.hint.text;

    btn.addEventListener('click', () => {
      const hidden = hintPanel.classList.toggle('hint-panel--hidden');
      btn.setAttribute('aria-expanded', String(!hidden));
    });

    const wrap = document.createElement('div');
    wrap.className = 'hint-wrap';
    wrap.appendChild(btn);
    wrap.appendChild(hintPanel);
    return wrap;
  }

  /* ------------------------------------------------------------------
   * Avaliação
   * ------------------------------------------------------------------ */

  function _evaluateAndShow() {
    if (_submitted) return;
    _submitted = true;
    const result = _evaluate();
    _renderFeedback(result);
    return result;
  }

  function _evaluate() {
    switch (_exercise.type) {
      case 'classify':      return _evaluateClassify();
      case 'reconstruct':   return _evaluateReconstruct();
      case 'mapping':       return _evaluateMapping();
      case 'mark-premises': return _evaluateMarkPremises();
      case 'comparison':    return _evaluateComparison();
      default:
        return { score: 0, total: 0, items: [], note: 'Tipo de exercício sem avaliação automática.' };
    }
  }

  function _evaluateClassify() {
    let correct = 0;
    const items = _exercise.items.map(item => {
      const given   = _userAnswers[item.id];
      const isRight = given === item.correct;
      if (isRight) correct++;
      return {
        id:          item.id,
        text:        item.text,
        given:       given || '(sem resposta)',
        expected:    item.correct,
        correct:     isRight,
        explanation: item.explanation
      };
    });

    return {
      score:       correct,
      total:       _exercise.items.length,
      percentage:  Math.round((correct / _exercise.items.length) * 100),
      items
    };
  }

  function _evaluateReconstruct() {
    const items = _container.querySelectorAll('.reconstruct-item');
    const givenOrder = Array.from(items).map(el => el.dataset.id);
    const result = LogicEngine.checkReconstructionOrder(givenOrder, _exercise.correct_order);

    return {
      score:      result.correct ? 1 : 0,
      total:      1,
      percentage: result.correct ? 100 : 0,
      correct:    result.correct,
      given:      givenOrder,
      expected:   _exercise.correct_order,
      mismatches: result.mismatches,
      explanation: _exercise.explanation
    };
  }

  function _evaluateMapping() {
    let correct = 0;
    const items = _exercise.items.map(item => {
      const given   = _userAnswers[item.id];
      const isRight = given === _exercise.correct[item.id];
      if (isRight) correct++;
      return {
        id:       item.id,
        symbol:   item.symbol,
        given:    given || '(sem resposta)',
        expected: _exercise.correct[item.id],
        correct:  isRight
      };
    });

    return {
      score:      correct,
      total:      _exercise.items.length,
      percentage: Math.round((correct / _exercise.items.length) * 100),
      items
    };
  }

  function _evaluateMarkPremises() {
    // Heurística: compara sentenças selecionadas com as premissas corretas
    const selected = Object.values(_userAnswers).filter(v => typeof v === 'string');
    const expected = _exercise.correct.premises;
    let matches = 0;
    selected.forEach(s => {
      if (expected.some(e => s.includes(e.substring(0, 20)))) matches++;
    });

    return {
      score:      matches,
      total:      expected.length,
      percentage: expected.length > 0 ? Math.round((matches / expected.length) * 100) : 0,
      selected,
      expected,
      note: _exercise.correct.notes
    };
  }

  function _evaluateComparison() {
    let correct = 0;
    const items = _exercise.positions.map(pos => {
      const given    = (_userAnswers[`pos-${pos.id}`] || '').toLowerCase();
      const expected = pos.correct_author.toLowerCase();
      const isRight  = given.includes(expected) || expected.includes(given);
      if (isRight) correct++;
      return {
        id:       pos.id,
        given:    given || '(sem resposta)',
        expected: pos.correct_author,
        correct:  isRight,
        problem:  pos.problem
      };
    });

    return {
      score:      correct,
      total:      _exercise.positions.length,
      percentage: Math.round((correct / _exercise.positions.length) * 100),
      items
    };
  }

  function _renderFeedback(result) {
    const existing = _container.querySelector('.exercise-feedback');
    if (existing) existing.remove();

    const feedback = FeedbackEngine.buildFeedbackPanel(result, _exercise);
    _container.querySelector('.exercise').appendChild(feedback);

    // Desabilita entradas após submissão
    _container.querySelectorAll('input, select, button:not(.btn--reset)').forEach(el => {
      if (!el.classList.contains('hint-wrap') && el.type !== 'button' || el.classList.contains('btn--primary')) {
        el.disabled = true;
      }
    });

    // Botão de reiniciar
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn--secondary btn--reset';
    resetBtn.textContent = 'Tentar novamente';
    resetBtn.addEventListener('click', () => reset());
    _container.querySelector('.exercise-feedback').appendChild(resetBtn);
  }

  /* ------------------------------------------------------------------
   * Drag & Drop para reconstrução
   * ------------------------------------------------------------------ */

  function _setupDragDrop(list) {
    let dragEl = null;

    list.addEventListener('dragstart', e => {
      dragEl = e.target.closest('.reconstruct-item');
      if (dragEl) {
        dragEl.classList.add('dragging');
        dragEl.setAttribute('aria-grabbed', 'true');
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    list.addEventListener('dragover', e => {
      e.preventDefault();
      const target = e.target.closest('.reconstruct-item');
      if (target && target !== dragEl) {
        const rect   = target.getBoundingClientRect();
        const midY   = rect.top + rect.height / 2;
        const before = e.clientY < midY;
        list.insertBefore(dragEl, before ? target : target.nextSibling);
      }
    });

    list.addEventListener('dragend', () => {
      if (dragEl) {
        dragEl.classList.remove('dragging');
        dragEl.setAttribute('aria-grabbed', 'false');
        dragEl = null;
      }
    });
  }

  function _moveItem(list, item, direction) {
    if (direction === -1 && item.previousElementSibling) {
      list.insertBefore(item, item.previousElementSibling);
    } else if (direction === 1 && item.nextElementSibling) {
      list.insertBefore(item.nextElementSibling, item);
    }
  }

  function _shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ------------------------------------------------------------------
   * Exportação
   * ------------------------------------------------------------------ */
  return { init, loadExercise, submit, reset };

})();
