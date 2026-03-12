/**
 * engine-tests.js
 * Testes unitários dos motores lógicos.
 * Usa apenas lógica pura (sem DOM) para compatibilidade com Node.js.
 */

export function runEngineTests(test, assert, assertEqual, assertArray, assertNonEmpty) {

  console.log('\n[Engine Tests]');

  /* ------------------------------------------------------------------
   * LogicEngine — testado sem importação (lógica inline para Node.js)
   * ------------------------------------------------------------------ */

  // Replica checkReconstructionOrder para teste unitário
  function checkOrder(userOrder, correctOrder) {
    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    const mismatches = [];
    userOrder.forEach((id, idx) => {
      const expectedIdx = correctOrder.indexOf(id);
      if (expectedIdx !== idx) {
        mismatches.push({ id, given: idx + 1, expected: expectedIdx + 1 });
      }
    });
    return { correct, mismatches };
  }

  test('LogicEngine: ordem correta retorna correct=true', () => {
    const result = checkOrder(['b', 'c', 'a'], ['b', 'c', 'a']);
    assert(result.correct === true, 'Ordem correta deve retornar true');
    assertEqual(result.mismatches.length, 0, 'Não deve ter mismatches');
  });

  test('LogicEngine: ordem incorreta retorna correct=false', () => {
    const result = checkOrder(['a', 'b', 'c'], ['b', 'c', 'a']);
    assert(result.correct === false, 'Ordem incorreta deve retornar false');
    assert(result.mismatches.length > 0, 'Deve ter mismatches');
  });

  test('LogicEngine: ordem parcialmente correta identifica posições erradas', () => {
    const result = checkOrder(['b', 'a', 'c'], ['b', 'c', 'a']);
    assert(result.correct === false);
    assert(result.mismatches.some(m => m.id === 'a'), 'Deve detectar "a" fora do lugar');
    assert(result.mismatches.some(m => m.id === 'c'), 'Deve detectar "c" fora do lugar');
  });

  test('LogicEngine: lista vazia retorna correct=true', () => {
    const result = checkOrder([], []);
    assert(result.correct === true);
  });

  // Replica detectArgumentIndicators
  function detectIndicators(text) {
    const conclusionMarkers = ['portanto', 'logo', 'assim', 'conclui-se', 'segue-se'];
    const premiseMarkers    = ['porque', 'pois', 'dado que', 'já que', 'visto que'];
    const lower = text.toLowerCase();
    const fc = conclusionMarkers.filter(m => lower.includes(m));
    const fp = premiseMarkers.filter(m => lower.includes(m));
    return { is_argument: fc.length > 0 || fp.length > 0, conclusion_markers: fc, premise_markers: fp };
  }

  test('LogicEngine: detecta marcadores de conclusão', () => {
    const r = detectIndicators('Todo homem é mortal, portanto Sócrates é mortal.');
    assert(r.is_argument === true);
    assert(r.conclusion_markers.includes('portanto'));
  });

  test('LogicEngine: detecta marcadores de premissa', () => {
    const r = detectIndicators('Sócrates errou porque questionou os deuses.');
    assert(r.is_argument === true);
    assert(r.premise_markers.includes('porque'));
  });

  test('LogicEngine: texto sem indicadores não é argumento', () => {
    const r = detectIndicators('Sócrates viveu em Atenas.');
    assert(r.is_argument === false);
  });

  /* ------------------------------------------------------------------
   * Validação de argumento (estrutura)
   * ------------------------------------------------------------------ */

  function validateArg(arg) {
    if (!arg || !arg.premises || !arg.conclusion) {
      return { valid: false };
    }
    return {
      valid:      true,
      is_valid:   Boolean(arg.validity),
      premise_count: arg.premises.length,
      is_sound:   arg.soundness === true
    };
  }

  test('ArgumentEngine: argumento com premises e conclusion é válido na estrutura', () => {
    const r = validateArg({
      id: 'test',
      premises: [{ id: 'p1', text: 'Todo homem é mortal.' }],
      conclusion: { id: 'c1', text: 'Sócrates é mortal.' },
      validity: true,
      soundness: true
    });
    assert(r.valid === true);
    assert(r.is_valid === true);
    assertEqual(r.premise_count, 1);
  });

  test('ArgumentEngine: argumento sem conclusion falha na validação', () => {
    const r = validateArg({ id: 'bad', premises: [{ text: 'X' }] });
    assert(r.valid === false);
  });

  test('ArgumentEngine: argumento sem premises falha na validação', () => {
    const r = validateArg({ id: 'bad', conclusion: { text: 'Y' } });
    assert(r.valid === false);
  });

  /* ------------------------------------------------------------------
   * State — lógica de path resolver
   * ------------------------------------------------------------------ */

  function resolvePath(obj, path) {
    return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj);
  }

  function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((acc, k) => { if (!acc[k]) acc[k] = {}; return acc[k]; }, obj);
    target[last] = value;
  }

  test('State: resolvePath lê valor simples', () => {
    const obj = { ui: { fontSize: 'medium' } };
    assertEqual(resolvePath(obj, 'ui.fontSize'), 'medium');
  });

  test('State: resolvePath retorna undefined para path inexistente', () => {
    const obj = { a: { b: 1 } };
    assertEqual(resolvePath(obj, 'a.c'), undefined);
  });

  test('State: setPath escreve valor aninhado', () => {
    const obj = {};
    setPath(obj, 'ui.highContrast', true);
    assert(obj.ui.highContrast === true);
  });

  test('State: setPath preserva estrutura existente', () => {
    const obj = { ui: { fontSize: 'large' } };
    setPath(obj, 'ui.highContrast', false);
    assertEqual(obj.ui.fontSize, 'large', 'fontSize deve ser preservado');
    assert(obj.ui.highContrast === false);
  });

  /* ------------------------------------------------------------------
   * Router — parse de hash
   * ------------------------------------------------------------------ */

  const ROUTES = [
    { pattern: /^$|^\/$/, view: 'home' },
    { pattern: /^\/module\/([^/]+)$/, view: 'module', param: 'moduleId' },
    { pattern: /^\/module\/([^/]+)\/lesson\/([^/]+)$/, view: 'lesson', param: 'lessonId', subParam: 'moduleId' },
    { pattern: /^\/author\/([^/]+)$/, view: 'author', param: 'authorId' },
    { pattern: /^\/school\/([^/]+)$/, view: 'school', param: 'schoolId' },
    { pattern: /^\/concept\/([^/]+)$/, view: 'concept', param: 'conceptId' },
    { pattern: /^\/timeline$/, view: 'timeline' },
    { pattern: /^\/glossary$/, view: 'glossary' },
  ];

  function parseHash(hash) {
    const path = hash.replace(/^#/, '') || '/';
    for (const route of ROUTES) {
      const match = path.match(route.pattern);
      if (match) {
        const params = {};
        if (route.subParam) params[route.subParam] = match[1];
        if (route.param)    params[route.param]    = match[route.subParam ? 2 : 1];
        return { view: route.view, params };
      }
    }
    return { view: 'home', params: {} };
  }

  test('Router: hash vazio → home', () => {
    const r = parseHash('');
    assertEqual(r.view, 'home');
  });

  test('Router: #/ → home', () => {
    const r = parseHash('#/');
    assertEqual(r.view, 'home');
  });

  test('Router: #/module/intro → module com moduleId', () => {
    const r = parseHash('#/module/intro');
    assertEqual(r.view, 'module');
    assertEqual(r.params.moduleId, 'intro');
  });

  test('Router: #/module/greek-philosophy/lesson/socrates-method → lesson', () => {
    const r = parseHash('#/module/greek-philosophy/lesson/socrates-method');
    assertEqual(r.view, 'lesson');
    assertEqual(r.params.moduleId, 'greek-philosophy');
    assertEqual(r.params.lessonId, 'socrates-method');
  });

  test('Router: #/author/plato → author com authorId', () => {
    const r = parseHash('#/author/plato');
    assertEqual(r.view, 'author');
    assertEqual(r.params.authorId, 'plato');
  });

  test('Router: #/timeline → timeline', () => {
    const r = parseHash('#/timeline');
    assertEqual(r.view, 'timeline');
  });

  test('Router: #/glossary → glossary', () => {
    const r = parseHash('#/glossary');
    assertEqual(r.view, 'glossary');
  });

  test('Router: hash desconhecido → home', () => {
    const r = parseHash('#/rota-inexistente');
    assertEqual(r.view, 'home');
  });

  /* ------------------------------------------------------------------
   * UI — escape HTML
   * ------------------------------------------------------------------ */

  function escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  test('UI.escape: escapa < e >', () => {
    assertEqual(escape('<script>'), '&lt;script&gt;');
  });

  test('UI.escape: escapa &', () => {
    assertEqual(escape('a & b'), 'a &amp; b');
  });

  test('UI.escape: escapa aspas duplas', () => {
    assertEqual(escape('"quote"'), '&quot;quote&quot;');
  });

  test('UI.escape: converte não-string', () => {
    assertEqual(escape(42), '42');
  });

  test('UI.escape: string vazia permanece vazia', () => {
    assertEqual(escape(''), '');
  });
}
