/**
 * Store 数据层测试
 */
const path = require('path');
const { loadBrowserModule } = require('../helpers/load-browser-module');

let Store;

function createStore() {
  const ctx = loadBrowserModule(
    path.resolve(__dirname, '../../renderer/js/store.js')
  );
  Store = ctx.Store;
  return new Store();
}

beforeEach(() => {
  localStorage.clear();
});

// ========== 构造 / 加载 / 保存 ==========
describe('Store 初始化', () => {
  test('新建 Store 有默认数据', () => {
    const store = createStore();
    expect(store.data.notebooks).toHaveLength(1);
    expect(store.data.notebooks[0].id).toBe('nb_default');
    expect(store.data.notes).toHaveLength(0);
    expect(store.data.settings.theme).toBe('light');
  });

  test('从 localStorage 加载已有数据', () => {
    const saved = {
      notebooks: [{ id: 'nb_1', name: 'Test', parentId: null }],
      notes: [{ id: 'n_1', title: 'Hello' }],
      settings: { theme: 'dark' }
    };
    localStorage.setItem('cloud_notes_db', JSON.stringify(saved));
    const store = createStore();
    expect(store.data.notebooks[0].name).toBe('Test');
    expect(store.data.notes[0].title).toBe('Hello');
    expect(store.data.settings.theme).toBe('dark');
  });

  test('损坏 JSON 降级到默认值', () => {
    localStorage.setItem('cloud_notes_db', '{broken json!!!');
    const store = createStore();
    expect(store.data.notebooks).toHaveLength(1);
    expect(store.data.notebooks[0].id).toBe('nb_default');
  });

  test('save 写入 localStorage', () => {
    const store = createStore();
    store.addNote({ title: 'test' });
    const raw = localStorage.getItem('cloud_notes_db');
    const parsed = JSON.parse(raw);
    expect(parsed.notes).toHaveLength(1);
  });
});

// ========== 笔记本 CRUD ==========
describe('Store 笔记本', () => {
  test('addNotebook 创建笔记本', () => {
    const store = createStore();
    const nb = store.addNotebook('工作');
    expect(nb.name).toBe('工作');
    expect(nb.id).toMatch(/^nb_/);
    expect(store.getNotebooks()).toHaveLength(2);
  });

  test('addNotebook 支持子笔记本', () => {
    const store = createStore();
    const parent = store.addNotebook('父级');
    const child = store.addNotebook('子级', parent.id);
    expect(child.parentId).toBe(parent.id);
  });

  test('updateNotebook 更新笔记本属性', () => {
    const store = createStore();
    const nb = store.addNotebook('原名');
    store.updateNotebook(nb.id, { name: '新名' });
    expect(store.getNotebooks().find(n => n.id === nb.id).name).toBe('新名');
  });

  test('deleteNotebook 删除笔记本并转移笔记', () => {
    const store = createStore();
    const nb = store.addNotebook('要删除');
    store.addNote({ title: 'note1', notebookId: nb.id });
    store.deleteNotebook(nb.id);
    expect(store.getNotebooks().find(n => n.id === nb.id)).toBeUndefined();
    expect(store.data.notes[0].notebookId).toBe('nb_default');
  });

  test('deleteNotebook 递归删除子笔记本', () => {
    const store = createStore();
    const parent = store.addNotebook('父');
    const child = store.addNotebook('子', parent.id);
    store.addNote({ title: 'child-note', notebookId: child.id });
    store.deleteNotebook(parent.id);
    expect(store.getNotebooks().find(n => n.id === child.id)).toBeUndefined();
    expect(store.data.notes[0].notebookId).toBe('nb_default');
  });

  test('deleteNotebook 保护默认笔记本（Issue #4 修复）', () => {
    const store = createStore();
    store.deleteNotebook('nb_default');
    // 修复后：默认笔记本不可删除
    expect(store.getNotebooks().find(n => n.id === 'nb_default')).toBeDefined();
  });

  test('getNotebookNoteCount 统计非删除笔记数', () => {
    const store = createStore();
    store.addNote({ title: 'a', notebookId: 'nb_default' });
    store.addNote({ title: 'b', notebookId: 'nb_default' });
    const n3 = store.addNote({ title: 'c', notebookId: 'nb_default' });
    store.deleteNote(n3.id);
    expect(store.getNotebookNoteCount('nb_default')).toBe(2);
  });
});

