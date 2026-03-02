const { Menu, dialog } = require('electron');
const { getMainWindow } = require('./window-main');
const { createStickyWindow } = require('./window-sticky');

function setAppMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建笔记',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const mainWindow = getMainWindow();
            mainWindow && mainWindow.webContents.send('menu-action', 'new-note');
          }
        },
        { type: 'separator' },
        {
          label: '桌面便签',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => createStickyWindow()
        },
        { type: 'separator' },
        {
          label: '导入数据',
          click: async () => {
            const mainWindow = getMainWindow();
            const { filePaths } = await dialog.showOpenDialog(mainWindow, {
              title: '导入数据',
              filters: [{ name: 'JSON', extensions: ['json'] }],
              properties: ['openFile']
            });
            if (filePaths.length > 0) {
              mainWindow.webContents.send('menu-action', 'import', filePaths[0]);
            }
          }
        },
        {
          label: '导出全部数据',
          click: () => {
            const mainWindow = getMainWindow();
            mainWindow && mainWindow.webContents.send('menu-action', 'export-all');
          }
        },
        { type: 'separator' },
        { label: '退出', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '切换主题',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            const mainWindow = getMainWindow();
            mainWindow && mainWindow.webContents.send('menu-action', 'toggle-theme');
          }
        },
        { type: 'separator' },
        { label: '放大', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: '重置缩放', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于云笔记',
          click: () => {
            const mainWindow = getMainWindow();
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于云笔记',
              message: '云笔记 v1.0.0',
              detail: '智能笔记助手\n支持富文本、Markdown、待办事项、桌面便签等功能。'
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { setAppMenu };
