const { nativeImage } = require('electron');
const path = require('path');

// 从 assets/icon.png 加载应用图标（256x256 PNG，Windows 任务栏兼容）
function getAppIcon() {
  return nativeImage.createFromPath(
    path.join(__dirname, '..', 'assets', 'icon.png')
  );
}

module.exports = { getAppIcon };
