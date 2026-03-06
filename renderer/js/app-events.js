/**
 * 云笔记 - 事件绑定
 */
App.prototype.bindEvents = function() {
  const self = this;

  // Theme toggle
  document.getElementById('btnThemeToggle').addEventListener('click', () => self.toggleTheme());

  // Sidebar collapse / expand
  document.getElementById('btnCollapseSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('collapsed');
  });
  document.getElementById('btnExpandSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('collapsed');
  });

  // Panel resize drag (sidebar + note list)
  this.setupPanelResizer(
    document.getElementById('sidebarResizer'),
    document.getElementById('sidebar'),
    180, 500
  );
  this.setupPanelResizer(
    document.getElementById('notelistResizer'),
    document.getElementById('noteListPanel'),
    200, 600
  );

  // Search
  const searchInput = document.getElementById('globalSearch');
  searchInput.addEventListener('input', Utils.debounce(() => {
    const q = searchInput.value.trim();
    if (q) {
      self.currentView = { type: 'search', search: q };
      document.getElementById('currentViewTitle').textContent = `搜索: ${q}`;
    } else {
      self.currentView = { type: 'all' };
      document.getElementById('currentViewTitle').textContent = '全部笔记';
    }
    self.renderNoteList();
  }, 300));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      self.createNewNote();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      self.saveCurrentNote();
      self.showToast('已保存', 'success');
    }
  });

  // New note buttons
  document.getElementById('btnNewNoteSidebar').addEventListener('click', () => self.createNewNote());
  document.getElementById('btnNewNoteEmpty').addEventListener('click', () => self.createNewNote());

  // 桌面便签按钮
  document.getElementById('btnStickyNote').addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.openSticky) {
      window.electronAPI.openSticky();
    } else {
      self.showToast('桌面便签仅在客户端中可用', 'info');
    }
  });

  // Navigation items
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      if (view === 'sticky') return;
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.notebook-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tag-chip').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      self.currentView = { type: view };
      document.getElementById('currentViewTitle').textContent = item.querySelector('.nav-text').textContent;

      const noteList = document.getElementById('noteList');
      const calendarView = document.getElementById('calendarView');
      const templateView = document.getElementById('templateView');

      noteList.style.display = '';
      calendarView.style.display = 'none';
      templateView.style.display = 'none';

      if (view === 'calendar') {
        noteList.style.display = 'none';
        calendarView.style.display = '';
        self.renderCalendar();
      } else if (view === 'templates') {
        noteList.style.display = 'none';
        templateView.style.display = '';
        self.renderTemplates();
      } else {
        self.renderNoteList();
      }
    });
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    self.store.setSetting('sortBy', e.target.value);
    self.renderNoteList();
  });

  // List/Grid view
  document.getElementById('btnListView').addEventListener('click', () => {
    self.store.setSetting('listView', 'list');
    document.getElementById('noteList').classList.remove('grid-view');
  });
  document.getElementById('btnGridView').addEventListener('click', () => {
    self.store.setSetting('listView', 'grid');
    document.getElementById('noteList').classList.add('grid-view');
  });

  // Add notebook
  document.getElementById('btnAddNotebook').addEventListener('click', () => self.showNotebookModal());
  document.getElementById('btnConfirmNotebook').addEventListener('click', () => self.confirmNotebookModal());

  // Editor type toggle
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      self.switchEditorType(type);
    });
  });

  // Rich text toolbar
  document.getElementById('richToolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn');
    if (btn) self.handleToolbarCommand(btn.dataset.cmd);
  });

  // Heading select
  document.getElementById('headingSelect').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val) {
      document.execCommand('formatBlock', false, val);
    } else {
      document.execCommand('formatBlock', false, 'p');
    }
    e.target.value = '';
  });

  // Font color
  document.getElementById('fontColor').addEventListener('input', (e) => {
    document.execCommand('foreColor', false, e.target.value);
  });

  // Background color
  document.getElementById('bgColor').addEventListener('input', (e) => {
    document.execCommand('hiliteColor', false, e.target.value);
  });

  // Markdown toolbar
  document.getElementById('mdToolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn');
    if (btn && btn.dataset.md) self.handleMdCommand(btn.dataset.md);
  });

  // Rich text content changes
  const editorContent = document.getElementById('editorContent');
  editorContent.addEventListener('input', Utils.debounce(() => self.onContentChange(), 500));

  // 光标位置变化时更新工具栏标题层级显示
  document.addEventListener('selectionchange', () => {
    self.updateHeadingSelect();
  });

  // Rich text keyboard shortcuts
  editorContent.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey;

    // Tab 缩进 / Shift+Tab 反缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent', false, null);
      } else {
        document.execCommand('indent', false, null);
      }
      self.onContentChange();
      return;
    }

    // Ctrl+Shift+S — 删除线
    if (ctrl && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      document.execCommand('strikeThrough', false, null);
      self.onContentChange();
      return;
    }

    // Ctrl+Shift+X — 删除线（备用）
    if (ctrl && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      document.execCommand('strikeThrough', false, null);
      self.onContentChange();
      return;
    }

    // Ctrl+Shift+H — 高亮
    if (ctrl && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      document.execCommand('hiliteColor', false, '#fef08a');
      self.onContentChange();
      return;
    }

    // Ctrl+Shift+7 — 有序列表
    if (ctrl && e.shiftKey && e.key === '7') {
      e.preventDefault();
      document.execCommand('insertOrderedList', false, null);
      self.onContentChange();
      return;
    }

    // Ctrl+Shift+8 — 无序列表
    if (ctrl && e.shiftKey && e.key === '8') {
      e.preventDefault();
      document.execCommand('insertUnorderedList', false, null);
      self.onContentChange();
      return;
    }

    // Ctrl+Shift+9 — 引用块
    if (ctrl && e.shiftKey && e.key === '9') {
      e.preventDefault();
      document.execCommand('formatBlock', false, 'blockquote');
      self.onContentChange();
      return;
    }

    // Ctrl+E — 居中对齐
    if (ctrl && e.key === 'e') {
      e.preventDefault();
      document.execCommand('justifyCenter', false, null);
      self.onContentChange();
      return;
    }

    // Ctrl+L — 左对齐
    if (ctrl && e.key === 'l') {
      e.preventDefault();
      document.execCommand('justifyLeft', false, null);
      self.onContentChange();
      return;
    }

    // Ctrl+R — 右对齐
    if (ctrl && e.key === 'r') {
      e.preventDefault();
      document.execCommand('justifyRight', false, null);
      self.onContentChange();
      return;
    }

    // Ctrl+1~6 — 标题层级
    if (ctrl && e.key >= '1' && e.key <= '6') {
      e.preventDefault();
      document.execCommand('formatBlock', false, 'h' + e.key);
      self.onContentChange();
      return;
    }

    // Ctrl+0 — 恢复正文
    if (ctrl && e.key === '0') {
      e.preventDefault();
      document.execCommand('formatBlock', false, 'p');
      self.onContentChange();
      return;
    }

    // Escape — 取消焦点
    if (e.key === 'Escape') {
      e.preventDefault();
      editorContent.blur();
      return;
    }
  });

  // Handle todo checkbox clicks
  editorContent.addEventListener('click', (e) => {
    if (e.target.type === 'checkbox') {
      const todoItem = e.target.closest('.todo-item');
      if (todoItem) {
        todoItem.classList.toggle('done', e.target.checked);
      }
      setTimeout(() => self.onContentChange(), 100);
    }
  });

  // Markdown input changes
  document.getElementById('mdInput').addEventListener('input', Utils.debounce(() => {
    self.renderMarkdownPreview();
    self.onContentChange();
  }, 300));

  // Markdown keyboard shortcuts
  const mdInput = document.getElementById('mdInput');
  mdInput.addEventListener('keydown', (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const ctrl = e.ctrlKey || e.metaKey;
    const selected = textarea.value.substring(start, end);

    // Tab 缩进 / Shift+Tab 反缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        const before = textarea.value.substring(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        const line = textarea.value.substring(lineStart);
        if (line.startsWith('  ')) {
          textarea.value = textarea.value.substring(0, lineStart) + line.substring(2);
          textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 2);
        }
      } else {
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Ctrl+B — 加粗
    if (ctrl && e.key === 'b') {
      e.preventDefault();
      const wrap = `**${selected || '粗体'}**`;
      textarea.value = textarea.value.substring(0, start) + wrap + textarea.value.substring(end);
      textarea.selectionStart = start + 2;
      textarea.selectionEnd = start + wrap.length - 2;
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Ctrl+I — 斜体
    if (ctrl && e.key === 'i') {
      e.preventDefault();
      const wrap = `*${selected || '斜体'}*`;
      textarea.value = textarea.value.substring(0, start) + wrap + textarea.value.substring(end);
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + wrap.length - 1;
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Ctrl+Shift+S — 删除线
    if (ctrl && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      const wrap = `~~${selected || '删除线'}~~`;
      textarea.value = textarea.value.substring(0, start) + wrap + textarea.value.substring(end);
      textarea.selectionStart = start + 2;
      textarea.selectionEnd = start + wrap.length - 2;
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Ctrl+` — 行内代码
    if (ctrl && e.key === '`') {
      e.preventDefault();
      const wrap = '`' + (selected || '代码') + '`';
      textarea.value = textarea.value.substring(0, start) + wrap + textarea.value.substring(end);
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + wrap.length - 1;
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Ctrl+K — 插入链接
    if (ctrl && e.key === 'k') {
      e.preventDefault();
      const wrap = `[${selected || '链接文字'}](url)`;
      textarea.value = textarea.value.substring(0, start) + wrap + textarea.value.substring(end);
      textarea.selectionStart = start;
      textarea.selectionEnd = start + wrap.length;
      textarea.dispatchEvent(new Event('input'));
      return;
    }

    // Escape — 取消焦点
    if (e.key === 'Escape') {
      e.preventDefault();
      textarea.blur();
      return;
    }
  });

  // Title change
  const noteTitleInput = document.getElementById('noteTitle');
  noteTitleInput.addEventListener('input', Utils.debounce(() => {
    if (!self.currentNoteId) return;
    const title = noteTitleInput.value;
    self.store.updateNote(self.currentNoteId, { title });
    self.renderNoteList();
  }, 500));

  // Title keyboard shortcuts
  noteTitleInput.addEventListener('keydown', (e) => {
    // Enter — 跳转到正文编辑区
    if (e.key === 'Enter') {
      e.preventDefault();
      if (self.currentEditorType === 'markdown') {
        document.getElementById('mdInput').focus();
      } else {
        editorContent.focus();
      }
    }
    // Escape — 取消标题焦点
    if (e.key === 'Escape') {
      e.preventDefault();
      noteTitleInput.blur();
    }
  });

  // Tag input
  const tagInput = document.getElementById('tagInput');
  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && tagInput.value.trim()) {
      e.preventDefault();
      self.addTagToNote(tagInput.value.trim());
      tagInput.value = '';
    }
  });

  // Editor action buttons
  document.getElementById('btnStar').addEventListener('click', () => self.toggleNoteStar());
  document.getElementById('btnPin').addEventListener('click', () => self.toggleNotePin());
  document.getElementById('btnDelete').addEventListener('click', () => self.deleteCurrentNote());
  document.getElementById('btnHistory').addEventListener('click', () => self.showHistoryModal());
  document.getElementById('btnExport').addEventListener('click', () => self.showExportModal());
  document.getElementById('btnNotebook').addEventListener('click', () => self.showMoveModal());

  // History modal
  document.getElementById('btnRestoreVersion').addEventListener('click', () => self.restoreVersion());

  // Export options
  document.querySelectorAll('.export-option').forEach(btn => {
    btn.addEventListener('click', () => self.exportNote(btn.dataset.format));
  });

  // Insert link
  document.getElementById('btnInsertLink').addEventListener('click', () => self.confirmInsertLink());

  // Insert image
  document.getElementById('btnInsertImage').addEventListener('click', () => self.confirmInsertImage());
  document.getElementById('imageUploadArea').addEventListener('click', () => {
    document.getElementById('imageFileInput').click();
  });
  document.getElementById('imageFileInput').addEventListener('change', (e) => {
    if (e.target.files[0]) self.handleImageFile(e.target.files[0]);
  });

  // Insert table
  document.getElementById('btnInsertTable').addEventListener('click', () => self.confirmInsertTable());

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      document.getElementById(modalId).style.display = 'none';
    });
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
  });

  // Close context menu on click elsewhere
  document.addEventListener('click', () => {
    document.getElementById('contextMenu').style.display = 'none';
  });

  // Context menu actions
  document.getElementById('contextMenu').addEventListener('click', (e) => {
    const item = e.target.closest('.context-item');
    if (item) self.handleContextAction(item.dataset.action);
  });

  // Calendar navigation
  document.getElementById('btnPrevMonth').addEventListener('click', () => {
    self.calendarDate.setMonth(self.calendarDate.getMonth() - 1);
    self.renderCalendar();
  });
  document.getElementById('btnNextMonth').addEventListener('click', () => {
    self.calendarDate.setMonth(self.calendarDate.getMonth() + 1);
    self.renderCalendar();
  });

  // Drag and drop image support
  editorContent.addEventListener('dragover', (e) => { e.preventDefault(); });
  editorContent.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      e.preventDefault();
      self.handleImageFile(files[0]);
    }
  });

  // Paste image support
  editorContent.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        self.handleImageFile(file);
        break;
      }
    }
  });
};
