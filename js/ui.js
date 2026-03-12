/**
 * ui.js
 * Utilitários de interface: escape, criação de elementos, loading states,
 * notificações, modais e controles de acessibilidade.
 *
 * Dependências: nenhuma.
 */

export const UI = {

  /* ------------------------------------------------------------------
   * Segurança
   * ------------------------------------------------------------------ */

  /**
   * Escapa uma string para uso seguro como texto HTML.
   * @param {string} str
   * @returns {string}
   */
  escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /* ------------------------------------------------------------------
   * Notificações
   * ------------------------------------------------------------------ */

  /**
   * Exibe uma notificação temporária.
   * @param {string} message
   * @param {'info'|'success'|'warning'|'error'} type
   * @param {number} duration ms
   */
  notify(message, type = 'info', duration = 3500) {
    let container = document.getElementById('ui-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ui-notifications';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const note = document.createElement('div');
    note.className = `notification notification--${type}`;
    note.textContent = message;

    container.appendChild(note);

    // Força reflow para animação
    void note.offsetWidth;
    note.classList.add('notification--visible');

    setTimeout(() => {
      note.classList.remove('notification--visible');
      note.addEventListener('transitionend', () => note.remove(), { once: true });
    }, duration);
  },

  /* ------------------------------------------------------------------
   * Loading
   * ------------------------------------------------------------------ */

  /**
   * Exibe estado de carregamento num contêiner.
   * @param {HTMLElement} container
   * @param {string} message
   */
  showLoading(container, message = 'Carregando...') {
    container.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'loading-state';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', message);

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');

    const text = document.createElement('p');
    text.className = 'loading-text';
    text.textContent = message;

    el.appendChild(spinner);
    el.appendChild(text);
    container.appendChild(el);
  },

  /**
   * Remove estado de carregamento.
   * @param {HTMLElement} container
   */
  hideLoading(container) {
    const el = container.querySelector('.loading-state');
    if (el) el.remove();
  },

  /* ------------------------------------------------------------------
   * Modal
   * ------------------------------------------------------------------ */

  /**
   * Abre um modal com conteúdo arbitrário.
   * @param {string}      title
   * @param {HTMLElement} content
   * @param {Object}      options — { width, onClose }
   * @returns {Function} close — fecha o modal programaticamente
   */
  openModal(title, content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title);

    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    if (options.width) dialog.style.maxWidth = options.width;

    const header = document.createElement('div');
    header.className = 'modal-header';

    const titleEl = document.createElement('h2');
    titleEl.className = 'modal-title';
    titleEl.textContent = title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close btn btn--icon';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Fechar');

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'modal-body';
    body.appendChild(content);

    dialog.appendChild(header);
    dialog.appendChild(body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Foco inicial
    const firstFocusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]');
    if (firstFocusable) firstFocusable.focus();

    // Trap de foco
    const trapFocus = e => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    dialog.addEventListener('keydown', trapFocus);

    const close = () => {
      dialog.removeEventListener('keydown', trapFocus);
      overlay.remove();
      if (options.onClose) options.onClose();
    };

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });

    return close;
  },

  /* ------------------------------------------------------------------
   * Acessibilidade
   * ------------------------------------------------------------------ */

  /**
   * Aplica configuração de tamanho de fonte ao elemento raiz.
   * @param {'small'|'medium'|'large'} size
   */
  setFontSize(size) {
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${size}`);
  },

  /**
   * Aplica ou remove alto contraste.
   * @param {boolean} enabled
   */
  setHighContrast(enabled) {
    document.documentElement.classList.toggle('high-contrast', enabled);
  },

  /* ------------------------------------------------------------------
   * Breadcrumb
   * ------------------------------------------------------------------ */

  /**
   * Renderiza breadcrumb de navegação.
   * @param {Array<{label: string, href?: string}>} crumbs
   * @param {HTMLElement} container
   */
  renderBreadcrumb(crumbs, container) {
    container.innerHTML = '';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Localização atual');

    const ol = document.createElement('ol');
    ol.className = 'breadcrumb';

    crumbs.forEach((crumb, idx) => {
      const li = document.createElement('li');
      li.className = 'breadcrumb-item';

      if (idx === crumbs.length - 1 || !crumb.href) {
        li.setAttribute('aria-current', 'page');
        li.textContent = crumb.label;
      } else {
        const a = document.createElement('a');
        a.href  = crumb.href;
        a.textContent = crumb.label;
        li.appendChild(a);
      }

      ol.appendChild(li);
    });

    nav.appendChild(ol);
    container.appendChild(nav);
  },

  /* ------------------------------------------------------------------
   * Busca / highlight
   * ------------------------------------------------------------------ */

  /**
   * Destaca ocorrências de um termo num elemento de texto.
   * @param {HTMLElement} container
   * @param {string}      term
   */
  highlightSearchTerm(container, term) {
    if (!term || term.length < 2) return;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodes  = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

    nodes.forEach(node => {
      if (!node.textContent.match(regex)) return;
      const span = document.createElement('span');
      span.innerHTML = node.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
      node.parentNode.replaceChild(span, node);
    });
  }
};
