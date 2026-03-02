const { app, BrowserWindow } = require('electron');
const { createWindow, getMainWindow } = require('./window-main');
const { getStickyWindow } = require('./window-sticky');
const { createTray, destroyTray } = require('./tray');
const { setAppMenu } = require('./menu');
const { setupIPC } = require('./ipc');

// 修复部分 Windows 环境下 GPU / 渲染进程崩溃
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// 注册 IPC 处理器
setupIPC();

// ==================== 应用生命周期 ====================
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      initApp();
    }
  });

  app.whenReady().then(() => initApp());

  app.on('window-all-closed', () => {
    app.quit();
  });

  // 退出前清理托盘和所有窗口
  app.on('before-quit', () => {
    isQuitting = true;
    destroyTray();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) initApp();
  });
}

function initApp() {
  const mainWindow = createWindow();

  // 主窗口关闭时，同时关闭便签窗口，确保进程能正常退出
  mainWindow.on('closed', () => {
    const stickyWindow = getStickyWindow();
    if (stickyWindow) {
      stickyWindow.destroy();
    }
  });

  setAppMenu();
  createTray();
}
