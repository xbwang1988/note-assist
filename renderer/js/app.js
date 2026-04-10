/**
 * 云笔记 - App 类核心
 */
class App {
  constructor() {
    this.store = new Store();
    this.currentView = { type: 'all' };
    this.currentNoteId = null;
    this.currentEditorType = 'richtext';
    this.saveTimer = null;
    this.calendarDate = new Date();
    this.calendarSelectedDate = null;
    this.contextNoteId = null;

    this.init();
  }

  init() {
    this.applyTheme(this.store.getSetting('theme'));
    this.setupMarked();
    this.bindEvents();
    this.initImageResize();
    this.renderSidebar();
    this.renderNoteList();
    this.updateStats();
  }

  // --- Marked.js Configuration ---
  setupMarked() {
    if (typeof marked === 'undefined') return;

    marked.setOptions({
      highlight: function (code, lang) {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try { return hljs.highlight(code, { language: lang }).value; } catch (e) {}
        }
        return code;
      },
      breaks: true,
      gfm: true
    });

    const renderer = new marked.Renderer();
    const origListItem = renderer.listitem;
    renderer.listitem = function (opts) {
      const text = typeof opts === 'object' ? opts.text : opts;
      if (typeof text === 'string' && text.startsWith('<input type="checkbox"')) {
        return `<li class="task-list-item">${text}</li>\n`;
      }
      if (typeof origListItem === 'function') {
        return origListItem.call(this, opts);
      }
      return `<li>${text}</li>\n`;
    };

    renderer.paragraph = function (opts) {
      let text = typeof opts === 'object' ? opts.text : opts;
      if (typeof text !== 'string') text = String(text);
      text = text.replace(/\$\$(.+?)\$\$/g, (_, expr) => {
        try {
          return katex.renderToString(expr, { displayMode: true, throwOnError: false });
        } catch (e) { return expr; }
      });
      text = text.replace(/\$(.+?)\$/g, (_, expr) => {
        try {
          return katex.renderToString(expr, { displayMode: false, throwOnError: false });
        } catch (e) { return expr; }
      });
      return `<p>${text}</p>\n`;
    };

    marked.use({ renderer });
  }

  // 面板拖拽缩放通用方法
  setupPanelResizer(resizerEl, panelEl, minW, maxW) {
    let dragging = false;
    resizerEl.addEventListener('mousedown', (e) => {
      if (panelEl.classList.contains('collapsed')) return;
      dragging = true;
      resizerEl.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = panelEl.getBoundingClientRect();
      const newWidth = Math.min(maxW, Math.max(minW, e.clientX - rect.left));
      panelEl.style.width = newWidth + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      resizerEl.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }
}