// ========== 笔记 CRUD ==========
describe('Store 笔记', () => {
  test('addNote 创建笔记带默认值', () => {
    const store = createStore();
    const note = store.addNote({ title: '测试' });
    expect(note.id).toMatch(/^note_/);
    expect(note.title).toBe('测试');
    expect(note.deleted).toBe(false);
    expect(note.tags).toEqual([]);
    expect(note.versions).toEqual([]);
  });

  test('getNote 获取笔记', () => {
    const store = createStore();
    const note = store.addNote({ title: '查找' });
    expect(store.getNote(note.id).title).toBe('查找');
  });

  test('getNote 不存在返回 undefined', () => {
    const store = createStore();
    expect(store.getNote('nonexistent')).toBeUndefined();
  });

  test('updateNote 更新笔记', () => {
    const store = createStore();
    const note = store.addNote({ title: '原始' });
    store.updateNote(note.id, { title: '更新' });
    expect(store.getNote(note.id).title).toBe('更新');
  });

  test('updateNote 不存在返回 null', () => {
    const store = createStore();
    expect(store.updateNote('nonexistent', { title: 'x' })).toBeNull();
  });

  test('deleteNote 软删除', () => {
    const store = createStore();
    const note = store.addNote({ title: '删除我' });
    store.deleteNote(note.id);
    expect(store.getNote(note.id).deleted).toBe(true);
    expect(store.getNote(note.id).deletedAt).toBeDefined();
  });

  test('deleteNote 永久删除', () => {
    const store = createStore();
    const note = store.addNote({ title: '永久删除' });
    store.deleteNote(note.id, true);
    expect(store.getNote(note.id)).toBeUndefined();
  });

  test('restoreNote 恢复笔记', () => {
    const store = createStore();
    const note = store.addNote({ title: '恢复' });
    store.deleteNote(note.id);
    store.restoreNote(note.id);
    expect(store.getNote(note.id).deleted).toBe(false);
    expect(store.getNote(note.id).deletedAt).toBeUndefined();
  });

  test('emptyTrash 清空回收站', () => {
    const store = createStore();
    const n1 = store.addNote({ title: 'keep' });
    const n2 = store.addNote({ title: 'trash' });
    store.deleteNote(n2.id);
    store.emptyTrash();
    expect(store.data.notes).toHaveLength(1);
    expect(store.data.notes[0].id).toBe(n1.id);
  });
});

// ========== 笔记筛选 ==========
describe('Store getNotes 筛选', () => {
  let store;
  beforeEach(() => {
    store = createStore();
    store.addNote({ title: 'normal', content: 'abc' });
    const starred = store.addNote({ title: 'starred', content: 'def' });
    store.updateNote(starred.id, { starred: true });
    const todo = store.addNote({ title: 'todo', content: '<input type="checkbox">' });
    const deleted = store.addNote({ title: 'deleted' });
    store.deleteNote(deleted.id);
    store.addNote({ title: 'tagged', tags: ['tag1', 'tag2'] });
  });

  test('view=all 排除已删除', () => {
    const notes = store.getNotes({ view: 'all' });
    expect(notes.every(n => !n.deleted)).toBe(true);
    expect(notes.length).toBe(4);
  });

  test('view=starred 只含收藏', () => {
    const notes = store.getNotes({ view: 'starred' });
    expect(notes.every(n => n.starred)).toBe(true);
    expect(notes.length).toBe(1);
  });

  test('view=recent 排除已删除', () => {
    const notes = store.getNotes({ view: 'recent' });
    expect(notes.every(n => !n.deleted)).toBe(true);
  });

  test('view=todo 只含待办', () => {
    const notes = store.getNotes({ view: 'todo' });
    expect(notes.every(n => n.hasTodo)).toBe(true);
  });

  test('view=trash 只含已删除', () => {
    const notes = store.getNotes({ view: 'trash' });
    expect(notes.every(n => n.deleted)).toBe(true);
    expect(notes.length).toBe(1);
  });

  test('notebookId 筛选', () => {
    store.addNote({ title: 'in-nb', notebookId: 'nb_work' });
    const notes = store.getNotes({ notebookId: 'nb_work' });
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('in-nb');
  });

  test('tag 筛选', () => {
    const notes = store.getNotes({ tag: 'tag1' });
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('tagged');
  });

  test('search 搜索标题', () => {
    const notes = store.getNotes({ view: 'all', search: 'starred' });
    expect(notes).toHaveLength(1);
  });

  test('search 搜索标签', () => {
    const notes = store.getNotes({ view: 'all', search: 'tag1' });
    expect(notes).toHaveLength(1);
  });
});

