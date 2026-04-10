# 云笔记项目可复用 Skill 清单

> 从云笔记项目全流程中提炼的可复用 Skill，按软件工程阶段分类。
> 每个 Skill 包含：名称、适用场景、核心内容/Prompt 模板、项目中的参考文件。

---

## 一、需求管理 Skill

### Skill 1：竞品调研 Prompt
- **适用场景**：新产品立项前的市场分析
- **Prompt 模板**：
  ```
  你是一位资深产品经理。我要开发一款[产品类型]，请帮我做竞品调研，
  对比[竞品A]、[竞品B]、[竞品C]、[竞品D]，
  输出对比矩阵（核心优势 × 可借鉴点）和差异化定位建议。
  ```
- **参考**：`docs/workflow-log.md` 阶段一

### Skill 2：结构化 PRD 模板
- **适用场景**：任何产品的需求文档编写
- **核心结构**：
  ```
  产品概述 → 功能需求（模块×子功能×优先级表格）→ 非功能需求
  → 技术架构（架构图+数据模型+接口设计）→ 里程碑计划 → 风险识别
  ```
- **关键技巧**：
  - 功能表格标注 P0/P1/P2/P3 优先级
  - 数据模型用 JS 伪代码描述，可直接转实现
  - 非功能需求量化（冷启动 < 3s、响应 < 50ms）
- **参考**：`docs/note-prd.md`、`docs/development-standard.md` § 1.2

### Skill 3：MVP 范围裁剪原则
- **适用场景**：功能范围过大需要聚焦时
- **原则**：
  - P0/P1 做、P2 规划、P3 搁置
  - 优先砍掉需要后端/第三方服务的功能
  - 核心体验 > 功能数量
  - "先做减法，做好核心体验，再迭代扩展"
- **参考**：`docs/workflow-log.md` 决策 1

### Skill 4：PRD 迭代更新
- **适用场景**：版本开发完成后同步更新需求文档
- **操作**：
  - 为每个功能标注 ✅ 已实现 / 规划中
  - 补充实际技术架构章节
  - 重新排列未实现功能优先级
- **参考**：`docs/note-prd.md` v1.0 → v2.0

---

## 二、UED 设计 Skill

### Skill 5：交互式 HTML 设计规范生成
- **适用场景**：无专业设计工具时快速建立视觉规范
- **Prompt 模板**：
  ```
  生成一份交互式 HTML 设计规范文档，包含：
  色彩系统（主色/中性色/语义色）、文字排版（字体/字号/行高阶梯）、
  间距与圆角体系、阴影层级、组件样式（按钮/输入框/卡片/Toast）。
  直接在浏览器中可预览所有 Design Token 的实际渲染效果。
  ```
- **参考**：`docs/ued-design-spec.html`（76.4KB）

### Skill 6：CSS Design Token 命名规范
- **适用场景**：任何前端项目的 CSS 变量体系设计
- **命名规则**：`--{类别}-{语义}`
  - 背景：`--bg-primary`, `--bg-secondary`, `--bg-hover`, `--bg-sidebar`
  - 文字：`--text-primary`, `--text-secondary`, `--text-link`
  - 强调：`--accent`, `--accent-hover`, `--accent-light`
  - 语义：`--success`, `--warning`, `--danger`
  - 布局：`--sidebar-width`, `--toolbar-height`
  - 圆角：`--radius-sm`(4px), `--radius-md`(8px), `--radius-lg`(12px)
  - 字体：`--font-sans`, `--font-mono`
- **参考**：`renderer/css/variables.css`（89 行）

### Skill 7：`[data-theme]` 主题切换模式
- **适用场景**：需要亮色/暗色主题的前端项目
- **实现**：
  ```css
  :root { --bg-primary: #fff; --text-primary: #1a1a2e; }
  [data-theme="dark"] { --bg-primary: #1a1b2e; --text-primary: #e8e8f0; }
  ```
  ```javascript
  document.documentElement.dataset.theme = 'dark'; // 一行切换
  ```
- **优势**：零额外 CSS 文件、CSS 引擎自动重绘、维护方便
- **参考**：`renderer/css/variables.css`、`renderer/js/app-theme.js`

---

## 三、架构设计 Skill

### Skill 8：技术选型决策矩阵模板
- **适用场景**：任何技术选型需要多方案对比时
- **模板**：
  ```
  ## 技术决策：[主题]
  ### 背景：[为什么需要做这个决策]
  ### 候选方案对比：
  | 维度 | 方案A | 方案B | 方案C |
  | 项目适配度 ★★★★★ | ... | ... | ... |
  | 开发效率 ★★★★ | ... | ... | ... |
  | 生态成熟度 ★★★★ | ... | ... | ... |
  | 性能表现 ★★★ | ... | ... | ... |
  ### 结论：选用 [方案X]，原因：...
  ### 已知风险：...
  ```
