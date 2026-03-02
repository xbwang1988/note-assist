/**
 * 云笔记 - 历史版本
 */
App.prototype.showHistoryModal = function() {
  if (!this.currentNoteId) return;
  const note = this.store.getNote(this.currentNoteId);
  if (!note || !note.versions || note.versions.length === 0) {
    this.showToast('暂无历史版本', 'info');
    return;
  }

  const modal = document.getElementById('historyModal');
  const list = document.getElementById('historyList');
  const preview = document.getElementById('historyPreview');

  list.innerHTML = note.versions.map((v, i) => {
    const text = Utils.stripHtml(v.content);
    return `<div class="history-item ${i === note.versions.length - 1 ? 'active' : ''}" data-index="${i}">
      <span class="history-item-time">${Utils.formatFullDate(v.timestamp)}</span>
      <span class="history-item-size">${text.length} 字符</span>
    </div>`;
  }).reverse().join('');

  const latest = note.versions[note.versions.length - 1];
  preview.textContent = Utils.stripHtml(latest.content).substring(0, 500);
  modal._selectedIndex = note.versions.length - 1;

  list.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      list.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const idx = parseInt(item.dataset.index);
      modal._selectedIndex = idx;
      const version = note.versions[idx];
      preview.textContent = Utils.stripHtml(version.content).substring(0, 500);
    });
  });

  modal.style.display = '';
};

App.prototype.restoreVersion = function() {
  const modal = document.getElementById('historyModal');
  const note = this.store.getNote(this.currentNoteId);
  if (!note || modal._selectedIndex === undefined) return;

  const version = note.versions[modal._selectedIndex];
  if (!version) return;

  this.store.updateNote(this.currentNoteId, {
    content: version.content,
    title: version.title || note.title
  });

  this.openNote(this.currentNoteId);
  modal.style.display = 'none';
  this.showToast('已恢复到历史版本', 'success');
};
