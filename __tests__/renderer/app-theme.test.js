/**
 * 主题管理测试 - 覆盖 app-theme.js 和 variables.css
 */
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { loadBrowserModule } = require('../helpers/load-browser-module');

let App, ctx;

function createThemeApp() {
  // 加载 store (theme 依赖 store)
  ctx = loadBrowserModule(
    path.resolve(__dirname, '../../renderer/js/store.js'),
    {
      App: function App() {
        this.store = new ctx.Store();
      }
    }
  );

  // 加载 app-theme.js 到同一上下文
  const code = fs.readFileSync(
    path.resolve(__dirname, '../../renderer/js/app-theme.js'),
    'utf-8'
  );
  vm.runInContext(code, ctx);

  App = ctx.App;
  return new App();
}

beforeEach(() => {
  localStorage.clear();
  // 添加 theme toggle 按钮和 hljs 样式元素
  document.body.innerHTML = `
    <button id="btnThemeToggle"></button>
    <link id="hljs-light" rel="stylesheet">
    <link id="hljs-dark" rel="stylesheet">
  `;
});

// ========== 主题配置 ==========
describe('主题配置', () => {
  test('THEMES 包含6个主题', () => {
    createThemeApp();
    expect(App.THEMES).toHaveLength(6);
  });

  test('每个主题有 id/label/icon 属性', () => {
    createThemeApp();
    App.THEMES.forEach(theme => {
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('label');
      expect(theme).toHaveProperty('icon');
      expect(typeof theme.id).toBe('string');
      expect(typeof theme.label).toBe('string');
      expect(typeof theme.icon).toBe('string');
    });
  });

  test('主题 ID 列表正确', () => {
    createThemeApp();
    const ids = App.THEMES.map(t => t.id);
    expect(ids).toEqual(['light', 'ocean', 'forest', 'dark', 'purple', 'sunset']);
  });

  test('DARK_THEMES 标记 dark 和 purple 为深色', () => {
    createThemeApp();
    expect(App.DARK_THEMES).toEqual(['dark', 'purple']);
  });
});

// ========== applyTheme ==========
describe('applyTheme', () => {
  test('设置 data-theme 属性到 documentElement', () => {
    const app = createThemeApp();
    app.applyTheme('ocean');
    expect(document.documentElement.getAttribute('data-theme')).toBe('ocean');
  });

  test('浅色主题启用 hljs-light 禁用 hljs-dark', () => {
    const app = createThemeApp();
    app.applyTheme('light');
    expect(document.getElementById('hljs-light').disabled).toBe(false);
    expect(document.getElementById('hljs-dark').disabled).toBe(true);
  });

  test('深色主题启用 hljs-dark 禁用 hljs-light', () => {
    const app = createThemeApp();
    app.applyTheme('dark');
    expect(document.getElementById('hljs-light').disabled).toBe(true);
    expect(document.getElementById('hljs-dark').disabled).toBe(false);
  });

  test('purple 作为深色主题处理', () => {
    const app = createThemeApp();
    app.applyTheme('purple');
    expect(document.getElementById('hljs-light').disabled).toBe(true);
    expect(document.getElementById('hljs-dark').disabled).toBe(false);
  });

  test('ocean 作为浅色主题处理', () => {
    const app = createThemeApp();
    app.applyTheme('ocean');
    expect(document.getElementById('hljs-light').disabled).toBe(false);
    expect(document.getElementById('hljs-dark').disabled).toBe(true);
  });

  test('forest 作为浅色主题处理', () => {
    const app = createThemeApp();
    app.applyTheme('forest');
    expect(document.getElementById('hljs-light').disabled).toBe(false);
    expect(document.getElementById('hljs-dark').disabled).toBe(true);
  });

  test('sunset 作为浅色主题处理', () => {
    const app = createThemeApp();
    app.applyTheme('sunset');
    expect(document.getElementById('hljs-light').disabled).toBe(false);
    expect(document.getElementById('hljs-dark').disabled).toBe(true);
  });

  test('更新按钮文字和 title', () => {
    const app = createThemeApp();
    app.applyTheme('ocean');
    const btn = document.getElementById('btnThemeToggle');
    expect(btn.innerHTML).toContain('海洋蓝');
    expect(btn.title).toBe('切换主题 (海洋蓝)');
  });

  test('未知主题回退到 light 配置', () => {
    const app = createThemeApp();
    app.applyTheme('nonexistent');
    const btn = document.getElementById('btnThemeToggle');
    expect(btn.innerHTML).toContain('浅色');
  });
});