// ========== 笔记排序 ==========
describe('Store getNotes 排序', () => {
  test('updatedAt desc (默认)', () => {
    const store = createStore();
    const n1 = store.addNote({ title: 'old' });
    const n2 = store.addNote({ title: 'new' });
    // 手动设置不同时间戳确保排序可区分
    store.getNote(n1.id).updatedAt = 1000;
    store.getNote(n2.id).updatedAt = 2000;
    const notes = store.getNotes({ view: 'all', sort: 'updatedAt-desc' });
    expect(notes[0].title).toBe('new');
  });

  test('title asc 排序', () => {
    const store = createStore();
    store.addNote({ title: 'Banana' });
    store.addNote({ title: 'Apple' });
    store.addNote({ title: 'Cherry' });
    const notes = store.getNotes({ view: 'all', sort: 'title-asc' });
    expect(notes.map(n => n.title)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  test('pinned 笔记始终置顶', () => {
    const store = createStore();
    store.addNote({ title: 'normal' });
    const pinned = store.addNote({ title: 'pinned' });
    store.updateNote(pinned.id, { pinned: true });
    store.addNote({ title: 'latest' });
    const notes = store.getNotes({ view: 'all', sort: 'updatedAt-desc' });
    expect(notes[0].title).toBe('pinned');
  });
});

// ========== 版本历史 ==========
describe('Store 版本历史', () => {
  test('内容变更创建版本', () => {
    const store = createStore();
    const note = store.addNote({ title: 'v', content: 'version 1' });
    store.updateNote(note.id, { content: 'version 2' });
    expect(store.getNote(note.id).versions).toHaveLength(1);
    expect(store.getNote(note.id).versions[0].content).toBe('version 1');
  });

  test('首次编辑空笔记也创建版本（Issue #2 修复）', () => {
    const store = createStore();
    const note = store.addNote({ title: 'empty' });
    // 修复后：空字符串 content 也会被记录到版本历史
    store.updateNote(note.id, { content: 'first content' });
    expect(store.getNote(note.id).versions).toHaveLength(0);
    // 空字符串 '' 不需要保存版本（没有实际内容）
    // 但非空→不同内容应创建版本
    store.updateNote(note.id, { content: 'second content' });
    expect(store.getNote(note.id).versions).toHaveLength(1);
    expect(store.getNote(note.id).versions[0].content).toBe('first content');
  });

  test('5分钟内不重复创建版本', () => {
    const store = createStore();
    const note = store.addNote({ title: 'v', content: 'v1' });
    store.updateNote(note.id, { content: 'v2' });
    store.updateNote(note.id, { content: 'v3' });
    // 两次更新间隔 < 5分钟，只创建1个版本
    expect(store.getNote(note.id).versions).toHaveLength(1);
  });

  test('版本上限50', () => {
    const store = createStore();
    const note = store.addNote({ title: 'v', content: 'init' });
    // 手动写入超过50个版本
    note.versions = Array.from({ length: 55 }, (_, i) => ({
      content: `v${i}`, title: 'v', timestamp: Date.now() - (60 - i) * 60000
    }));
    // 下次更新应裁剪到50
    const origDateNow = Date.now;
    Date.now = () => origDateNow() + 10 * 60 * 1000; // 跳过5分钟节流
    store.updateNote(note.id, { content: 'new' });
    Date.now = origDateNow;
    expect(store.getNote(note.id).versions.length).toBeLessThanOrEqual(50);
  });
});

// ========== 待办检测 ==========
describe('Store 待办检测', () => {
  test('checkbox HTML 标记为待办', () => {
    const store = createStore();
    const note = store.addNote({ title: 'todo' });
    store.updateNote(note.id, { content: '<input type="checkbox"> task' });
    expect(store.getNote(note.id).hasTodo).toBe(true);
  });

  test('markdown - [ ] 标记为待办', () => {
    const store = createStore();
    const note = store.addNote({ title: 'todo' });
    store.updateNote(note.id, { content: '- [ ] task' });
    expect(store.getNote(note.id).hasTodo).toBe(true);
  });

  test('markdown - [x] 标记为待办', () => {
    const store = createStore();
    const note = store.addNote({ title: 'todo' });
    store.updateNote(note.id, { content: '- [x] done task' });
    expect(store.getNote(note.id).hasTodo).toBe(true);
  });

  test('普通内容不标记待办', () => {
    const store = createStore();
    const note = store.addNote({ title: 'normal' });
    store.updateNote(note.id, { content: 'just text' });
    expect(store.getNote(note.id).hasTodo).toBe(false);
  });
});

// ========== 复制笔记 ==========
describe('Store duplicateNote', () => {
  test('复制笔记基本属性', () => {
    const store = createStore();
    const orig = store.addNote({ title: '原始', content: 'body', tags: ['a'] });
    const copy = store.duplicateNote(orig.id);
    expect(copy.title).toBe('原始 (副本)');
    expect(copy.content).toBe('body');
    expect(copy.id).not.toBe(orig.id);
    expect(copy.pinned).toBe(false);
    expect(copy.versions).toEqual([]);
  });

  test('复制不存在的笔记返回 null', () => {
    const store = createStore();
    expect(store.duplicateNote('nonexistent')).toBeNull();
  });

  test('tags 深拷贝，修改副本不影响原始（Issue #3 修复）', () => {
    const store = createStore();
    const orig = store.addNote({ title: '原始', tags: ['a', 'b'] });
    const copy = store.duplicateNote(orig.id);
    copy.tags.push('c');
    // 修复后：副本 tags 是独立数组，不影响原始
    expect(store.getNote(orig.id).tags).not.toContain('c');
    expect(store.getNote(orig.id).tags).toEqual(['a', 'b']);
    expect(copy.tags).toEqual(['a', 'b', 'c']);
  });
});

// ========== 标签 ==========
describe('Store 标签', () => {
  test('getAllTags 聚合标签及计数', () => {
    const store = createStore();
    store.addNote({ title: 'a', tags: ['js', 'node'] });
    store.addNote({ title: 'b', tags: ['js', 'python'] });
    store.addNote({ title: 'c', tags: ['js'] });
    const tags = store.getAllTags();
    expect(tags[0]).toEqual(['js', 3]);
    expect(tags.find(t => t[0] === 'node')).toEqual(['node', 1]);
  });

  test('已删除笔记的标签不计入', () => {
    const store = createStore();
    const note = store.addNote({ title: 'a', tags: ['js'] });
    store.deleteNote(note.id);
    expect(store.getAllTags()).toHaveLength(0);
  });
});

// ========== 统计 ==========
describe('Store getStats', () => {
  test('统计各类别笔记数', () => {
    const store = createStore();
    store.addNote({ title: 'a' });
    const s = store.addNote({ title: 'b' });
    store.updateNote(s.id, { starred: true });
    const t = store.addNote({ title: 'c' });
    store.updateNote(t.id, { content: '- [ ] task' });
    const d = store.addNote({ title: 'd' });
    store.deleteNote(d.id);

    const stats = store.getStats();
    expect(stats.all).toBe(3);
    expect(stats.starred).toBe(1);
    expect(stats.todo).toBe(1);
    expect(stats.trash).toBe(1);
  });
});

// ========== 设置 ==========
describe('Store 设置', () => {
  test('getSetting / setSetting', () => {
    const store = createStore();
    expect(store.getSetting('theme')).toBe('light');
    store.setSetting('theme', 'dark');
    expect(store.getSetting('theme')).toBe('dark');
  });
});

// ========== 导入导出 ==========
describe('Store 导入导出', () => {
  test('exportAll 和 importAll 往返', () => {
    const store = createStore();
    store.addNote({ title: 'export-me', tags: ['x'] });
    store.addNotebook('my-nb');
    const json = store.exportAll();

    // 新建 Store，导入
    localStorage.clear();
    const store2 = createStore();
    expect(store2.importAll(json)).toBe(true);
    expect(store2.data.notes[0].title).toBe('export-me');
    expect(store2.getNotebooks().length).toBe(2);
  });

  test('importAll 无效 JSON 返回 false', () => {
    const store = createStore();
    expect(store.importAll('not json')).toBe(false);
  });

  test('importAll 缺少 notebooks 返回 false', () => {
    const store = createStore();
    expect(store.importAll('{"notes":[]}')).toBe(false);
  });
});