- **参考**：`docs/development-standard.md` § 2.2、`docs/workflow-log.md` 决策 3-5

### Skill 9：Electron 安全架构清单
- **适用场景**：所有 Electron 桌面应用
- **必须项**：
  1. `contextIsolation: true` — 主进程与渲染进程隔离
  2. `nodeIntegration: false` — 渲染进程禁用 Node.js
  3. `contextBridge.exposeInMainWorld` — 预加载脚本安全暴露 API
  4. `app.requestSingleInstanceLock()` — 单实例锁
  5. `shell.openExternal` — 外部链接在系统浏览器打开
- **参考**：`main/index.js`、`preload/preload.js`

### Skill 10：Prototype Mixin 零构建模块化
- **适用场景**：不想引入构建工具的中小型前端项目（<5000 行）
- **模式**：
  ```javascript
  // app.js — 核心类
  class App { constructor() { this.init(); } }
  // app-sidebar.js — 通过原型扩展
  App.prototype.renderSidebar = function() { ... };
  // HTML 中按顺序 <script> 加载
  ```
- **加载顺序**：基础工具 → 数据层 → 核心类 → Mixin 扩展 → 初始化
- **参考**：`renderer/js/app.js` + `renderer/js/app-*.js`

---

## 四、软件开发 Skill

### Skill 11：渐进式开发模板
- **适用场景**：任何从零开始的产品开发
- **节奏**：
  ```
  MVP → 核心功能 → 完整功能 → 优化打磨 → 打包发布
  每一步都是可运行、可验证的
  ```
- **12 阶段参考**：需求 → 框架 → 编辑器 → 管理 → 效率工具 → 便签 → 导出 → UI → Bug → 打包 → 重构 → 文档
- **原则**：先跑通再完善、先核心再周边、先单机再联网、先功能再性能

### Skill 12：Electron 踩坑清单
- **适用场景**：所有 Electron 桌面应用开发
- **踩坑列表**：
  | 坑 | 解决 |
  |---|---|
  | Windows GPU 渲染崩溃 | `app.disableHardwareAcceleration()` + `disable-gpu` |
  | CDN 资源打包后不可用 | 第三方库全部本地化到 `vendor/` |
  | KaTeX/字体路径打包后失效 | 本地化字体 + 修正 `@font-face` 路径 |
  | frameless 窗口 `moved` 不触发 | 改用 `move` + setTimeout 防抖 |
  | `transparent: true` 渲染异常 | 改用 `backgroundColor` + CSS 圆角 |
  | 打包时文件被占用 | 先 kill Electron 进程再打包 |
  | PDF 导出中文字体缺失 | 导出 HTML 指定中文 font-family fallback |
  | 主窗口关闭后进程不退出 | `closed` 事件中销毁便签窗口 |
  | 退出后托盘图标残留 | `before-quit` 事件中 `destroyTray()` |
- **参考**：`docs/workflow-log.md` 问题 1-11

### Skill 13：纯函数设计模式
- **适用场景**：从有副作用的功能中提取可测试逻辑
- **方法**：将 UI/系统交互逻辑与纯计算逻辑分离
- **示例**：
  ```javascript
  // 纯函数 — 可直接测试，无需 mock
  function detectEdge(bounds, workArea, threshold) { ... }
  function calcHiddenBounds(bounds, workArea, edge, peek) { ... }
  // 有副作用 — 调用纯函数 + 操作窗口
  function checkEdgeHide() {
    const edge = detectEdge(bounds, workArea, EDGE_THRESHOLD);
    if (edge) { stickyWindow.setBounds(calcHiddenBounds(...)); }
  }
  ```
- **参考**：`main/window-sticky.js`

### Skill 14：Electron PDF 导出方案
- **适用场景**：Electron 应用中需要导出 PDF
- **方案**：隐藏 BrowserWindow + `webContents.printToPDF`，零额外依赖
  ```javascript
  const pdfWin = new BrowserWindow({ show: false });
  await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  const pdfData = await pdfWin.webContents.printToPDF({ pageSize: 'A4' });
  fs.writeFileSync(filePath, pdfData);
  pdfWin.destroy();
  ```
- **注意**：导出 HTML 中需指定中文字体 fallback
- **参考**：`main/ipc.js`

### Skill 15：面板拖拽缩放通用方法
- **适用场景**：需要拖拽调整面板宽度的 UI
- **模式**：mousedown → mousemove(限制 min/max) → mouseup，设置 cursor + userSelect
- **参考**：`renderer/js/app.js` `setupPanelResizer()`

---

## 五、软件测试 Skill