// ========== toggleTheme ==========
describe('toggleTheme', () => {
  test('从 light 切换到 ocean', () => {
    const app = createThemeApp();
    app.store.setSetting('theme', 'light');
    app.toggleTheme();
    expect(app.store.getSetting('theme')).toBe('ocean');
    expect(document.documentElement.getAttribute('data-theme')).toBe('ocean');
  });

  test('完整循环切换：light → ocean → forest → dark → purple → sunset → light', () => {
    const app = createThemeApp();
    const expected = ['ocean', 'forest', 'dark', 'purple', 'sunset', 'light'];
    app.store.setSetting('theme', 'light');
    expected.forEach(nextTheme => {
      app.toggleTheme();
      expect(app.store.getSetting('theme')).toBe(nextTheme);
    });
  });

  test('默认主题为 light（未设置时）', () => {
    const app = createThemeApp();
    // store 默认 theme 是 light
    app.toggleTheme();
    expect(app.store.getSetting('theme')).toBe('ocean');
  });

  test('切换后持久化到 store', () => {
    const app = createThemeApp();
    app.store.setSetting('theme', 'forest');
    app.toggleTheme();
    expect(app.store.getSetting('theme')).toBe('dark');
    // 重新加载验证持久化
    const raw = JSON.parse(localStorage.getItem('cloud_notes_db'));
    expect(raw.settings.theme).toBe('dark');
  });
});

// ========== CSS 变量完整性校验 ==========
describe('CSS 主题变量完整性', () => {
  const cssContent = fs.readFileSync(
    path.resolve(__dirname, '../../renderer/css/variables.css'),
    'utf-8'
  );

  // 提取 :root 中定义的所有 CSS 变量名（排除布局/字体等非主题变量）
  const themeVarPattern = /--(?:bg|text|border|accent|shadow)-[\w-]+/g;
  const rootBlock = cssContent.match(/:root\s*\{([^}]+)\}/s);
  const rootVars = rootBlock ? [...new Set(rootBlock[1].match(themeVarPattern))] : [];

  const themes = ['dark', 'ocean', 'forest', 'purple', 'sunset'];

  themes.forEach(theme => {
    test(`[data-theme="${theme}"] 覆盖所有主题相关变量`, () => {
      const themeRegex = new RegExp(
        `\\[data-theme="${theme}"\\]\\s*\\{([^}]+)\\}`,
        's'
      );
      const match = cssContent.match(themeRegex);
      expect(match).not.toBeNull();

      const themeVars = [...new Set(match[1].match(themeVarPattern))];

      // 每个主题至少应该覆盖背景、文字、边框、强调色、阴影
      const requiredPrefixes = ['--bg-', '--text-', '--border-', '--accent-', '--shadow-'];
      requiredPrefixes.forEach(prefix => {
        const hasPrefix = themeVars.some(v => v.startsWith(prefix));
        expect(hasPrefix).toBe(true);
      });
    });
  });

  test('所有主题 ID 在 CSS 中都有对应选择器', () => {
    const themeIds = ['light', 'dark', 'ocean', 'forest', 'purple', 'sunset'];
    themeIds.forEach(id => {
      if (id === 'light') {
        // light 定义在 :root
        expect(cssContent).toContain(':root');
      } else {
        expect(cssContent).toContain(`[data-theme="${id}"]`);
      }
    });
  });

  test('深色主题背景色值较暗', () => {
    // purple 和 dark 的 --bg-primary 应该是暗色（以 #1 或 #2 开头）
    const darkThemes = ['dark', 'purple'];
    darkThemes.forEach(theme => {
      const match = cssContent.match(
        new RegExp(`\\[data-theme="${theme}"\\][^}]*--bg-primary:\\s*(#[0-9a-fA-F]+)`)
      );
      expect(match).not.toBeNull();
      // 暗色 hex 前两位数值较低
      const hex = match[1];
      const r = parseInt(hex.slice(1, 3), 16);
      expect(r).toBeLessThan(80); // 深色背景 R 值应该较低
    });
  });

  test('浅色主题背景色值较亮', () => {
    const lightThemes = ['ocean', 'forest', 'sunset'];
    lightThemes.forEach(theme => {
      const match = cssContent.match(
        new RegExp(`\\[data-theme="${theme}"\\][^}]*--bg-primary:\\s*(#[0-9a-fA-F]+)`)
      );
      expect(match).not.toBeNull();
      const hex = match[1];
      const r = parseInt(hex.slice(1, 3), 16);
      expect(r).toBeGreaterThan(200); // 浅色背景 R 值应该较高
    });
  });
});
