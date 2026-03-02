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

// Issue #6 & #7: 纯函数 detectEdge / calcHiddenBounds 测试
describe('detectEdge（纯函数）', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 1040 };
  const threshold = 40;

  test('左边缘检测', () => {
    expect(windowSticky.detectEdge({ x: 30, y: 300, width: 320, height: 460 }, workArea, threshold)).toBe('left');
  });

  test('右边缘检测', () => {
    expect(windowSticky.detectEdge({ x: 1570, y: 300, width: 320, height: 460 }, workArea, threshold)).toBe('right');
  });

  test('上边缘检测', () => {
    expect(windowSticky.detectEdge({ x: 500, y: 20, width: 320, height: 460 }, workArea, threshold)).toBe('top');
  });

  test('底部边缘检测（Issue #6 修复）', () => {
    expect(windowSticky.detectEdge({ x: 500, y: 550, width: 320, height: 460 }, workArea, threshold)).toBe('bottom');
  });

  test('不在边缘返回 null', () => {
    expect(windowSticky.detectEdge({ x: 500, y: 300, width: 320, height: 460 }, workArea, threshold)).toBeNull();
  });

  test('恰好在阈值边界', () => {
    // x = threshold (40) → 刚好在阈值内
    expect(windowSticky.detectEdge({ x: 40, y: 300, width: 320, height: 460 }, workArea, threshold)).toBe('left');
    // x = threshold + 1 (41) → 刚出阈值，不触发左边缘
    expect(windowSticky.detectEdge({ x: 41, y: 300, width: 320, height: 460 }, workArea, threshold)).not.toBe('left');
  });
});

describe('calcHiddenBounds（纯函数）', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 1040 };
  const peek = 6;

  test('左隐藏', () => {
    const result = windowSticky.calcHiddenBounds({ x: 30, y: 300, width: 320, height: 460 }, workArea, 'left', peek);
    expect(result.x).toBe(0 - 320 + 6);
  });

  test('右隐藏', () => {
    const result = windowSticky.calcHiddenBounds({ x: 1570, y: 300, width: 320, height: 460 }, workArea, 'right', peek);
    expect(result.x).toBe(1920 - 6);
  });

  test('上隐藏', () => {
    const result = windowSticky.calcHiddenBounds({ x: 500, y: 20, width: 320, height: 460 }, workArea, 'top', peek);
    expect(result.y).toBe(0 - 460 + 6);
  });

  test('底部隐藏（Issue #6 修复）', () => {
    const result = windowSticky.calcHiddenBounds({ x: 500, y: 550, width: 320, height: 460 }, workArea, 'bottom', peek);
    expect(result.y).toBe(1040 - 6);
  });
});

describe('restoreFromEdge', () => {
  test('未隐藏时调用不报错', () => {
    windowSticky.createStickyWindow();
    // restoreFromEdge 在没有 stickyHiddenEdge 时应直接 return
    expect(() => windowSticky.restoreFromEdge()).not.toThrow();
  });
});