### Skill 16：浏览器模块 vm 沙箱测试加载器
- **适用场景**：测试非 Node.js 模块的浏览器全局变量风格 JS 文件
- **核心技巧**：`hoistDeclarations` — 将顶层 `const`/`let` 转 `var`、`class` 转 `var 赋值表达式`，使声明挂到沙箱全局对象上
  ```javascript
  function hoistDeclarations(code) {
    return code
      .replace(/^const\s/gm, 'var ')
      .replace(/^let\s/gm, 'var ')
      .replace(/^class\s+(\w+)/gm, 'var $1 = class $1');
  }
  // vm.createContext(sandbox) → vm.runInContext(hoisted, context)
  ```
- **参考**：`__tests__/helpers/load-browser-module.js`

### Skill 17：Electron Mock 模板
- **适用场景**：Jest 测试 Electron 主进程模块
- **模板**：
  ```javascript
  jest.mock('electron', () => ({
    BrowserWindow: jest.fn().mockImplementation(() => ({
      getBounds: () => mockBounds,
      setBounds: jest.fn(),
      show: jest.fn(),
      focus: jest.fn(),
      setAlwaysOnTop: jest.fn(),
      loadFile: jest.fn(),
      on: jest.fn(),
      webContents: { send: jest.fn() }
    })),
    screen: {
      getPrimaryDisplay: () => ({
        workAreaSize: { width: 1920, height: 1040 },
        workArea: { x: 0, y: 0, width: 1920, height: 1040 }
      })
    }
  }));
  ```
- **注意**：每个 test 使用 `jest.resetModules()` 重置模块内部状态
- **参考**：`__tests__/main/window-sticky.test.js`

### Skill 18：Store 数据层测试覆盖矩阵
- **适用场景**：任何 CRUD 数据层的测试设计
- **覆盖维度**：
  - 初始化（默认值 / 持久化加载 / 损坏数据降级）
  - CRUD（创建 / 查询 / 更新 / 删除 / 恢复）
  - 筛选（多条件组合 / 搜索 / 标签过滤）
  - 排序（多字段 / 置顶优先）
  - 版本历史（创建 / 节流 / 上限裁剪）
  - 边界（空值 / 不存在 ID / 深拷贝验证）
  - 导入导出（往返 / 无效数据）
- **参考**：`__tests__/renderer/store.test.js`（10 个 describe、40+ 用例）

---

## 六、打包发布 Skill

### Skill 19：electron-builder NSIS 中文配置模板
- **适用场景**：面向中国用户的 Electron 应用打包
- **配置**：
  ```json
  {
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "产品中文名",
      "installerLanguages": ["zh_CN"],
      "language": "2052"
    }
  }
  ```
- **注意**：`files` 数组必须显式列出所有打包目录
- **参考**：`package.json`

---

## 七、Claude Code 使用 Skill

### Skill 20：MEMORY.md 跨会话记忆管理
- **适用场景**：使用 Claude Code 开发多会话项目
- **记录内容**：技术栈、项目结构、模块化模式、关键参数、打包注意事项
- **原则**：每次会话结束前更新、按语义组织而非时间、信息确认后才写入

### Skill 21：分阶段上下文管理
- **适用场景**：Claude Code 开发大型项目
- **方法**：
  - 每次会话聚焦一个明确目标（如"实现桌面便签"）
  - 只在需要时读取相关文件
  - 完成后更新 MEMORY.md

### Skill 22：Agent Team 角色切换
- **适用场景**：一人+AI 的全流程开发
- **角色切换 Prompt**：
  | 阶段 | Prompt 前缀 |
  |---|---|
  | 需求 | "你是资深产品经理..." |
  | 设计 | "你是 UED 设计师..." |
  | 架构 | "你是技术架构师..." |
  | 开发 | "实现以下功能..." |
  | 测试 | "你是测试工程师，为以下模块设计测试用例..." |
  | 打包 | "配置 electron-builder..." |

---

## 八、文档与工具 Skill

### Skill 23：开发工作流日志模板
- **适用场景**：任何需要记录开发过程的项目
- **每阶段记录**：工作内容 → 关键决策（方案对比表）→ 遇到的问题（现象→原因→解决）→ 产出物
- **参考**：`docs/workflow-log.md`

### Skill 24：产品开发规范模板
- **适用场景**：团队或个人建立标准开发流程
- **覆盖**：立项规范 → 技术选型规范 → 开发流程规范 → 测试规范 → 打包发布规范 → 文档规范 → 复盘规范
- **参考**：`docs/development-standard.md`

### Skill 25：跨语言自动化工具链
- **适用场景**：需要截图/GIF/PPT 等演示材料自动生成
- **工具链**：
  - JS：Electron `capturePage` 多帧截图
  - Python：Pillow GIF 合成 + python-pptx PPT 生成
- **参考**：`tools/capture_frames.js`、`tools/make_gifs.py`、`tools/make_ppt_v3.py`
