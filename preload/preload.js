const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程安全暴露 API
contextBridge.exposeInMainWorld('electronAPI', {
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (_event, action, data) => callback(action, data)),
  openSticky: () => ipcRenderer.send('open-sticky'),
  exportPDF: (html, title) => ipcRenderer.invoke('export-pdf', html, title),
  isElectron: true
});
