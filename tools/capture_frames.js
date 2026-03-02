/**
 * 多帧截图脚本 — 用于合成动态 GIF
 * 截取: 主题切换、编辑器切换、便签主题循环
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const sampleData = {
  notebooks: [
    { id: 'nb_default', name: '默认笔记本', parentId: null, order: 0, pinned: false, createdAt: Date.now() },
    { id: 'nb_work', name: '工作笔记', parentId: null, order: 1, pinned: true, createdAt: Date.now() },
    { id: 'nb_study', name: '学习笔记', parentId: null, order: 2, pinned: false, createdAt: Date.now() },
  ],
  notes: [
    {
      id: 'note_1', title: '2026 Q1 OKR 规划', type: 'richtext', notebookId: 'nb_work',
      content: '<h2>2026 Q1 OKR 规划</h2><p><strong>周期：</strong>2026 Q1</p><hr><h3>目标 1：提升产品用户体验</h3><p><em>优化核心功能和界面交互，提升用户满意度至 90%</em></p><ul><li><strong>KR 1：</strong>编辑器性能优化，加载速度提升 50%<br><small>进度：75%</small></li><li><strong>KR 2：</strong>新增 5 种办公模板<br><small>进度：100%</small></li><li><strong>KR 3：</strong>用户日活提升 30%<br><small>进度：60%</small></li></ul><h3>目标 2：拓展企业客户</h3><ul><li><strong>KR 1：</strong>完成产品售前材料<br><small>进度：80%</small></li></ul>',
      plainText: '2026 Q1 OKR 规划', tags: ['OKR', '规划'], pinned: true, starred: true,
      deleted: false, hasTodo: false, versions: [], createdAt: Date.now() - 86400000 * 3, updatedAt: Date.now() - 3600000
    },
    {
      id: 'note_2', title: '云笔记项目周报', type: 'richtext', notebookId: 'nb_work',
      content: '<h2>周报 - 2026/03/01</h2><h3>一、本周工作总结</h3><ol><li><strong>桌面便签：</strong>完成边缘隐藏和最小化</li><li><strong>PDF导出：</strong>集成 Electron printToPDF</li></ol><h3>二、关键成果</h3><ul><li>便签支持 6 种主题色</li><li>5 种格式导出完成</li></ul><h3>三、下周计划</h3><div class="todo-item"><input type="checkbox" checked><span class="todo-text">面板拖拽缩放</span></div><div class="todo-item"><input type="checkbox"><span class="todo-text">售前胶片制作</span></div>',
      plainText: '周报', tags: ['周报'], pinned: false, starred: false,
      deleted: false, hasTodo: true, versions: [], createdAt: Date.now() - 86400000, updatedAt: Date.now() - 7200000
    },
    {
      id: 'note_3', title: 'Markdown 学习笔记', type: 'markdown', notebookId: 'nb_study',
      content: '# Markdown 学习笔记\n\n## 基础语法\n\n### 代码块\n```javascript\nfunction hello() {\n  console.log("Hello, 云笔记!");\n  return true;\n}\n```\n\n### 表格\n| 功能 | 状态 |\n|------|------|\n| 富文本 | 完成 |\n| Markdown | 完成 |\n| PDF导出 | 完成 |\n\n## 待办\n- [x] 学习基础语法\n- [ ] 学习高级用法',
      plainText: 'Markdown 学习笔记', tags: ['Markdown'], pinned: false, starred: true,
      deleted: false, hasTodo: true, versions: [], createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000
    },
  ],
  settings: { theme: 'light', defaultEditor: 'richtext', listView: 'list', sortBy: 'updatedAt-desc' }
};

const stickyData = [
  { id: 1, text: '完成售前 PPT 制作', done: false, priority: 'high' },
  { id: 2, text: '准备客户演示环境', done: false, priority: 'high' },
  { id: 3, text: '更新产品需求文档', done: true, priority: 'medium' },
  { id: 4, text: '测试 PDF 导出功能', done: true, priority: 'low' },
  { id: 5, text: '优化面板拖拽体验', done: false, priority: 'medium' },
  { id: 6, text: '回复客户邮件', done: false, priority: 'low' },
];

async function cap(win, name, delay = 500) {
  await new Promise(r => setTimeout(r, delay));
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, name), img.toPNG());
  console.log('  ->', name);
}

app.on('window-all-closed', () => {}); // prevent auto-quit between windows

app.whenReady().then(async () => {
  try {
    // ====== GIF 1: 主界面主题切换 (light -> open note -> dark -> dark note) ======
    console.log('=== Main window theme switch ===');
    const mainWin = new BrowserWindow({
      width: 1280, height: 800, show: false,
      webPreferences: {
        preload: path.join(__dirname, '..', 'preload', 'preload.js'),
        contextIsolation: true, nodeIntegration: false
      }
    });
    await mainWin.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    const dataStr = JSON.stringify(sampleData).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    await mainWin.webContents.executeJavaScript(`
      localStorage.setItem('cloud_notes_db', '${dataStr}');
      location.reload();
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Frame 1: 亮色主界面
    await cap(mainWin, 'theme_f1.png', 300);

    // Frame 2: 打开 OKR 笔记
    await mainWin.webContents.executeJavaScript(`if(window.app) window.app.openNote('note_1');`);
    await cap(mainWin, 'theme_f2.png', 800);

    // Frame 3: 切换暗色
    await mainWin.webContents.executeJavaScript(`if(window.app) window.app.toggleTheme();`);
    await cap(mainWin, 'theme_f3.png', 800);

    // Frame 4: 暗色打开 Markdown
    await mainWin.webContents.executeJavaScript(`if(window.app) window.app.openNote('note_3');`);
    await cap(mainWin, 'theme_f4.png', 800);

    // Frame 5: 回到亮色
    await mainWin.webContents.executeJavaScript(`if(window.app) window.app.toggleTheme();`);
    await cap(mainWin, 'theme_f5.png', 800);

    mainWin.destroy();

    // ====== GIF 2: 便签主题循环 ======
    console.log('=== Sticky theme cycle ===');
    const stickyWin = new BrowserWindow({
      width: 320, height: 460, show: false,
      webPreferences: {
        preload: path.join(__dirname, '..', 'preload', 'preload.js'),
        contextIsolation: true, nodeIntegration: false
      }
    });
    await stickyWin.loadFile(path.join(__dirname, '..', 'sticky', 'sticky.html'));
    const sDataStr = JSON.stringify(stickyData).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    const stickyThemes = ['light', 'blue', 'green', 'pink', 'purple', 'dark'];
    for (let t = 0; t < stickyThemes.length; t++) {
      await stickyWin.webContents.executeJavaScript(`
        localStorage.setItem('sticky_todos', '${sDataStr}');
        localStorage.setItem('sticky_theme', '${stickyThemes[t]}');
        location.reload();
      `);
      await cap(stickyWin, `sticky_f${t+1}.png`, 1500);
    }
    stickyWin.destroy();

    console.log('All frames captured!');
  } catch (e) {
    console.error('Error:', e);
  }
  app.quit();
});
