/**
 * 云笔记 - 笔记本管理
 */
App.prototype.showNotebookModal = function(editId) {
  if (editId === undefined) editId = null;
  const modal = document.getElementById('notebookModal');
  const input = document.getElementById('notebookNameInput');
  const parentSelect = document.getElementById('notebookParentSelect');
  const title = document.getElementById('notebookModalTitle');

  modal._editId = editId;

  if (editId) {
    const nb = this.store.getNotebooks().find(n => n.id === editId);
    title.textContent = '重命名笔记本';
    input.value = nb ? nb.name : '';
  } else {
    title.textContent = '新建笔记本';
    input.value = '';
  }

  const notebooks = this.store.getNotebooks();
  parentSelect.innerHTML = '<option value="">无（顶级笔记本）</option>' +
    notebooks.map(nb => `<option value="${nb.id}">${Utils.escapeHtml(nb.name)}</option>`).join('');

  modal.style.display = '';
  input.focus();
};

App.prototype.confirmNotebookModal = function() {
  const modal = document.getElementById('notebookModal');
  const name = document.getElementById('notebookNameInput').value.trim();
  const parentId = document.getElementById('notebookParentSelect').value || null;

  if (!name) {
    this.showToast('请输入笔记本名称', 'warning');
    return;
  }

  if (modal._editId) {
    this.store.updateNotebook(modal._editId, { name });
    this.showToast('已重命名', 'success');
  } else {
    this.store.addNotebook(name, parentId);
    this.showToast('笔记本已创建', 'success');
  }

  modal.style.display = 'none';
  this.renderSidebar();
};

App.prototype.renameNotebook = function(nbId) {
  this.showNotebookModal(nbId);
};

App.prototype.deleteNotebook = function(nbId) {
  const nb = this.store.getNotebooks().find(n => n.id === nbId);
  if (!nb) return;
  if (nb.id === 'nb_default') {
    this.showToast('无法删除默认笔记本', 'warning');
    return;
  }
  if (confirm(`确定要删除笔记本"${nb.name}"吗？笔记将移至默认笔记本。`)) {
    this.store.deleteNotebook(nbId);
    if (this.currentView.notebookId === nbId) {
      this.currentView = { type: 'all' };
    }
    this.renderSidebar();
    this.renderNoteList();
    this.showToast('笔记本已删除', 'success');
  }
};

App.prototype.showMoveModal = function() {
  if (!this.currentNoteId) return;
  const modal = document.getElementById('moveModal');
  const list = document.getElementById('moveNotebookList');
  const note = this.store.getNote(this.currentNoteId);
  const notebooks = this.store.getNotebooks();
  const self = this;

  list.innerHTML = notebooks.map(nb =>
    `<div class="move-nb-item ${nb.id === note.notebookId ? 'active' : ''}" data-id="${nb.id}">
      <span>&#128193;</span>
      <span>${Utils.escapeHtml(nb.name)}</span>
    </div>`
  ).join('');

  list.querySelectorAll('.move-nb-item').forEach(item => {
    item.addEventListener('click', () => {
      const nbId = item.dataset.id;
      self.store.updateNote(self.currentNoteId, { notebookId: nbId });
      modal.style.display = 'none';
      self.renderNoteList();
      self.renderSidebar();
      self.showToast('已移动到目标笔记本', 'success');
    });
  });

  modal.style.display = '';
};
