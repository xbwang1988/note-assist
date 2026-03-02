/**
 * 云笔记 - 全局初始化入口
 * 必须在所有其他 app-*.js 之后加载
 */
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();

  // Electron 菜单事件监听
  if (window.electronAPI) {
    window.electronAPI.onMenuAction((action, data) => {
      switch (action) {
        case 'new-note':
          window.app.createNewNote();
          break;
        case 'toggle-theme':
          window.app.toggleTheme();
          break;
        case 'export-all': {
          const json = window.app.store.exportAll();
          Utils.downloadFile(json, '云笔记_备份_' + new Date().toISOString().slice(0, 10) + '.json', 'application/json');
          window.app.showToast('全部数据已导出', 'success');
          break;
        }
        case 'import':
          if (data) {
            fetch(data).then(r => r.text()).then(text => {
              if (window.app.store.importAll(text)) {
                window.app.renderSidebar();
                window.app.renderNoteList();
                window.app.updateStats();
                window.app.showToast('数据导入成功', 'success');
              } else {
                window.app.showToast('导入失败：格式不正确', 'error');
              }
            }).catch(() => {
              window.app.showToast('导入失败：无法读取文件', 'error');
            });
          }
          break;
      }
    });
  }
});
