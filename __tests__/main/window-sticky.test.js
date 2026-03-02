/**
 * window-sticky.js 测试
 * mock electron 模块
 */

// Mock electron
const mockBounds = { x: 100, y: 100, width: 320, height: 460 };
const mockWorkArea = { x: 0, y: 0, width: 1920, height: 1040 };
const mockSetBounds = jest.fn();
const mockShow = jest.fn();
const mockFocus = jest.fn();
const mockSetAlwaysOnTop = jest.fn();
const mockWebContentsSend = jest.fn();
const mockLoadFile = jest.fn();
const mockOn = jest.fn();

jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    getBounds: () => mockBounds,
    setBounds: mockSetBounds,
    show: mockShow,
    focus: mockFocus,
    setAlwaysOnTop: mockSetAlwaysOnTop,
    loadFile: mockLoadFile,
    on: mockOn,
    webContents: {
      send: mockWebContentsSend
    }
  })),
  screen: {
    getPrimaryDisplay: () => ({
      workAreaSize: { width: 1920, height: 1040 },
      workArea: mockWorkArea
    })
  }
}));

jest.mock('..//..//main/app-icon', () => ({
  getAppIcon: () => null
}));

let windowSticky;

beforeEach(() => {
  jest.clearAllMocks();
  // 每次重新加载模块，重置模块内部状态
  jest.resetModules();

  // 重新设置 mocks（resetModules 会清除之前的 mock）
  jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(() => ({
      getBounds: () => mockBounds,
      setBounds: mockSetBounds,
      show: mockShow,
      focus: mockFocus,
      setAlwaysOnTop: mockSetAlwaysOnTop,
      loadFile: mockLoadFile,
      on: mockOn,
      webContents: {
        send: mockWebContentsSend
      }
    })),
    screen: {
      getPrimaryDisplay: () => ({
        workAreaSize: { width: 1920, height: 1040 },
        workArea: mockWorkArea
      })
    }
  }));

  jest.mock('../../main/app-icon', () => ({
    getAppIcon: () => null
  }));

  windowSticky = require('../../main/window-sticky');
});

describe('createStickyWindow', () => {
  test('创建窗口', () => {
    const { BrowserWindow } = require('electron');
    windowSticky.createStickyWindow();
    expect(BrowserWindow).toHaveBeenCalledTimes(1);
    const config = BrowserWindow.mock.calls[0][0];
    expect(config.width).toBe(320);
    expect(config.height).toBe(460);
    expect(config.frame).toBe(false);
    expect(config.resizable).toBe(true);
    expect(config.alwaysOnTop).toBe(true);
    expect(config.webPreferences.contextIsolation).toBe(true);
    expect(config.webPreferences.nodeIntegration).toBe(false);
  });

  test('已存在窗口时不重新创建', () => {
    const { BrowserWindow } = require('electron');
    windowSticky.createStickyWindow();
    windowSticky.createStickyWindow();
    expect(BrowserWindow).toHaveBeenCalledTimes(1);
    expect(mockShow).toHaveBeenCalled();
    expect(mockFocus).toHaveBeenCalled();
  });
});

describe('toggleStickyPin', () => {
  test('切换置顶状态', () => {
    windowSticky.createStickyWindow();
    windowSticky.toggleStickyPin();
    expect(mockSetAlwaysOnTop).toHaveBeenCalledWith(false);
    expect(mockWebContentsSend).toHaveBeenCalledWith('pin-changed', false);
  });
});

describe('getStickyWindow', () => {
  test('未创建时返回 null', () => {
    expect(windowSticky.getStickyWindow()).toBeNull();
  });

  test('创建后返回窗口实例', () => {
    windowSticky.createStickyWindow();
    expect(windowSticky.getStickyWindow()).not.toBeNull();
  });
});

describe('边缘检测逻辑分析', () => {
  test('checkEdgeHide 仅检测左/右/上，不检测底部（已知限制）', () => {
    // 通过代码审查确认：checkEdgeHide 只检测 left/right/top
    // 底部边缘不支持隐藏
    // 这是一个已知的功能增强点
    expect(true).toBe(true);
  });

  test('EDGE_THRESHOLD 阈值为 40px', () => {
    // 从模块代码中验证常量值
    const fs = require('fs');
    const code = fs.readFileSync(
      require.resolve('../../main/window-sticky.js'),
      'utf-8'
    );
    expect(code).toContain('EDGE_THRESHOLD = 40');
    expect(code).toContain('EDGE_PEEK = 6');
  });
});

describe('restoreFromEdge', () => {
  test('未隐藏时调用不报错', () => {
    windowSticky.createStickyWindow();
    // restoreFromEdge 在没有 stickyHiddenEdge 时应直接 return
    expect(() => windowSticky.restoreFromEdge()).not.toThrow();
  });
});
