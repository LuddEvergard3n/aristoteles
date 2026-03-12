/**
 * accessibility.js
 * Controles de acessibilidade: atalhos de teclado, skip links,
 * anúncios para leitores de tela e preferências do usuário.
 *
 * Dependências: state.js, ui.js
 */

import { State } from './state.js';
import { UI }    from './ui.js';

export const Accessibility = {

  /**
   * Inicializa todos os recursos de acessibilidade.
   * Deve ser chamado uma vez, após o DOM estar pronto.
   */
  init() {
    this._insertSkipLink();
    this._applyInitialPreferences();
    this._bindKeyboardShortcuts();
    this._observePreferenceChanges();
  },

  /* ------------------------------------------------------------------
   * Skip link
   * ------------------------------------------------------------------ */

  _insertSkipLink() {
    const link = document.createElement('a');
    link.href      = '#main-content';
    link.className = 'skip-link';
    link.textContent = 'Ir para o conteúdo principal';
    document.body.insertBefore(link, document.body.firstChild);
  },

  /* ------------------------------------------------------------------
   * Preferências iniciais
   * ------------------------------------------------------------------ */

  _applyInitialPreferences() {
    // Respeita preferência do sistema operacional
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      State.set('ui.highContrast', true);
      UI.setHighContrast(true);
    }

    // Aplica tamanho de fonte salvo
    const fontSize = State.get('ui.fontSize') || 'medium';
    UI.setFontSize(fontSize);
  },

  /* ------------------------------------------------------------------
   * Atalhos de teclado
   * ------------------------------------------------------------------ */

  _bindKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Alt+H — home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.hash = '/';
      }

      // Alt+G — glossário
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        window.location.hash = '/glossary';
      }

      // Alt+T — linha do tempo
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        window.location.hash = '/timeline';
      }

      // Alt+P — modo professor
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        const active = State.toggleTeacherMode();
        UI.notify(
          active ? 'Modo professor ativado.' : 'Modo professor desativado.',
          'info'
        );
      }

      // Alt++ e Alt+- — tamanho de fonte
      if (e.altKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        this._increaseFontSize();
      }
      if (e.altKey && e.key === '-') {
        e.preventDefault();
        this._decreaseFontSize();
      }
    });
  },

  /* ------------------------------------------------------------------
   * Tamanho de fonte
   * ------------------------------------------------------------------ */

  _increaseFontSize() {
    const sizes  = ['small', 'medium', 'large'];
    const current = State.get('ui.fontSize') || 'medium';
    const idx     = sizes.indexOf(current);
    if (idx < sizes.length - 1) {
      const next = sizes[idx + 1];
      State.set('ui.fontSize', next);
      UI.setFontSize(next);
    }
  },

  _decreaseFontSize() {
    const sizes  = ['small', 'medium', 'large'];
    const current = State.get('ui.fontSize') || 'medium';
    const idx     = sizes.indexOf(current);
    if (idx > 0) {
      const prev = sizes[idx - 1];
      State.set('ui.fontSize', prev);
      UI.setFontSize(prev);
    }
  },

  /* ------------------------------------------------------------------
   * Observar mudanças de preferência via State
   * ------------------------------------------------------------------ */

  _observePreferenceChanges() {
    State.subscribe(({ value }) => UI.setHighContrast(value), 'ui.highContrast');
    State.subscribe(({ value }) => UI.setFontSize(value),    'ui.fontSize');
  },

  /* ------------------------------------------------------------------
   * Anúncio para leitores de tela
   * ------------------------------------------------------------------ */

  /**
   * Anuncia uma mensagem para leitores de tela via aria-live.
   * @param {string} message
   * @param {'polite'|'assertive'} priority
   */
  announce(message, priority = 'polite') {
    let region = document.getElementById(`aria-${priority}`);
    if (!region) {
      region = document.createElement('div');
      region.id            = `aria-${priority}`;
      region.className     = 'sr-only';
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      document.body.appendChild(region);
    }
    // Limpa e reatribui para garantir reanúncio
    region.textContent = '';
    requestAnimationFrame(() => { region.textContent = message; });
  }
};
