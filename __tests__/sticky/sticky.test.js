/**
 * 桌面便签 sticky.js 测试
 */
const path = require('path');
const { loadBrowserModule } = require('../helpers/load-browser-module');

let ctx;

function loadSticky() {
  // 模拟便签所需的 DOM 元素
  document.body.innerHTML = `
    <div id="stickyApp">
      <div id="stickyDate"></div>
      <input id="todoInput" />
      <button id="btnAdd"></button>
      <div id="todoList"></div>
      <div id="todoStats"></div>
      <div class="filter-btn" data-filter="all"></div>
      <div class="filter-btn" data-filter="active"></div>
      <div class="filter-btn" data-filter="done"></div>
      <button id="btnClearDone"></button>
      <button id="btnTheme"></button>
      <button id="btnPin"></button>
      <button id="btnMinimize"></button>
      <button id="btnClose"></button>
      <div id="edgeHint"></div>
    </div>
  `;

  ctx = loadBrowserModule(
    path.resolve(__dirname, '../../sticky/js/sticky.js'),
    {
      window: {
        electronAPI: null,
        getSelection: () => ({ removeAllRanges: () => {}, addRange: () => {} })
      }
    }
  );
  return ctx;
}

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

// ========== addTodo ==========
describe('addTodo', () => {
  test('添加普通待办（低优先级）', () => {
    loadSticky();
    ctx.addTodo('买牛奶');
    expect(ctx.todos).toHaveLength(1);
    expect(ctx.todos[0].text).toBe('买牛奶');
    expect(ctx.todos[0].priority).toBe('low');
    expect(ctx.todos[0].done).toBe(false);
  });

  test('!! 前缀解析为高优先级', () => {
    loadSticky();
    ctx.addTodo('!!紧急任务');
    expect(ctx.todos[0].priority).toBe('high');
    expect(ctx.todos[0].text).toBe('紧急任务');
  });

  test('! 前缀解析为中优先级', () => {
    loadSticky();
    ctx.addTodo('!重要任务');
    expect(ctx.todos[0].priority).toBe('medium');
    expect(ctx.todos[0].text).toBe('重要任务');
  });

  test('空字符串不添加', () => {
    loadSticky();
    ctx.addTodo('');
    expect(ctx.todos).toHaveLength(0);
  });

  test('纯空格不添加', () => {
    loadSticky();
    ctx.addTodo('   ');
    expect(ctx.todos).toHaveLength(0);
  });

  test('仅 !! 后无内容不添加', () => {
    loadSticky();
    ctx.addTodo('!!');
    expect(ctx.todos).toHaveLength(0);
  });

  test('仅 ! 后无内容不添加', () => {
    loadSticky();
    ctx.addTodo('!');
    expect(ctx.todos).toHaveLength(0);
  });

  test('新待办插入到头部', () => {
    loadSticky();
    ctx.addTodo('first');
    ctx.addTodo('second');
    expect(ctx.todos[0].text).toBe('second');
    expect(ctx.todos[1].text).toBe('first');
  });

  test('注释与代码矛盾：注释说 !高 !!中，代码实际 !!高 !中', () => {
    // 文档bug: 注释第66行 "!高 !!中" 与代码逻辑相反
    loadSticky();
    ctx.addTodo('!!test');
    expect(ctx.todos[0].priority).toBe('high'); // 代码行为: !! = high
    ctx.addTodo('!test2');
    expect(ctx.todos[0].priority).toBe('medium'); // 代码行为: ! = medium
  });
});

// ========== getFilteredTodos ==========
describe('getFilteredTodos', () => {
  test('all 返回全部', () => {
    loadSticky();
    ctx.addTodo('a');
    ctx.addTodo('b');
    ctx.todos[0].done = true;
    ctx.currentFilter = 'all';
    expect(ctx.getFilteredTodos()).toHaveLength(2);
  });

  test('active 返回未完成', () => {
    loadSticky();
    ctx.addTodo('a');
    ctx.addTodo('b');
    ctx.todos[0].done = true;
    ctx.currentFilter = 'active';
    expect(ctx.getFilteredTodos()).toHaveLength(1);
    expect(ctx.getFilteredTodos()[0].done).toBe(false);
  });

  test('done 返回已完成', () => {
    loadSticky();
    ctx.addTodo('a');
    ctx.addTodo('b');
    ctx.todos[0].done = true;
    ctx.currentFilter = 'done';
    expect(ctx.getFilteredTodos()).toHaveLength(1);
    expect(ctx.getFilteredTodos()[0].done).toBe(true);
  });
});

// ========== toggleTodo ==========
describe('toggleTodo', () => {
  test('切换待办完成状态', () => {
    loadSticky();
    ctx.addTodo('toggle me');
    const id = ctx.todos[0].id;
    expect(ctx.todos[0].done).toBe(false);
    ctx.toggleTodo(id);
    expect(ctx.todos[0].done).toBe(true);
    ctx.toggleTodo(id);
    expect(ctx.todos[0].done).toBe(false);
  });
});

// ========== deleteTodo ==========
describe('deleteTodo', () => {
  test('删除待办', () => {
    loadSticky();
    ctx.addTodo('delete me');
    const id = ctx.todos[0].id;
    ctx.deleteTodo(id);
    expect(ctx.todos).toHaveLength(0);
  });

  test('删除不存在的 id 不报错', () => {
    loadSticky();
    ctx.addTodo('keep');
    ctx.deleteTodo('nonexistent');
    expect(ctx.todos).toHaveLength(1);
  });
});

// ========== escapeHtml ==========
describe('sticky escapeHtml', () => {
  test('转义特殊字符', () => {
    loadSticky();
    expect(ctx.escapeHtml('<b>"hello" & \'world\'</b>')).toBe(
      '&lt;b&gt;&quot;hello&quot; &amp; &#39;world&#39;&lt;/b&gt;'
    );
  });
});

// ========== formatTime ==========
describe('sticky formatTime', () => {
  test('格式化时间 HH:MM', () => {
    loadSticky();
    const d = new Date(2024, 0, 1, 8, 5);
    expect(ctx.formatTime(d.getTime())).toBe('08:05');
  });

  test('午后时间', () => {
    loadSticky();
    const d = new Date(2024, 0, 1, 14, 30);
    expect(ctx.formatTime(d.getTime())).toBe('14:30');
  });
});
