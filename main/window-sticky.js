const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { getAppIcon } = require('./app-icon');

let stickyWindow = null;
let stickyPinned = true;
let stickyHiddenEdge = null;    // null | 'left' | 'right' | 'top'
let stickyRestoreRect = null;   // {x, y, width, height} 隐藏前的位置

const EDGE_THRESHOLD = 40;   // 距边缘像素阈值
const EDGE_PEEK = 6;         // 隐藏后露出的像素

function createStickyWindow() {
  if (stickyWindow) {
    stickyWindow.show();
    stickyWindow.focus();
    return;
  }

  // 在屏幕右下角显示
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const stickyW = 320;
  const stickyH = 460;

  stickyWindow = new BrowserWindow({
    width: stickyW,
    height: stickyH,
    x: sw - stickyW - 20,
    y: sh - stickyH - 20,
    minWidth: 260,
    minHeight: 300,
    maxWidth: 500,
    maxHeight: 700,
    frame: false,
    transparent: false,
    backgroundColor: '#fffde7',
    alwaysOnTop: stickyPinned,
    skipTaskbar: false,
    resizable: true,
    title: '桌面便签',
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload-sticky.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  stickyWindow.loadFile(path.join(__dirname, '..', 'sticky', 'sticky.html'));

  stickyWindow.on('closed', () => {
    stickyWindow = null;
    stickyHiddenEdge = null;
    stickyRestoreRect = null;
  });

  // ---- 拖动到屏幕边缘自动隐藏 ----
  let edgeCheckTimer = null;
  stickyWindow.on('move', () => {
    if (!stickyWindow || stickyHiddenEdge) return;
    if (edgeCheckTimer) clearTimeout(edgeCheckTimer);
    edgeCheckTimer = setTimeout(() => {
      checkEdgeHide();
    }, 300);
  });
}

// 检测便签是否到达屏幕边缘，执行隐藏
function checkEdgeHide() {
  if (!stickyWindow) return;
  const bounds = stickyWindow.getBounds();
  const workArea = screen.getPrimaryDisplay().workArea;

  let edge = null;

  if (bounds.x <= workArea.x + EDGE_THRESHOLD) {
    edge = 'left';
  } else if (bounds.x + bounds.width >= workArea.x + workArea.width - EDGE_THRESHOLD) {
    edge = 'right';
  } else if (bounds.y <= workArea.y + EDGE_THRESHOLD) {
    edge = 'top';
  }

  if (!edge) return;

  // 保存当前位置
  stickyRestoreRect = { ...bounds };
  stickyHiddenEdge = edge;

  // 移动到边缘外，只露出一小条
  const target = { ...bounds };
  if (edge === 'left') {
    target.x = workArea.x - bounds.width + EDGE_PEEK;
  } else if (edge === 'right') {
    target.x = workArea.x + workArea.width - EDGE_PEEK;
  } else if (edge === 'top') {
    target.y = workArea.y - bounds.height + EDGE_PEEK;
  }

  stickyWindow.setBounds(target);
  stickyWindow.webContents.send('edge-hidden', edge);
}

// 从边缘恢复
function restoreFromEdge() {
  if (!stickyWindow || !stickyHiddenEdge || !stickyRestoreRect) return;
  stickyWindow.setBounds(stickyRestoreRect);
  stickyHiddenEdge = null;
  stickyRestoreRect = null;
  stickyWindow.webContents.send('edge-restored');
}

function getStickyWindow() {
  return stickyWindow;
}

function toggleStickyPin() {
  stickyPinned = !stickyPinned;
  if (stickyWindow) {
    stickyWindow.setAlwaysOnTop(stickyPinned);
    stickyWindow.webContents.send('pin-changed', stickyPinned);
  }
}

module.exports = {
  createStickyWindow,
  getStickyWindow,
  restoreFromEdge,
  toggleStickyPin
};
