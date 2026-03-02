const { ipcMain, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const { getMainWindow } = require('./window-main');
const { createStickyWindow, getStickyWindow, restoreFromEdge, toggleStickyPin } = require('./window-sticky');

function setupIPC() {
  ipcMain.on('open-sticky', () => {
    createStickyWindow();
  });

  ipcMain.on('sticky-close', () => {
    const stickyWindow = getStickyWindow();
    if (stickyWindow) { stickyWindow.close(); }
  });

  ipcMain.on('sticky-minimize', () => {
    const stickyWindow = getStickyWindow();
    if (stickyWindow) { stickyWindow.minimize(); }
  });

  ipcMain.on('sticky-restore-edge', () => {
    restoreFromEdge();
  });

  // ---- 导出 PDF ----
  ipcMain.handle('export-pdf', async (_event, html, title) => {
    const mainWindow = getMainWindow();
    // 弹出保存对话框
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '导出为 PDF',
      defaultPath: `${title}.pdf`,
      filters: [{ name: 'PDF 文件', extensions: ['pdf'] }]
    });
    if (!filePath) return { success: false };

    // 创建隐藏窗口渲染 HTML，再调用 printToPDF
    const pdfWin = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false }
    });

    await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

    try {
      const pdfData = await pdfWin.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        margins: { top: 1, bottom: 1, left: 1, right: 1 }
      });
      fs.writeFileSync(filePath, pdfData);
      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      pdfWin.destroy();
    }
  });

  ipcMain.on('sticky-toggle-pin', () => {
    toggleStickyPin();
  });
}

module.exports = { setupIPC };
