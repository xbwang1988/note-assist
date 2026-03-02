/**
 * 云笔记 - 模板库视图
 */
App.prototype.renderTemplates = function() {
  const container = document.getElementById('templateGrid');
  const self = this;

  container.innerHTML = TEMPLATES.map((t, i) =>
    `<div class="template-card" data-index="${i}">
      <div class="template-card-icon">${t.icon}</div>
      <div class="template-card-name">${t.name}</div>
      <div class="template-card-desc">${t.desc}</div>
    </div>`
  ).join('');

  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index);
      self.createNewNote(TEMPLATES[idx]);
    });
  });
};
