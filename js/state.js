/**
 * state.js
 * Gerenciamento de estado global da aplicação.
 * Padrão: módulo singleton com EventTarget para notificações.
 *
 * Não usa localStorage — estado em memória por sessão.
 * Dependências: nenhuma.
 */

const _bus = new EventTarget();

const _state = {
  // Módulo e lição ativos
  currentModule:  null,   // id do módulo
  currentLesson:  null,   // id da lição
  currentView:    'home', // 'home' | 'module' | 'lesson' | 'author' | 'school' | 'concept' | 'timeline' | 'glossary'

  // Dados carregados (cacheados após fetch)
  data: {
    modules:   null,
    authors:   null,
    schools:   null,
    concepts:  null,
    texts:     null,
    lessons:   null,
    exercises: null,
    arguments: null,
    timeline:  null,
    currents:  null
  },

  // Progresso do usuário (em memória)
  progress: {
    completedLessons:  [],  // string[]
    completedExercises: {}, // exerciseId -> { score, date }
    visitedAuthors:    [],
    visitedSchools:    []
  },

  // Configurações de interface
  ui: {
    fontSize:         'medium',  // 'small' | 'medium' | 'large'
    highContrast:     false,
    teacherMode:      false,
    lastQuery:        ''         // última busca no glossário
  }
};

/* ------------------------------------------------------------------
 * API pública
 * ------------------------------------------------------------------ */

export const State = {

  /**
   * Lê um valor do estado por caminho de chaves (ex: 'ui.fontSize').
   * @param {string} path
   * @returns {*}
   */
  get(path) {
    return _resolvePath(_state, path);
  },

  /**
   * Define um valor no estado por caminho.
   * Emite evento 'state:change' com { path, value, prev }.
   * @param {string} path
   * @param {*}      value
   */
  set(path, value) {
    const prev = _resolvePath(_state, path);
    _setPath(_state, path, value);
    _bus.dispatchEvent(
      Object.assign(new Event('state:change'), { detail: { path, value, prev } })
    );
  },

  /**
   * Registra listener para mudanças de estado.
   * @param {Function} handler  recebe { path, value, prev }
   * @param {string|null} pathFilter  — se fornecido, filtra por path
   * @returns {Function} unsubscribe
   */
  subscribe(handler, pathFilter = null) {
    const listener = e => {
      if (!pathFilter || e.detail.path === pathFilter) {
        handler(e.detail);
      }
    };
    _bus.addEventListener('state:change', listener);
    return () => _bus.removeEventListener('state:change', listener);
  },

  /**
   * Armazena dados carregados no cache.
   * @param {string}   key  — chave em state.data
   * @param {*}        data
   */
  cacheData(key, data) {
    _state.data[key] = data;
  },

  /**
   * Retorna dados do cache.
   * @param {string} key
   * @returns {*|null}
   */
  getData(key) {
    return _state.data[key] || null;
  },

  /**
   * Verifica se todos os dados obrigatórios estão carregados.
   * @returns {boolean}
   */
  isDataReady() {
    const required = ['modules', 'authors', 'schools', 'concepts', 'texts', 'lessons', 'exercises'];
    return required.every(k => _state.data[k] !== null);
  },

  /**
   * Marca uma lição como completada.
   * @param {string} lessonId
   */
  completeLesson(lessonId) {
    if (!_state.progress.completedLessons.includes(lessonId)) {
      _state.progress.completedLessons.push(lessonId);
      this.set('currentLesson', lessonId);
    }
  },

  /**
   * Registra resultado de exercício.
   * @param {string} exerciseId
   * @param {Object} result  — { score, total, percentage }
   */
  recordExercise(exerciseId, result) {
    _state.progress.completedExercises[exerciseId] = {
      ...result,
      date: new Date().toISOString()
    };
  },

  /**
   * Alterna o modo professor.
   */
  toggleTeacherMode() {
    const current = _state.ui.teacherMode;
    this.set('ui.teacherMode', !current);
    return !current;
  },

  /**
   * Lê o estado completo (apenas para debug/testes).
   * @returns {Object}
   */
  _dump() {
    return JSON.parse(JSON.stringify(_state, (_, v) =>
      typeof v === 'function' ? '[Function]' : v
    ));
  }
};

/* ------------------------------------------------------------------
 * Funções auxiliares internas
 * ------------------------------------------------------------------ */

function _resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

function _setPath(obj, path, value) {
  const keys = path.split('.');
  const last  = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (acc[key] == null) acc[key] = {};
    return acc[key];
  }, obj);
  target[last] = value;
}
