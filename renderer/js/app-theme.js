/**
 * 云笔记 - 主题管理
 */
App.THEMES = [
  { id: 'light',  label: '浅色',   icon: '&#9728;&#65039;' },
  { id: 'ocean',  label: '海洋蓝', icon: '&#127754;' },
  { id: 'forest', label: '森林绿', icon: '&#127795;' },
  { id: 'dark',   label: '深色',   icon: '&#127769;' },
  { id: 'purple', label: '星空紫', icon: '&#11088;' },
  { id: 'sunset', label: '日落橙', icon: '&#127749;' }
];

App.DARK_THEMES = ['dark', 'purple'];

App.prototype.applyTheme = function(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = App.DARK_THEMES.indexOf(theme) !== -1;

  // 更新按钮显示当前主题图标和名称
  const themeBtn = document.getElementById('btnThemeToggle');
  if (themeBtn) {
    const themeInfo = App.THEMES.find(function(t) { return t.id === theme; }) || App.THEMES[0];
    themeBtn.innerHTML = themeInfo.icon + ' <span class="theme-label">' + themeInfo.label + '</span>';
    themeBtn.title = '切换主题 (' + themeInfo.label + ')';
  }

  // highlight.js 主题切换
  const hljsLight = document.getElementById('hljs-light');
  const hljsDark = document.getElementById('hljs-dark');
  if (hljsLight) hljsLight.disabled = isDark;
  if (hljsDark) hljsDark.disabled = !isDark;
};

App.prototype.toggleTheme = function() {
  const current = this.store.getSetting('theme') || 'light';
  const ids = App.THEMES.map(function(t) { return t.id; });
  const idx = ids.indexOf(current);
  const next = ids[(idx + 1) % ids.length];
  this.store.setSetting('theme', next);
  this.applyTheme(next);
};
