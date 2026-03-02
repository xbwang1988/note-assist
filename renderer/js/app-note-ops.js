/**
 * 云笔记 - 笔记操作（收藏/置顶/删除/标签/右键菜单）
 */
App.prototype.renderNoteTags = function(tags) {
  const container = document.getElementById('tagsDisplay');
  const self = this;
  container.innerHTML = tags.map(tag =>
    `<span class="note-tag">${Utils.escapeHtml(tag)} <span class="tag-remove" data-tag="${Utils.escapeHtml(tag)}">&times;</span></span>`
  ).join('');

  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      self.removeTagFromNote(btn.dataset.tag);
    });
  });
};

App.prototype.addTagToNote = function(tag) {
  if (!this.currentNoteId) return;
  const note = this.store.getNote(this.currentNoteId);
  if (!note) return;
  const tags = note.tags || [];
  if (!tags.includes(tag)) {
    tags.push(tag);
    this.store.updateNote(this.currentNoteId, { tags });
    this.renderNoteTags(tags);
    this.renderTagCloud();
    this.renderNoteList();
  }
};

App.prototype.removeTagFromNote = function(tag) {
  if (!this.currentNoteId) return;
  const note = this.store.getNote(this.currentNoteId);
  if (!note) return;
  const tags = (note.tags || []).filter(t => t !== tag);
  this.store.updateNote(this.currentNoteId, { tags });
  this.renderNoteTags(tags);
  this.renderTagCloud();
  this.renderNoteList();
};

App.prototype.toggleNoteStar = function() {
  if (!this.currentNoteId) return;
  const note = this.store.getNote(this.currentNoteId);
  if (!note) return;
  this.store.updateNote(this.currentNoteId, { starred: !note.starred });
  document.getElementById('btnStar').innerHTML = !note.starred ? '&#9733;' : '&#9734;';
  document.getElementById('btnStar').title = !note.starred ? '取消收藏' : '收藏';
  this.renderNoteList();
  this.updateStats();
  this.showToast(!note.starred ? '已收藏' : '已取消收藏', 'info');
};

App.prototype.toggleNotePin = function() {
  if (!this.currentNoteId) return;
  const note = this.store.getNote(this.currentNoteId);
  if (!note) return;
  this.store.updateNote(this.currentNoteId, { pinned: !note.pinned });
  document.getElementById('btnPin').style.opacity = !note.pinned ? '1' : '0.5';
  this.renderNoteList();
  this.showToast(!note.pinned ? '已置顶' : '已取消置顶', 'info');
};

App.prototype.deleteCurrentNote = function() {
  if (!this.currentNoteId) return;
  const note = this.store.getNote(this.currentNoteId);
  if (!note) return;

  if (note.deleted) {
    if (confirm('确定要永久删除此笔记吗？此操作不可恢复。')) {
      this.store.deleteNote(this.currentNoteId, true);
      this.showToast('已永久删除', 'warning');
    } else {
      return;
    }
  } else {
    this.store.deleteNote(this.currentNoteId);
    this.showToast('已移至回收站', 'info');
  }

  this.currentNoteId = null;
  document.getElementById('editorEmpty').style.display = '';
  document.getElementById('editorActive').style.display = 'none';
  this.renderNoteList();
  this.updateStats();
  this.renderSidebar();
};

// --- Context Menu ---
App.prototype.showContextMenu = function(x, y) {
  const menu = document.getElementById('contextMenu');
  menu.style.display = '';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';

  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = (x - rect.width) + 'px';
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = (y - rect.height) + 'px';
  }
};

App.prototype.handleContextAction = function(action) {
  const noteId = this.contextNoteId;
  if (!noteId) return;

  switch (action) {
    case 'open':
      this.openNote(noteId);
      break;
    case 'star': {
      const note = this.store.getNote(noteId);
      if (note) {
        this.store.updateNote(noteId, { starred: !note.starred });
        this.renderNoteList();
        this.updateStats();
        if (noteId === this.currentNoteId) {
          document.getElementById('btnStar').innerHTML = !note.starred ? '&#9733;' : '&#9734;';
        }
      }
      break;
    }
    case 'pin': {
      const note = this.store.getNote(noteId);
      if (note) {
        this.store.updateNote(noteId, { pinned: !note.pinned });
        this.renderNoteList();
      }
      break;
    }
    case 'duplicate':
      this.store.duplicateNote(noteId);
      this.renderNoteList();
      this.showToast('笔记已复制', 'success');
      break;
    case 'move':
      this.currentNoteId = noteId;
      this.showMoveModal();
      break;
    case 'delete':
      this.store.deleteNote(noteId);
      if (noteId === this.currentNoteId) {
        this.currentNoteId = null;
        document.getElementById('editorEmpty').style.display = '';
        document.getElementById('editorActive').style.display = 'none';
      }
      this.renderNoteList();
      this.updateStats();
      this.renderSidebar();
      this.showToast('已移至回收站', 'info');
      break;
  }

  document.getElementById('contextMenu').style.display = 'none';
};
