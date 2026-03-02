/**
 * 云笔记 - 侧边栏渲染
 */
App.prototype.renderSidebar = function() {
  this.renderNotebookTree();
  this.renderTagCloud();
  this.updateStats();
};

App.prototype.renderNotebookTree = function() {
  const container = document.getElementById('notebookTree');
  const notebooks = this.store.getNotebooks();
  const self = this;

  const buildTree = (parentId) => {
    const children = notebooks.filter(nb => nb.parentId === parentId)
      .sort((a, b) => a.order - b.order);
    if (children.length === 0) return '';

    return children.map(nb => {
      const count = self.store.getNotebookNoteCount(nb.id);
      const subTree = buildTree(nb.id);
      const isActive = self.currentView.type === 'notebook' && self.currentView.notebookId === nb.id;

      return `
        <div class="notebook-item ${isActive ? 'active' : ''}" data-id="${nb.id}">
          <span class="nb-icon">&#128193;</span>
          <span class="nb-name">${Utils.escapeHtml(nb.name)}</span>
          <span class="nb-count">${count}</span>
          <span class="nb-actions">
            <button data-action="rename" title="重命名">&#9998;</button>
            <button data-action="delete" title="删除">&#128465;</button>
          </span>
        </div>
        ${subTree ? `<div class="notebook-children">${subTree}</div>` : ''}
      `;
    }).join('');
  };

  container.innerHTML = buildTree(null);

  container.querySelectorAll('.notebook-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.nb-actions button')) return;
      const nbId = item.dataset.id;
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.notebook-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tag-chip').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      self.currentView = { type: 'notebook', notebookId: nbId };
      const nb = self.store.getNotebooks().find(n => n.id === nbId);
      document.getElementById('currentViewTitle').textContent = nb ? nb.name : '笔记本';

      document.getElementById('noteList').style.display = '';
      document.getElementById('calendarView').style.display = 'none';
      document.getElementById('templateView').style.display = 'none';

      self.renderNoteList();
    });

    item.querySelectorAll('.nb-actions button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nbId = item.dataset.id;
        if (btn.dataset.action === 'rename') {
          self.renameNotebook(nbId);
        } else if (btn.dataset.action === 'delete') {
          self.deleteNotebook(nbId);
        }
      });
    });
  });
};

App.prototype.renderTagCloud = function() {
  const container = document.getElementById('tagCloud');
  const tags = this.store.getAllTags();
  const self = this;

  if (tags.length === 0) {
    container.innerHTML = '<span style="font-size:12px;color:var(--text-tertiary);padding:4px">暂无标签</span>';
    return;
  }
  container.innerHTML = tags.map(([tag, count]) =>
    `<span class="tag-chip" data-tag="${Utils.escapeHtml(tag)}">${Utils.escapeHtml(tag)} <span class="tag-count">${count}</span></span>`
  ).join('');

  container.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.notebook-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tag-chip').forEach(i => i.classList.remove('active'));
      chip.classList.add('active');

      self.currentView = { type: 'tag', tag };
      document.getElementById('currentViewTitle').textContent = `标签: ${tag}`;

      document.getElementById('noteList').style.display = '';
      document.getElementById('calendarView').style.display = 'none';
      document.getElementById('templateView').style.display = 'none';

      self.renderNoteList();
    });
  });
};

App.prototype.updateStats = function() {
  const stats = this.store.getStats();
  const setCount = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setCount('countAll', stats.all);
  setCount('countStarred', stats.starred);
  setCount('countTodo', stats.todo);
  setCount('countTrash', stats.trash);
};
