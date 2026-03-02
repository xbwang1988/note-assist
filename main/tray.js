const { Menu, Tray } = require('electron');
const { getAppIcon } = require('./app-icon');
const { getMainWindow } = require('./window-main');
const { createStickyWindow } = require('./window-sticky');

let tray = null;

function createTray() {
  const iconData = getAppIcon().resize({ width: 16, height: 16 });
  tray = new Tray(iconData);
  tray.setToolTip('云笔记');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开云笔记',
      click: () => {
        const mainWindow = getMainWindow();
        if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
      }
    },
    {
      label: '桌面便签',
      click: () => createStickyWindow()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => { require('electron').app.quit(); }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });
}

function destroyTray() {
  if (tray) { tray.destroy(); tray = null; }
}

module.exports = { createTray, destroyTray };
