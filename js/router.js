/**
 * router.js
 * Roteamento client-side baseado em hash para GitHub Pages.
 * Suporta rotas aninhadas: #/module/lesson, #/author/id, etc.
 *
 * Dependências: state.js
 */

import { State } from './state.js';

/* ------------------------------------------------------------------
 * Definição de rotas
 * ------------------------------------------------------------------ */

const ROUTES = [
  { pattern: /^$|^\/$/,                              view: 'home'     },
  { pattern: /^\/module\/([^/]+)$/,                  view: 'module',   param: 'moduleId'  },
  { pattern: /^\/module\/([^/]+)\/lesson\/([^/]+)$/, view: 'lesson',   param: 'lessonId', subParam: 'moduleId' },
  { pattern: /^\/author\/([^/]+)$/,                  view: 'author',   param: 'authorId'  },
  { pattern: /^\/school\/([^/]+)$/,                  view: 'school',   param: 'schoolId'  },
  { pattern: /^\/concept\/([^/]+)$/,                 view: 'concept',  param: 'conceptId' },
  { pattern: /^\/timeline$/,                         view: 'timeline'  },
  { pattern: /^\/glossary$/,                         view: 'glossary'  },
  { pattern: /^\/problem\/([^/]+)$/,                 view: 'problem',  param: 'problemId' },
  { pattern: /^\/search\?q=(.+)$/,                   view: 'search',   param: 'query'     },
  { pattern: /^\/graph$/,                            view: 'graph'     }
];

/* ------------------------------------------------------------------
 * Handlers de rota: devem ser registrados pelo main.js
 * ------------------------------------------------------------------ */

const _handlers = new Map();

/* ------------------------------------------------------------------
 * API pública
 * ------------------------------------------------------------------ */

export const Router = {

  /**
   * Inicializa o roteador e escuta eventos hashchange.
   */
  init() {
    window.addEventListener('hashchange', () => this._dispatch());
    // Rota inicial
    this._dispatch();
  },

  /**
   * Navega para uma rota.
   * @param {string} path — ex: '/module/greek-philosophy'
   */
  navigate(path) {
    window.location.hash = path;
  },

  /**
   * Registra um handler para uma view.
   * @param {string}   view
   * @param {Function} handler  recebe (params)
   */
  on(view, handler) {
    _handlers.set(view, handler);
  },

  /**
   * Retorna a rota atual parseada.
   * @returns {{ view: string, params: Object }}
   */
  current() {
    return _parseHash(window.location.hash);
  },

  /**
   * Constrói href para um autor.
   * @param {string} authorId
   * @returns {string}
   */
  authorHref(authorId) { return `#/author/${authorId}`; },

  /**
   * Constrói href para uma escola.
   * @param {string} schoolId
   * @returns {string}
   */
  schoolHref(schoolId) { return `#/school/${schoolId}`; },

  /**
   * Constrói href para um módulo.
   * @param {string} moduleId
   * @returns {string}
   */
  moduleHref(moduleId) { return `#/module/${moduleId}`; },

  /**
   * Constrói href para uma lição.
   * @param {string} moduleId
   * @param {string} lessonId
   * @returns {string}
   */
  lessonHref(moduleId, lessonId) { return `#/module/${moduleId}/lesson/${lessonId}`; },

  /**
   * Constrói href para um conceito.
   * @param {string} conceptId
   * @returns {string}
   */
  conceptHref(conceptId) { return `#/concept/${conceptId}`; },

  /* ----------------------------------------------------------------
   * Interno
   * ---------------------------------------------------------------- */

  _dispatch() {
    const { view, params } = _parseHash(window.location.hash);
    State.set('currentView', view);

    const handler = _handlers.get(view);
    if (handler) {
      handler(params);
    } else {
      // Fallback para home se view não tem handler registrado
      const homeHandler = _handlers.get('home');
      if (homeHandler) homeHandler({});
    }
  }
};

/* ------------------------------------------------------------------
 * Parsing de hash
 * ------------------------------------------------------------------ */

function _parseHash(hash) {
  // Remove '#' inicial
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
