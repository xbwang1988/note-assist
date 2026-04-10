const { BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const { getAppIcon } = require('./app-icon');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '云笔记',
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
    backgroundColor: '#f7f8fa'
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 编辑器右键菜单（复制/粘贴/剪切/全选）
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const { isEditable, selectionText, editFlags } = params;
    const menuItems = [];

    if (selectionText) {
      menuItems.push({
        label: '复制',
        role: 'copy',
        enabled: editFlags.canCopy
      });
    }

    if (isEditable) {
      menuItems.push(
        {
          label: '剪切',
          role: 'cut',
          enabled: editFlags.canCut
        },
        {
          label: '粘贴',
          role: 'paste',
          enabled: editFlags.canPaste
        },
        { type: 'separator' },
        {
          label: '撤销',
          role: 'undo',
          enabled: editFlags.canUndo
        },
        {
          label: '重做',
          role: 'redo',
          enabled: editFlags.canRedo
        },
        { type: 'separator' },
        {
          label: '全选',
          role: 'selectAll',
          enabled: editFlags.canSelectAll
        }
      );
    } else if (selectionText) {
      // 非编辑区域但有选中文本时也提供全选
      menuItems.push({
        label: '全选',
        role: 'selectAll'
      });
    }

    if (menuItems.length > 0) {
      const menu = Menu.buildFromTemplate(menuItems);
      menu.popup();
    }
  });

  return mainWindow;
}

function getMainWindow() {
  return mainWindow;
}

function setMainWindow(win) {
  mainWindow = win;
}

module.exports = { createWindow, getMainWindow, setMainWindow };
