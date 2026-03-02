const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeSticky: () => ipcRenderer.send('sticky-close'),
  minimizeSticky: () => ipcRenderer.send('sticky-minimize'),
  togglePin: () => ipcRenderer.send('sticky-toggle-pin'),
  onPinChanged: (callback) => ipcRenderer.on('pin-changed', (_event, pinned) => callback(pinned)),
  onEdgeHidden: (callback) => ipcRenderer.on('edge-hidden', (_event, edge) => callback(edge)),
  onEdgeRestored: (callback) => ipcRenderer.on('edge-restored', () => callback()),
  restoreFromEdge: () => ipcRenderer.send('sticky-restore-edge'),
  isElectron: true
});
