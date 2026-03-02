/**
 * 云笔记 - 日历视图
 */
App.prototype.renderCalendar = function() {
  const date = this.calendarDate;
  const year = date.getFullYear();
  const month = date.getMonth();

  document.getElementById('calendarTitle').textContent = `${year}年${month + 1}月`;

  const grid = document.getElementById('calendarGrid');
  const headers = ['日', '一', '二', '三', '四', '五', '六'];
  let html = headers.map(h => `<div class="calendar-cell header">${h}</div>`).join('');

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const allNotes = this.store.getNotes({ view: 'all' });
  const notesByDate = {};
  allNotes.forEach(n => {
    const d = new Date(n.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!notesByDate[key]) notesByDate[key] = [];
    notesByDate[key].push(n);
  });

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-cell other-month">${daysInPrevMonth - i}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const key = `${year}-${month}-${d}`;
    const hasNotes = notesByDate[key] && notesByDate[key].length > 0;
    const isSelected = this.calendarSelectedDate &&
      this.calendarSelectedDate.getFullYear() === year &&
      this.calendarSelectedDate.getMonth() === month &&
      this.calendarSelectedDate.getDate() === d;

    html += `<div class="calendar-cell ${isToday ? 'today' : ''} ${hasNotes ? 'has-notes' : ''} ${isSelected ? 'selected' : ''}"
                  data-date="${year}-${month}-${d}">${d}</div>`;
  }

  const totalCells = firstDay + daysInMonth;
  const remaining = 7 - (totalCells % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="calendar-cell other-month">${i}</div>`;
    }
  }

  grid.innerHTML = html;

  const self = this;
  grid.querySelectorAll('.calendar-cell:not(.header):not(.other-month)').forEach(cell => {
    cell.addEventListener('click', () => {
      const [y, m, d] = cell.dataset.date.split('-').map(Number);
      self.calendarSelectedDate = new Date(y, m, d);
      self.renderCalendar();
      self.renderCalendarNotes(y, m, d);
    });
  });

  if (this.calendarSelectedDate) {
    const sd = this.calendarSelectedDate;
    this.renderCalendarNotes(sd.getFullYear(), sd.getMonth(), sd.getDate());
  }
};

App.prototype.renderCalendarNotes = function(year, month, day) {
  const container = document.getElementById('calendarNotes');
  const allNotes = this.store.getNotes({ view: 'all' });
  const dayNotes = allNotes.filter(n => {
    const d = new Date(n.createdAt);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });
  const self = this;

  container.innerHTML = `<h4>${month + 1}月${day}日的笔记 (${dayNotes.length})</h4>`;
  if (dayNotes.length === 0) {
    container.innerHTML += '<p style="color:var(--text-tertiary);font-size:13px">当天没有笔记</p>';
    return;
  }

  dayNotes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div class="note-card-title">${Utils.escapeHtml(note.title || '无标题笔记')}</div>
      <div class="note-card-meta"><span>${Utils.formatFullDate(note.createdAt)}</span></div>`;
    card.addEventListener('click', () => self.openNote(note.id));
    container.appendChild(card);
  });
};
