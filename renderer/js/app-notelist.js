/**
 * 云笔记 - 笔记列表渲染
 */
App.prototype.renderNoteList = function() {
  const container = document.getElementById('noteList');
  const filter = this.buildFilter();
  const notes = this.store.getNotes(filter);

  if (notes.length === 0) {
    let msg = '暂无笔记';
    let icon = '&#128196;';
    if (this.currentView.type === 'trash') {
      msg = '回收站为空';
      icon = '&#128465;';
    } else if (this.currentView.type === 'starred') {
      msg = '暂无收藏';
      icon = '&#11088;';
    } else if (this.currentView.type === 'search') {
      msg = '未找到相关笔记';
      icon = '&#128269;';
    }
    container.innerHTML = `
      <div class="note-list-empty">
        <div class="empty-icon">${icon}</div>
        <p>${msg}</p>
      </div>`;
    return;
  }

  const self = this;
  container.innerHTML = notes.map(note => {
    const preview = Utils.stripHtml(note.content).substring(0, 100);
    const isActive = note.id === self.currentNoteId;
    const tags = (note.tags || []).slice(0, 2);

    return `
      <div class="note-card ${isActive ? 'active' : ''} ${note.pinned ? 'pinned' : ''}"
           data-id="${note.id}"
           draggable="true">
        <div class="note-card-title">
          ${note.starred ? '<span class="star-indicator">&#11088;</span> ' : ''}
          ${Utils.escapeHtml(note.title || '无标题笔记')}
        </div>
        <div class="note-card-preview">${Utils.escapeHtml(preview) || '空笔记'}</div>
        <div class="note-card-meta">
          <span>${Utils.formatDate(note.updatedAt)}</span>
          <div class="note-card-tags">
            ${tags.map(t => `<span class="mini-tag">${Utils.escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => {
      self.openNote(card.dataset.id);
    });

    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      self.contextNoteId = card.dataset.id;
      self.showContextMenu(e.clientX, e.clientY);
    });
  });

  if (this.store.getSetting('listView') === 'grid') {
    container.classList.add('grid-view');
  } else {
    container.classList.remove('grid-view');
  }
};

App.prototype.buildFilter = function() {
  const filter = {
    sort: this.store.getSetting('sortBy') || 'updatedAt-desc'
  };
  const v = this.currentView;
  if (v.type === 'all' || v.type === 'recent') filter.view = v.type;
  else if (v.type === 'starred') filter.view = 'starred';
  else if (v.type === 'todo') filter.view = 'todo';
  else if (v.type === 'trash') filter.view = 'trash';
  else if (v.type === 'notebook') filter.notebookId = v.notebookId;
  else if (v.type === 'tag') filter.tag = v.tag;
  else if (v.type === 'search') { filter.view = 'all'; filter.search = v.search; }
  else filter.view = 'all';
  return filter;
};
