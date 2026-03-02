/**
 * App.prototype.htmlToMarkdown 纯函数测试
 */
const path = require('path');
const { loadBrowserModule } = require('../helpers/load-browser-module');

let app;

beforeEach(() => {
  localStorage.clear();

  // htmlToMarkdown 需要 App 类和 prototype 上的方法
  // 先加载一个空的 App 壳，再加载 app-editor.js
  const ctx = loadBrowserModule([
    // 手动注入 App 空壳
  ], {
    App: function App() {},
    Utils: { stripHtml: (html) => html.replace(/<[^>]+>/g, '') }
  });

  // 加载 app-editor.js 到同一上下文
  const fs = require('fs');
  const vm = require('vm');
  const code = fs.readFileSync(
    path.resolve(__dirname, '../../renderer/js/app-editor.js'),
    'utf-8'
  );
  vm.runInContext(code, ctx);

  app = new ctx.App();
});

describe('htmlToMarkdown', () => {
  test('空值返回空字符串', () => {
    expect(app.htmlToMarkdown('')).toBe('');
    expect(app.htmlToMarkdown(null)).toBe('');
    expect(app.htmlToMarkdown(undefined)).toBe('');
  });

  test('h1 标题', () => {
    expect(app.htmlToMarkdown('<h1>标题</h1>')).toBe('# 标题');
  });

  test('h2 标题', () => {
    expect(app.htmlToMarkdown('<h2>二级</h2>')).toBe('## 二级');
  });

  test('h3 标题', () => {
    expect(app.htmlToMarkdown('<h3>三级</h3>')).toBe('### 三级');
  });

  test('h4 标题', () => {
    expect(app.htmlToMarkdown('<h4>四级</h4>')).toBe('#### 四级');
  });

  test('h5 标题', () => {
    expect(app.htmlToMarkdown('<h5>五级</h5>')).toBe('##### 五级');
  });

  test('h6 标题', () => {
    expect(app.htmlToMarkdown('<h6>六级</h6>')).toBe('###### 六级');
  });

  test('加粗 strong', () => {
    expect(app.htmlToMarkdown('<strong>粗体</strong>')).toBe('**粗体**');
  });

  test('加粗 b', () => {
    expect(app.htmlToMarkdown('<b>粗体</b>')).toBe('**粗体**');
  });

  test('斜体 em', () => {
    expect(app.htmlToMarkdown('<em>斜体</em>')).toBe('*斜体*');
  });

  test('斜体 i', () => {
    expect(app.htmlToMarkdown('<i>斜体</i>')).toBe('*斜体*');
  });

  test('删除线 s', () => {
    expect(app.htmlToMarkdown('<s>删除</s>')).toBe('~~删除~~');
  });

  test('删除线 del', () => {
    expect(app.htmlToMarkdown('<del>删除</del>')).toBe('~~删除~~');
  });

  test('行内代码', () => {
    expect(app.htmlToMarkdown('<code>code</code>')).toBe('`code`');
  });

  test('引用', () => {
    const result = app.htmlToMarkdown('<blockquote>引用文字</blockquote>');
    expect(result).toContain('> 引用文字');
  });

  test('链接', () => {
    expect(app.htmlToMarkdown('<a href="https://example.com">链接</a>'))
      .toBe('[链接](https://example.com)');
  });

  test('图片', () => {
    expect(app.htmlToMarkdown('<img src="pic.jpg">'))
      .toBe('![](pic.jpg)');
  });

  test('水平线', () => {
    const result = app.htmlToMarkdown('<hr>');
    expect(result).toContain('---');
  });

  test('换行 br', () => {
    expect(app.htmlToMarkdown('line1<br>line2')).toBe('line1\nline2');
  });

  test('列表项', () => {
    const result = app.htmlToMarkdown('<ul><li>item1</li><li>item2</li></ul>');
    expect(result).toContain('- item1');
    expect(result).toContain('- item2');
  });

  test('实体解码', () => {
    expect(app.htmlToMarkdown('&amp; &lt; &gt; &quot; &#39;'))
      .toBe('& < > " \'');
  });

  test('多余换行被清理', () => {
    const result = app.htmlToMarkdown('<p>a</p><p>b</p><p>c</p>');
    expect(result).not.toMatch(/\n{3,}/);
  });

  test('组合转换', () => {
    const html = '<h1>Title</h1><p>Hello <strong>world</strong></p>';
    const result = app.htmlToMarkdown(html);
    expect(result).toContain('# Title');
    expect(result).toContain('**world**');
  });
});
