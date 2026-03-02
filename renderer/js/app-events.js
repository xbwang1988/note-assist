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

  // Markdown tab support
  document.getElementById('mdInput').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      textarea.dispatchEvent(new Event('input'));
    }
  });

  // Title change
  document.getElementById('noteTitle').addEventListener('input', Utils.debounce(() => {
    if (!self.currentNoteId) return;
    const title = document.getElementById('noteTitle').value;
    self.store.updateNote(self.currentNoteId, { title });
    self.renderNoteList();
  }, 500));

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
