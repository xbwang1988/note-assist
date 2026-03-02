/**
 * Utils 工具函数测试
 */
const path = require('path');
const { loadBrowserModule } = require('../helpers/load-browser-module');

let Utils;

beforeEach(() => {
  localStorage.clear();
  const ctx = loadBrowserModule(
    path.resolve(__dirname, '../../renderer/js/utils.js')
  );
  Utils = ctx.Utils;
});

// ========== formatDate ==========
describe('Utils.formatDate', () => {
  test('空值返回空字符串', () => {
    expect(Utils.formatDate(null)).toBe('');
    expect(Utils.formatDate(undefined)).toBe('');
    expect(Utils.formatDate(0)).toBe('');
  });

  test('刚刚（<60秒）', () => {
    const ts = Date.now() - 30 * 1000;
    expect(Utils.formatDate(ts)).toBe('刚刚');
  });

  test('X 分钟前', () => {
    const ts = Date.now() - 5 * 60 * 1000;
    expect(Utils.formatDate(ts)).toBe('5 分钟前');
  });

  test('X 小时前', () => {
    const ts = Date.now() - 3 * 3600 * 1000;
    expect(Utils.formatDate(ts)).toBe('3 小时前');
  });

  test('昨天', () => {
    const ts = Date.now() - 30 * 3600 * 1000;
    expect(Utils.formatDate(ts)).toBe('昨天');
  });

  test('同年显示月日', () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), 0, 15, 0, 0, 0);
    // 确保是今年且超过2天前
    if (Date.now() - d.getTime() > 172800000) {
      const result = Utils.formatDate(d.getTime());
      expect(result).toBe('1月15日');
    }
  });

  test('不同年显示年/月/日', () => {
    const d = new Date(2020, 5, 15);
    const result = Utils.formatDate(d.getTime());
    expect(result).toBe('2020/6/15');
  });

  test('边界值：恰好60秒', () => {
    const ts = Date.now() - 60 * 1000;
    expect(Utils.formatDate(ts)).toBe('1 分钟前');
  });
});

// ========== formatFullDate ==========
describe('Utils.formatFullDate', () => {
  test('空值返回空字符串', () => {
    expect(Utils.formatFullDate(null)).toBe('');
    expect(Utils.formatFullDate(undefined)).toBe('');
  });

  test('格式化日期带零填充', () => {
    const d = new Date(2024, 0, 5, 8, 3); // 2024/01/05 08:03
    const result = Utils.formatFullDate(d.getTime());
    expect(result).toBe('2024/01/05 08:03');
  });

  test('大数字不需要零填充', () => {
    const d = new Date(2024, 11, 25, 14, 30); // 2024/12/25 14:30
    const result = Utils.formatFullDate(d.getTime());
    expect(result).toBe('2024/12/25 14:30');
  });
});

// ========== stripHtml ==========
describe('Utils.stripHtml', () => {
  test('剥离简单标签', () => {
    expect(Utils.stripHtml('<p>hello</p>')).toBe('hello');
  });

  test('剥离嵌套标签', () => {
    expect(Utils.stripHtml('<div><p><b>bold</b> text</p></div>')).toBe('bold text');
  });

  test('空字符串', () => {
    expect(Utils.stripHtml('')).toBe('');
  });

  test('纯文本不变', () => {
    expect(Utils.stripHtml('plain text')).toBe('plain text');
  });
});

// ========== countWords ==========
describe('Utils.countWords', () => {
  test('空值返回0', () => {
    expect(Utils.countWords(null)).toBe(0);
    expect(Utils.countWords('')).toBe(0);
    expect(Utils.countWords(undefined)).toBe(0);
  });

  test('纯中文', () => {
    expect(Utils.countWords('你好世界')).toBe(4);
  });

  test('纯英文', () => {
    expect(Utils.countWords('hello world')).toBe(2);
  });

  test('中英混合', () => {
    // 中文按字计数(4) + 英文按词计数(2) = 6
    expect(Utils.countWords('hello你好world世界')).toBe(6);
  });

  test('纯数字计数（Issue #5 修复）', () => {
    expect(Utils.countWords('123 456')).toBe(2);
  });

  test('中英数混合', () => {
    // 4中文字(第章世界) + 2词(1, hello) = 6
    expect(Utils.countWords('第1章 hello 世界')).toBe(6);
  });
});

// ========== escapeHtml ==========
describe('Utils.escapeHtml', () => {
  test('转义 &', () => {
    expect(Utils.escapeHtml('a & b')).toBe('a &amp; b');
  });

  test('转义 <', () => {
    expect(Utils.escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  test('转义 "', () => {
    expect(Utils.escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  test("转义 '", () => {
    expect(Utils.escapeHtml("it's")).toBe("it&#39;s");
  });

  test('组合特殊字符', () => {
    expect(Utils.escapeHtml('<a href="x">&')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;');
  });
});

// ========== debounce ==========
// debounce 使用真实定时器测试，因为 vm 沙箱的 setTimeout 不受 jest.useFakeTimers 控制
describe('Utils.debounce', () => {
  test('延迟调用', async () => {
    const fn = jest.fn();
    const debounced = Utils.debounce(fn, 50);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 80));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('重复调用只执行一次', async () => {
    const fn = jest.fn();
    const debounced = Utils.debounce(fn, 50);
    debounced();
    debounced();
    debounced();
    await new Promise(r => setTimeout(r, 80));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('传递参数', async () => {
    const fn = jest.fn();
    const debounced = Utils.debounce(fn, 50);
    debounced('a', 'b');
    await new Promise(r => setTimeout(r, 80));
    expect(fn).toHaveBeenCalledWith('a', 'b');
  });
});
