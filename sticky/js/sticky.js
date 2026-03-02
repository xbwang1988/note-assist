/**
 * 桌面便签 - 每日 Todo List
 * 支持优先级、筛选、主题切换、数据持久化
 */

const STORAGE_KEY = 'sticky_todos';
const THEME_KEY = 'sticky_theme';
const THEMES = ['light', 'blue', 'green', 'pink', 'purple', 'dark'];

let todos = [];
let currentFilter = 'all';
let currentThemeIndex = 0;

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  loadTheme();
  updateDate();
  render();
  bindEvents();

  // 每分钟更新日期
  setInterval(updateDate, 60000);
});

// ========== 日期 ==========
function updateDate() {
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
  document.getElementById('stickyDate').textContent = dateStr;
}

// ========== 数据持久化 ==========
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    todos = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  // 通知主窗口同步数据
  if (window.electronAPI && window.electronAPI.syncTodos) {
    window.electronAPI.syncTodos(todos);
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    currentThemeIndex = THEMES.indexOf(saved);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
  }
  document.documentElement.setAttribute('data-theme', THEMES[currentThemeIndex]);
}

// ========== 添加待办 ==========
function addTodo(text) {
  text = text.trim();
  if (!text) return;

  // 解析优先级前缀: !!高 !中 默认低
  let priority = 'low';
  if (text.startsWith('!!')) {
    priority = 'high';
    text = text.slice(2).trim();
  } else if (text.startsWith('!')) {
    priority = 'medium';
    text = text.slice(1).trim();
  }

  if (!text) return;

  todos.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    done: false,
    priority,
    createdAt: Date.now()
  });

  saveData();
  render();
}

// ========== 渲染 ==========
function render() {
  const list = document.getElementById('todoList');
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    const msgs = {
      all: '暂无待办事项',
      active: '所有任务已完成 &#127881;',
      done: '暂无已完成事项'
    };
    list.innerHTML = `<div class="empty-msg"><div class="empty-icon">&#128203;</div><p>${msgs[currentFilter]}</p></div>`;
  } else {
    list.innerHTML = filtered.map(todo => {
      const time = formatTime(todo.createdAt);
      const priorityLabel = { high: '紧急', medium: '重要', low: '' };
      const priorityHtml = todo.priority !== 'low'
        ? `<span class="todo-priority ${todo.priority}">${priorityLabel[todo.priority]}</span>`
        : '';

      return `
        <div class="todo-item ${todo.done ? 'done' : ''}" data-id="${todo.id}">
          <input type="checkbox" ${todo.done ? 'checked' : ''}>
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          ${priorityHtml}
          <span class="todo-time">${time}</span>
          <button class="todo-delete" title="删除">&times;</button>
        </div>`;
    }).join('');
  }

  updateStats();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case 'active': return todos.filter(t => !t.done);
    case 'done': return todos.filter(t => t.done);
    default: return todos;
  }
}

function updateStats() {
  const active = todos.filter(t => !t.done).length;
  const done = todos.filter(t => t.done).length;
  const total = todos.length;
  document.getElementById('todoStats').textContent =
    `${active} 项待办` + (done > 0 ? ` / ${done} 已完成` : '');
}

// ========== 事件绑定 ==========
function bindEvents() {
  const input = document.getElementById('todoInput');

  // 回车添加
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTodo(input.value);
      input.value = '';
    }
  });

  // 加号按钮添加
  document.getElementById('btnAdd').addEventListener('click', () => {
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  // 列表交互（事件委托）
  document.getElementById('todoList').addEventListener('click', (e) => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.type === 'checkbox') {
      toggleTodo(id);
    } else if (e.target.classList.contains('todo-delete')) {
      deleteTodo(id);
    }
  });

  // 双击编辑
  document.getElementById('todoList').addEventListener('dblclick', (e) => {
    const textEl = e.target.closest('.todo-text');
    if (!textEl) return;
    const item = textEl.closest('.todo-item');
    const id = item.dataset.id;
    const todo = todos.find(t => t.id === id);
    if (!todo || todo.done) return;

    const original = todo.text;
    textEl.contentEditable = true;
    textEl.style.userSelect = 'text';
    textEl.focus();

    // 选中全部文字
    const range = document.createRange();
    range.selectNodeContents(textEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    const finishEdit = () => {
      textEl.contentEditable = false;
      textEl.style.userSelect = '';
      const newText = textEl.textContent.trim();
      if (newText && newText !== original) {
        todo.text = newText;
        saveData();
      }
      render();
    };

    textEl.addEventListener('blur', finishEdit, { once: true });
    textEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }
      if (e.key === 'Escape') { todo.text = original; textEl.blur(); }
    });
  });

  // 筛选按钮
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  // 清除已完成
  document.getElementById('btnClearDone').addEventListener('click', () => {
    const doneCount = todos.filter(t => t.done).length;
    if (doneCount === 0) return;
    todos = todos.filter(t => !t.done);
    saveData();
    render();
  });

  // 切换主题颜色
  document.getElementById('btnTheme').addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    const theme = THEMES[currentThemeIndex];
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  });

  // 置顶切换
  document.getElementById('btnPin').addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.togglePin) {
      window.electronAPI.togglePin();
    }
  });

  // 最小化
  document.getElementById('btnMinimize').addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.minimizeSticky) {
      window.electronAPI.minimizeSticky();
    }
  });

  // 关闭
  document.getElementById('btnClose').addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.closeSticky) {
      window.electronAPI.closeSticky();
    }
  });

  // 边缘隐藏状态 —— 主进程通知隐藏到哪条边
  if (window.electronAPI) {
    window.electronAPI.onEdgeHidden((edge) => {
      document.getElementById('stickyApp').classList.add('edge-hidden');
    });

    window.electronAPI.onEdgeRestored(() => {
      document.getElementById('stickyApp').classList.remove('edge-hidden');
    });
  }

  // 点击隐藏中的便签 → 恢复
  document.getElementById('edgeHint').addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.restoreFromEdge) {
      window.electronAPI.restoreFromEdge();
    }
  });

  // 快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl+N 聚焦到输入框
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      input.focus();
    }
  });
}

// ========== 操作 ==========
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    saveData();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveData();
  render();
}

// ========== 工具函数 ==========
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
