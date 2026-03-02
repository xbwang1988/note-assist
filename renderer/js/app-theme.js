/**
 * 云笔记 - 主题管理
 */
App.prototype.applyTheme = function(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const sunEl = document.querySelector('.icon-sun');
  const moonEl = document.querySelector('.icon-moon');
  if (sunEl && moonEl) {
    sunEl.style.display = theme === 'light' ? 'inline' : 'none';
    moonEl.style.display = theme === 'dark' ? 'inline' : 'none';
  }
  const hljsLight = document.getElementById('hljs-light');
  const hljsDark = document.getElementById('hljs-dark');
  if (hljsLight) hljsLight.disabled = theme === 'dark';
  if (hljsDark) hljsDark.disabled = theme === 'light';
};

App.prototype.toggleTheme = function() {
  const current = this.store.getSetting('theme');
  const next = current === 'light' ? 'dark' : 'light';
  this.store.setSetting('theme', next);
  this.applyTheme(next);
};
