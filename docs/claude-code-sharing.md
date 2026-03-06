# Claude Code 实战案例介绍 —— "云笔记"产品

> **主题**：使用 Claude Code 从零到一完整开发一款桌面笔记产品的全流程实践
>
> **关键词**：Claude Code · Electron · AI 辅助开发 · Agent Team · 可复用 Skill
>
> **项目周期**：2026 年 3 月（约 2 周）
>
> **开发模式**：AI 辅助的单人全栈开发

---

## 第一章 整体目标与项目概览

### 1.1 项目一句话描述

**云笔记** —— 一款基于 Electron + 原生 HTML/CSS/JS 构建的轻量级桌面笔记客户端，覆盖记录、整理、导出、桌面便签全场景，由一个人借助 Claude Code 从需求分析到打包发布完整交付。

### 1.2 关键数据

| 指标 | 数值 |
| :--- | :--- |
| 源码总行数 | ~2929 行（JS 2151 + CSS 89 变量 + HTML 等） |
| 开发阶段 | 12 个（需求分析 → 文档整理） |
| 模块文件数 | 46 个（主进程 7 + 渲染 JS 17 + CSS 13 + 便签 3 + 预加载 2 + 其他 4） |
| 关键技术决策 | 11 项 |
| 踩坑记录 | 11 个 |
| 产出文档 | PRD、开发计划书、开发规范、UED 设计稿、工作流日志、售前 PPT |

### 1.3 三大目标

本项目设定了三个递进式目标：

**目标一：全流程跑通**
从需求分析、UED 设计、架构设计、软件开发、软件测试到打包发布，每个环节都使用 Claude Code 作为核心生产力工具，验证 AI 辅助开发的完整可行性。

**目标二：Agent Team 模式**
在开发过程中，Claude Code 根据不同阶段扮演不同角色——产品经理、UED 设计师、架构师、开发工程师、测试工程师——形成 "一人 + AI 全角色" 的协作模式。

**目标三：沉淀可复用 Skill**
将每个环节中总结出的 Prompt 模式、模板、最佳实践固化为可复用的 Skill，形成标准化产出，供后续项目直接复用。

### 1.4 成果全景图

#### 功能清单

| 模块 | 核心功能 |
| :--- | :--- |
| 富文本编辑 | 完整排版工具栏、标题/列表/表格/代码块/公式/图片 |
| Markdown 编辑 | marked.js 渲染 + highlight.js 代码高亮 + KaTeX 公式 + 双栏预览 |
| 笔记管理 | 多级笔记本树、标签系统、全文搜索、多维排序、视图切换 |
| 效率工具 | 9 种模板、日历视图、历史版本（5 分钟间隔、50 版本上限） |
| 桌面便签 | Todo CRUD、优先级标记、6 种主题、边缘隐藏、窗口置顶 |
| 数据管理 | 5 种格式导出（PDF/HTML/MD/TXT/JSON）、全量备份/恢复 |
| 桌面客户端 | 系统托盘、菜单栏、快捷键、亮色/暗色主题、面板拖拽缩放 |
| 打包发布 | NSIS 安装包 + 便携版 |

#### 产出物列表

| 类别 | 产出物 |
| :--- | :--- |
| 可运行产品 | NSIS 安装包 (exe) + 便携版 |
| 产品文档 | PRD v2.0、开发计划书、UED 设计规范 (HTML) |
| 工程文档 | 开发规范模板、工作流日志（12 阶段全记录） |
| 演示材料 | 售前 PPT、产品截图、GIF 动图 |
| 测试代码 | Jest 测试套件（Store 数据层 + 主进程纯函数） |

#### 产品截图

> 主窗口亮色主题：`tools/screenshots/main-light.png`
>
> 主窗口暗色主题：`tools/screenshots/main-dark.png`
>
> 桌面便签效果：`tools/screenshots/demo_sticky.gif`
>
> 主题切换效果：`tools/screenshots/demo_theme.gif`

### 1.5 Claude Code 工作模式

#### MEMORY.md 跨会话记忆

Claude Code 的 MEMORY.md 机制是贯穿整个项目的关键基础设施。每次会话结束前，Claude Code 会将项目结构、技术决策、架构模式等关键信息写入 MEMORY.md，下次会话启动时自动加载，实现跨会话的上下文连续性。

在云笔记项目中，MEMORY.md 记录了：
- 项目技术栈与模块化模式（Prototype Mixin）
- 完整的文件结构映射
- 桌面便签的核心参数（EDGE_THRESHOLD=40, EDGE_PEEK=6）
- 打包注意事项
- 每次重构后的结构更新

**关键价值**：避免每次会话都要重新解释项目背景，Claude Code 能直接"接续"上次的工作状态。

#### 上下文管理

对于大型项目，合理管理 Claude Code 的上下文窗口至关重要：
- **分阶段推进**：每次会话聚焦一个明确的开发阶段（如"实现桌面便签"或"模块化重构"）
- **文件精准引用**：只在需要时读取相关文件，避免一次性加载过多内容
- **增量式记忆**：每完成一个阶段，更新 MEMORY.md 中的关键信息

#### 多 Agent 协作

Claude Code 在不同阶段自动切换角色身份：

| 阶段 | Agent 角色 | 核心输出 |
| :--- | :--- | :--- |
| 需求分析 | 产品经理 | PRD、竞品分析、MVP 范围 |
| UED 设计 | 设计师 | 设计规范 HTML、CSS Token |
| 架构设计 | 架构师 | 技术选型矩阵、分层架构 |
| 软件开发 | 全栈工程师 | 完整源码、模块化重构 |
| 软件测试 | 测试工程师 | 测试用例、测试代码 |
| 打包发布 | DevOps | 打包配置、安装包 |

---

## 第二章 需求管理

### 2.1 竞品调研

项目启动的第一步是让 Claude Code 扮演产品经理，进行系统性的竞品调研。

**Prompt 示例**：
```
你是一位资深产品经理。我要开发一款桌面笔记应用，请帮我做竞品调研，
对比有道云笔记、印象笔记、Typora、Notion、Windows 便签，
输出对比矩阵和可借鉴的设计点。
```

**Claude Code 输出的竞品对比矩阵**：

| 产品 | 核心优势 | 借鉴点 |
| :--- | :--- | :--- |
| 有道云笔记 | 全平台云同步、OCR | 整体功能架构、三栏布局 |
| 印象笔记 | 网页剪藏、标签管理 | 标签系统、模板库设计 |
| Typora | Markdown 所见即所得 | Markdown 编辑体验 |
| Notion | 块编辑器、数据库视图 | 模板系统、卡片化展示 |
| Windows 便签 | 轻量、桌面常驻 | 桌面便签的极简交互 |

### 2.2 PRD 编写

基于竞品调研结果，Claude Code 输出了结构化的 PRD 文档（`docs/note-prd.md`），涵盖：

1. **产品概述**：定位、目标用户、核心价值主张
2. **功能需求**：按模块分类，每个子功能标注优先级（P0-P3）
3. **非功能需求**：性能指标（冷启动 < 3s、输入延迟 < 50ms）
4. **技术架构**：系统架构图、数据模型、IPC 接口定义
5. **里程碑计划**：8 个阶段的交付节奏

**PRD 结构化输出的关键 Prompt 技巧**：
- 要求按"功能模块 → 子功能 → 表格"的固定格式输出，便于后续追踪
- 每个功能标注优先级（P0/P1/P2/P3），为 MVP 裁剪提供依据
- 数据模型用 JavaScript 伪代码描述，直接可转化为实现

```javascript
// PRD 中的数据模型定义，后续开发可直接使用
// 笔记
{ id, title, content, plainText, type('richtext'|'markdown'),
  notebookId, tags[], pinned, starred, deleted, deletedAt,
  hasTodo, versions[{content, title, timestamp}],
  createdAt, updatedAt }
```

### 2.3 MVP 范围界定

**决策 1："先做减法"**

初始 PRD 包含了理想化的全功能集（云同步、AI 辅助、OCR、协作编辑等），经过 Claude Code 辅助评估：

- 砍掉所有需要后端服务的功能（云同步、用户账户、协作）
- 砍掉技术复杂度高的功能（AI 辅助、OCR、知识图谱）
- v1.0 聚焦**本地单机场景**，做好核心体验

**原则**：先做减法，做好核心体验，再迭代扩展。

### 2.4 PRD 迭代更新

v1.0 开发完成后，Claude Code 辅助将 PRD 从 v1.0 更新为 v2.0：
- 为每个功能标注实现状态（✅ 已实现 / 规划中）
- 补充实际的技术架构章节
- 重新梳理未实现功能的优先级

### 2.5 可复用 Skill

| Skill | 内容 |
| :--- | :--- |
| PRD 模板 | 标准化 PRD 结构（产品概述 → 功能需求 → 非功能需求 → 技术架构 → 里程碑），详见 `docs/development-standard.md` 1.2 节 |
| 竞品调研 Prompt | "你是资深产品经理，对比 X/Y/Z 竞品，输出对比矩阵和借鉴点" |
| MVP 裁剪原则 | P0/P1 做、P2 规划、P3 搁置；优先砍后端依赖功能 |

---

## 第三章 UED 设计

### 3.1 交互式 HTML 设计规范

Claude Code 在 UED 设计阶段扮演设计师角色，直接生成了一份 **76.4KB 的交互式 HTML 设计规范文档**（`docs/ued-design-spec.html`），包含：

- 色彩系统（主色、中性色、语义色、渐变色）
- 文字排版（字体、字号、行高阶梯）
- 间距与圆角体系
- 阴影层级
- 组件样式（按钮、输入框、卡片、徽章、Toast）

**这份文档本身就是可交互的**——直接在浏览器中打开即可查看所有 Design Token 的实际渲染效果，比传统的 Figma 标注更直观。

### 3.2 CSS Design Token 体系

设计规范的核心产出是 `renderer/css/variables.css`——89 行 CSS 变量定义，构成了整个应用的视觉基础：

```css
:root {
  /* 背景色阶梯 */
  --bg-primary: #ffffff;
  --bg-secondary: #f7f8fa;
  --bg-tertiary: #eef0f4;
  --bg-hover: #e8eaef;
  --bg-active: #dce0e8;
  --bg-sidebar: #f0f2f5;
  --bg-editor: #ffffff;

  /* 文字色阶梯 */
  --text-primary: #1a1a2e;
  --text-secondary: #5a5a7a;
  --text-tertiary: #8a8aaa;

  /* 强调色 */
  --accent: #4f6ef7;
  --accent-hover: #3b5de7;
  --accent-light: #eef2ff;

  /* 语义色 */
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;

  /* 布局尺寸 */
  --sidebar-width: 260px;
  --notelist-width: 300px;
  --toolbar-height: 42px;

  /* 圆角体系 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* 字体 */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
}
```

**命名规范**：
- 背景色以 `--bg-` 开头，按使用场景命名而非颜色值
- 文字色以 `--text-` 开头，分 primary/secondary/tertiary 三级
- 尺寸类使用语义化命名（`--sidebar-width` 而非 `--width-260`）

### 3.3 主题切换设计

亮色/暗色主题通过 `[data-theme]` 选择器实现一键切换：

```css
[data-theme="dark"] {
  --bg-primary: #1a1b2e;
  --bg-secondary: #222338;
  --text-primary: #e8e8f0;
  --text-secondary: #a0a0c0;
  --accent: #6380ff;
  /* ... 所有变量重新赋值 */
}
```

**切换机制**：JavaScript 只需修改 `document.documentElement.dataset.theme = 'dark'`，整个应用的视觉风格即刻切换——无需加载额外 CSS 文件，无需操作 DOM 类名，CSS 引擎自动完成所有颜色重绘。

### 3.4 三栏布局设计

**决策 6：侧边栏结构**

采用"导航功能区 + 笔记本树 + 标签云"的三段式侧边栏：

```
┌──────────────────┐
│ 📝 全部笔记       │  ← 快捷入口
│ ⭐ 收藏           │
│ 🕐 最近           │
│ ☑️ 待办           │
│ 📌 桌面便签       │
│ 📅 日历           │
│ 📋 模板           │
│ 🗑️ 回收站         │
├──────────────────┤
│ 📁 笔记本         │  ← 树形目录
│  ├─ 默认笔记本    │
│  ├─ 工作          │
│  │   ├─ 项目A    │
│  │   └─ 项目B    │
│  └─ 学习          │
├──────────────────┤
│ 🏷️ 标签           │  ← 标签云
│  技术 工作 学习   │
└──────────────────┘
```

### 3.5 便签主题视觉方案

桌面便签提供 6 种主题色，每种主题包含背景色 + 标题栏色 + 强调色完整配色方案：

| 主题 | 背景色 | 场景 |
| :--- | :--- | :--- |
| 浅黄 (yellow) | `#fffde7` | 默认，经典便签色 |
| 蓝色 (blue) | `#e3f2fd` | 工作事务 |
| 绿色 (green) | `#e8f5e9` | 学习笔记 |
| 粉色 (pink) | `#fce4ec` | 生活记录 |
| 紫色 (purple) | `#f3e5f5` | 创意灵感 |
| 暗色 (dark) | `#263238` | 低光环境 |

### 3.6 可复用 Skill

| Skill | 内容 |
| :--- | :--- |
| CSS 变量命名规范 | `--{类别}-{语义}`，如 `--bg-primary`、`--text-secondary` |
| `[data-theme]` 主题切换模式 | 一套变量、两份赋值、JS 只改属性，零额外 CSS |
| HTML 设计规范生成 | Prompt："生成交互式 HTML 设计规范，包含色彩/排版/间距/组件" |

---

## 第四章 架构设计

### 4.1 四个关键技术选型决策

在架构设计阶段，Claude Code 扮演技术架构师角色，对每个技术决策点进行系统性评估。

#### 决策 3：Electron vs Tauri

| 维度 | Electron | Tauri |
| :--- | :--- | :--- |
| 技术栈 | HTML/CSS/JS（纯前端） | Rust + Web 前端 |
| 包体积 | ~270MB | ~10MB |
| 生态成熟度 | 极成熟（VS Code、Slack、Discord 同款） | 快速成长中 |
| 学习曲线 | 零（前端即上手） | 需学 Rust |
| **结论** | **选用** — Web 技术栈降低成本，单人可完成全栈 | 备选 |

#### 决策 4：原生 JS vs 前端框架

| 维度 | 原生 JS | React/Vue |
| :--- | :--- | :--- |
| 构建工具 | 无需（源码即运行代码） | 需要 Webpack/Vite |
| 项目规模 | ~2100 行主逻辑，完全胜任 | 为 <3000 行项目引入框架过重 |
| DOM 控制 | 完全控制，便于实现编辑器等复杂交互 | 虚拟 DOM 层增加编辑器实现复杂度 |
| **结论** | **选用** — 零构建、完全控制、减少依赖 | 中型以上项目再考虑 |

#### 决策 2：localStorage vs IndexedDB

| 维度 | localStorage | IndexedDB |
| :--- | :--- | :--- |
| 容量 | 5-10MB | 数百 MB |
| API 复杂度 | 极简（getItem/setItem） | 较复杂（事务、游标） |
| 适用场景 | 原型验证、快速迭代 | 数据密集型应用 |
| **结论** | **v1.0 选用** — 零配置，适合快速验证；v2.0 需迁移 | 长期目标 |

#### 决策 5：CDN vs 本地化

| 维度 | CDN 加载 | 本地化 (`vendor/`) |
| :--- | :--- | :--- |
| 开发便利 | 直接引用 URL | 需下载文件到本地 |
| 打包后可用性 | Electron 离线环境下不可用 | 始终可用 |
| **结论** | **本地化** — 桌面应用所有资源必须本地化 | — |

### 4.2 Electron 分层架构

```
┌─────────────────────────────────────────────────┐
│                 Electron 主进程                   │
│  main/index.js                                   │
│  ┌───────────┐ ┌───────────┐ ┌──────────────┐   │
│  │ 窗口管理   │ │ 系统托盘   │ │  菜单系统     │   │
│  └───────────┘ └───────────┘ └──────────────┘   │
│  ┌───────────┐ ┌───────────┐ ┌──────────────┐   │
│  │ IPC 通信   │ │ PDF 导出   │ │  边缘检测     │   │
│  └───────────┘ └───────────┘ └──────────────┘   │
└─────────────────────────────────────────────────┘
        │ preload.js          │ preload-sticky.js
        │ (contextBridge)     │ (contextBridge)
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│    主窗口渲染进程  │  │  便签窗口渲染进程  │
│  index.html       │  │  sticky.html      │
│  ┌──────────────┐ │  │  ┌──────────────┐ │
│  │ 三栏布局      │ │  │  │ Todo 管理     │ │
│  │ 侧边栏│列表│编辑│ │  │  │ 优先级/筛选   │ │
│  ├──────────────┤ │  │  │ 主题切换      │ │
│  │ Store 数据层  │ │  │  └──────────────┘ │
│  │ (localStorage)│ │  │  localStorage     │
│  └──────────────┘ │  └──────────────────┘
└──────────────────┘
```

**安全隔离三要素**：
1. `contextIsolation: true` — 主进程与渲染进程完全隔离
2. `nodeIntegration: false` — 渲染进程禁用 Node.js，防止 XSS 攻击链
3. `contextBridge.exposeInMainWorld` — 通过预加载脚本安全暴露有限 API

### 4.3 IPC 通信接口设计

主进程与渲染进程通过 10 个 IPC 通道通信：

| 通道 | 方向 | 描述 |
| :--- | :---: | :--- |
| `menu-action` | 主→渲染 | 菜单栏操作分发 |
| `open-sticky` | 渲染→主 | 打开便签窗口 |
| `sticky-close` | 渲染→主 | 关闭便签 |
| `sticky-minimize` | 渲染→主 | 最小化便签 |
| `sticky-toggle-pin` | 渲染→主 | 切换置顶 |
| `sticky-restore-edge` | 渲染→主 | 从边缘恢复 |
| `pin-changed` | 主→渲染 | 置顶状态通知 |
| `edge-hidden` | 主→渲染 | 边缘隐藏通知 |
| `edge-restored` | 主→渲染 | 边缘恢复通知 |
| `export-pdf` | 双向 | PDF 导出（invoke/handle） |

IPC 接口设计的实现（`main/ipc.js`）：

```javascript
function setupIPC() {
  ipcMain.on('open-sticky', () => { createStickyWindow(); });
  ipcMain.on('sticky-close', () => {
    const stickyWindow = getStickyWindow();
    if (stickyWindow) { stickyWindow.close(); }
  });
  // 导出 PDF — 使用 invoke/handle 双向通信
  ipcMain.handle('export-pdf', async (_event, html, title) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, { ... });
    const pdfWin = new BrowserWindow({ show: false, ... });
    await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    const pdfData = await pdfWin.webContents.printToPDF({ pageSize: 'A4' });
    fs.writeFileSync(filePath, pdfData);
    pdfWin.destroy();
  });
}
```

### 4.4 模块化演进

项目经历了从单文件到模块化的演进过程：

**演进前**：
- `main.js` — 单文件主进程
- `js/app.js` — 2171 行，所有渲染逻辑
- `css/style.css` — 1818 行，所有样式

**演进后（Prototype Mixin 模式）**：
- 主进程：7 个 CommonJS 模块
- 渲染 JS：17 个文件，App 类核心 + 各模块通过原型挂载
- CSS：13 个语义化文件

```javascript
// Prototype Mixin 模式示例
// app.js — App 类核心
class App {
  constructor() {
    this.store = new Store();
    this.currentView = { type: 'all' };
    this.init();
  }
}

// app-sidebar.js — 通过原型扩展
App.prototype.renderSidebar = function() { /* ... */ };

// app-editor.js — 编辑器模块
App.prototype.openNote = function(noteId) { /* ... */ };

// 加载顺序：utils → store → templates → App 类 → Mixin → app-init
```

**为什么选 Prototype Mixin 而非 ES Modules**：不引入构建工具，保持零构建的简洁性。HTML 中按顺序 `<script>` 加载，Electron 环境直接运行。

### 4.5 可复用 Skill

| Skill | 内容 |
| :--- | :--- |
| 技术选型决策矩阵模板 | 维度（适配度/开发效率/生态/性能/可维护/扩展）× 候选方案打分 |
| Electron 安全架构清单 | contextIsolation + nodeIntegration:false + contextBridge + 单实例锁 + 外链拦截 |
| 模块化演进路径 | 单文件 → 函数提取 → Prototype Mixin → ES Modules（按项目规模渐进） |

---

## 第五章 软件开发

> 本章是全文核心，详细还原使用 Claude Code 进行开发的真实过程。

### 5.1 十二阶段开发时间线

```
阶段一   需求分析与产品设计
阶段二   基础框架搭建
阶段三   核心编辑功能（富文本 + Markdown）
阶段四   整理与组织功能（笔记本树 / 标签 / 搜索 / 回收站）
阶段五   效率工具（模板 / 日历 / 历史版本）
阶段六   桌面便签功能
阶段七   数据导出功能（PDF / HTML / MD / TXT / JSON）
阶段八   UI 优化与主题
阶段九   Bug 修复与优化
阶段十   打包与发布
阶段十一 模块化重构
阶段十二 文档与脚本整理
```

这 12 个阶段体现了**渐进式开发**的核心理念：先跑通最小可用版本，再逐步叠加功能，每步都可验证。

### 5.2 基础框架搭建

#### GPU 兼容方案

Electron 启动的第一行有效代码就是处理 Windows GPU 兼容问题：

```javascript
// main/index.js — 修复部分 Windows 环境下 GPU/渲染进程崩溃
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
```

**踩坑背景**：部分 Windows 环境（尤其是虚拟机和老旧 GPU 驱动）下，Chromium 硬件加速会导致白屏或崩溃。Claude Code 在第一次运行就遇到了这个问题，通过搜索 Electron 官方 issues 定位到解决方案。

#### 单实例锁

```javascript
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
```

### 5.3 核心编辑器实现

编辑器是云笔记的核心，Claude Code 实现了两种编辑模式：

**富文本编辑器**：基于 `contentEditable` + `document.execCommand`，实现完整的排版工具栏。

**Markdown 编辑器**：集成三个第三方库的配合工作：
- **marked.js** — Markdown → HTML 解析
- **highlight.js** — 代码块语法高亮
- **KaTeX** — 数学公式渲染

核心集成代码（`renderer/js/app.js`）：

```javascript
setupMarked() {
  marked.setOptions({
    highlight: function (code, lang) {
      if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return code;
    },
    breaks: true, gfm: true
  });

  const renderer = new marked.Renderer();
  // KaTeX 公式渲染注入
  renderer.paragraph = function (opts) {
    let text = typeof opts === 'object' ? opts.text : opts;
    // 块级公式 $$...$$
    text = text.replace(/\$\$(.+?)\$\$/g, (_, expr) => {
      return katex.renderToString(expr, { displayMode: true });
    });
    // 行内公式 $...$
    text = text.replace(/\$(.+?)\$/g, (_, expr) => {
      return katex.renderToString(expr, { displayMode: false });
    });
    return `<p>${text}</p>\n`;
  };
  marked.use({ renderer });
}
```

### 5.4 复杂功能实现

#### 笔记本树递归

笔记本支持多级嵌套（笔记本组 → 笔记本 → 笔记），删除时需递归处理：

```javascript
deleteNotebook(id) {
  if (id === 'nb_default') return;  // 保护默认笔记本
  // 当前笔记本下的笔记转移到默认笔记本
  this.data.notes.forEach(n => {
    if (n.notebookId === id) n.notebookId = 'nb_default';
  });
  // 递归删除所有子笔记本
  const removeChildren = (parentId) => {
    const children = this.data.notebooks.filter(nb => nb.parentId === parentId);
    children.forEach(child => {
      this.data.notes.forEach(n => {
        if (n.notebookId === child.id) n.notebookId = 'nb_default';
      });
      removeChildren(child.id);
    });
    this.data.notebooks = this.data.notebooks.filter(nb => nb.parentId !== parentId);
  };
  removeChildren(id);
  this.data.notebooks = this.data.notebooks.filter(nb => nb.id !== id);
  this.save();
}
```

#### 桌面便签边缘隐藏（纯函数设计）

边缘隐藏功能是便签的亮点交互。Claude Code 将核心逻辑抽取为**纯函数**，既便于理解也便于测试：

```javascript
// 检测窗口是否触碰屏幕边缘（纯函数）
function detectEdge(bounds, workArea, threshold) {
  if (bounds.x <= workArea.x + threshold) return 'left';
  if (bounds.x + bounds.width >= workArea.x + workArea.width - threshold) return 'right';
  if (bounds.y <= workArea.y + threshold) return 'top';
  if (bounds.y + bounds.height >= workArea.y + workArea.height - threshold) return 'bottom';
  return null;
}

// 计算隐藏后的窗口位置（纯函数）
function calcHiddenBounds(bounds, workArea, edge, peek) {
  const target = { ...bounds };
  if (edge === 'left') target.x = workArea.x - bounds.width + peek;
  else if (edge === 'right') target.x = workArea.x + workArea.width - peek;
  else if (edge === 'top') target.y = workArea.y - bounds.height + peek;
  else if (edge === 'bottom') target.y = workArea.y + workArea.height - peek;
  return target;
}
```

**设计亮点**：`detectEdge` 和 `calcHiddenBounds` 都是纯函数——不依赖任何外部状态，输入确定则输出确定。这使得它们可以在 Jest 中直接测试，无需 mock Electron 窗口。

#### PDF 导出

利用 Electron 内置 `printToPDF` 实现零额外依赖的 PDF 导出：

```javascript
ipcMain.handle('export-pdf', async (_event, html, title) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: '导出为 PDF',
    defaultPath: `${title}.pdf`,
    filters: [{ name: 'PDF 文件', extensions: ['pdf'] }]
  });
  if (!filePath) return { success: false };

  // 创建隐藏窗口渲染 HTML
  const pdfWin = new BrowserWindow({ show: false, ... });
  await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  const pdfData = await pdfWin.webContents.printToPDF({
    pageSize: 'A4', printBackground: true,
    margins: { top: 1, bottom: 1, left: 1, right: 1 }
  });
  fs.writeFileSync(filePath, pdfData);
  pdfWin.destroy();
});
```

### 5.5 Bug 修复实战：七个关键踩坑

| 编号 | 问题 | 诊断 | 解决 |
| :--- | :--- | :--- | :--- |
| 1 | Windows GPU 渲染崩溃 | GPU 驱动不兼容 Chromium 硬件加速 | 全局 `disableHardwareAcceleration()` |
| 2 | CDN 资源打包后不可用 | Electron 离线环境无法访问 CDN | 第三方库全部本地化到 `vendor/` |
| 3 | KaTeX 字体显示方块 | 打包后字体路径变化 | 本地化字体文件并修正 `@font-face` 路径 |
| 4 | 无边框窗口 `moved` 事件不触发 | Windows 平台 frameless 窗口限制 | 改用 `move` + 300ms 防抖 |
| 5 | transparent 窗口背景异常 | 部分 GPU 环境不支持透明 | 改用 `backgroundColor` + CSS 实现圆角 |
| 6 | 打包时文件被占用 | Electron 开发进程未完全退出 | 先 kill 进程再打包 |
| 7 | PDF 导出中文字体缺失 | 隐藏窗口无字体声明 | 导出 HTML 中指定中文 font-family fallback |

### 5.6 真实操作过程还原

以下基于项目的 MEMORY.md、workflow-log.md 和实际会话上下文，还原几个典型的开发场景。

#### 场景一：便签拖动边缘隐藏 Bug 修复

**问题描述**：便签窗口拖到屏幕边缘后，有时不触发隐藏，有时拖动过程中就触发了。

**排查过程**：
1. Claude Code 首先检查了事件监听代码，发现使用的是 `moved` 事件
2. 查阅 Electron 文档发现 `moved` 事件在无边框窗口（`frame: false`）上不可靠
3. 尝试改为 `move` 事件——但 `move` 在拖动过程中连续触发，导致拖动中途就检测到边缘

**解决方案**：`move` 事件 + `setTimeout` 防抖（300ms），只在拖动停止后才检测边缘：

```javascript
stickyWindow.on('move', () => {
  if (!stickyWindow || stickyHiddenEdge) return;
  if (edgeCheckTimer) clearTimeout(edgeCheckTimer);
  edgeCheckTimer = setTimeout(() => { checkEdgeHide(); }, 300);
});
```

**Claude Code 的作用**：
- 快速定位到 `moved` vs `move` 事件的平台差异
- 提出防抖方案并计算合理的延迟时间
- 将检测逻辑重构为纯函数（`detectEdge`/`calcHiddenBounds`），提升可测试性

#### 场景二：应用关闭后无法重启

**问题描述**：关闭主窗口后，便签窗口仍在运行；下次点击 exe 无法打开新窗口。

**排查过程**：
1. Claude Code 分析了 `second-instance` 事件处理逻辑
2. 发现问题链：主窗口关闭 → 便签窗口存活 → `window-all-closed` 不触发 → 进程不退出 → 单实例锁阻止新实例
3. 同时发现托盘图标也没有清理

**解决方案**：在主窗口 `closed` 事件中同步销毁便签窗口，在 `before-quit` 中清理托盘：

```javascript
// main/index.js
mainWindow.on('closed', () => {
  const stickyWindow = getStickyWindow();
  if (stickyWindow) { stickyWindow.destroy(); }
});

app.on('before-quit', () => {
  isQuitting = true;
  destroyTray();
});
```

#### 场景三：侧边栏/面板拖拽缩放

**需求**：侧边栏和笔记列表面板支持拖拽右边缘调整宽度。

**Claude Code 的实现**：提取了一个通用的面板缩放方法，复用于两个面板：

```javascript
setupPanelResizer(resizerEl, panelEl, minW, maxW) {
  let dragging = false;
  resizerEl.addEventListener('mousedown', (e) => {
    if (panelEl.classList.contains('collapsed')) return;
    dragging = true;
    resizerEl.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = panelEl.getBoundingClientRect();
    const newWidth = Math.min(maxW, Math.max(minW, e.clientX - rect.left));
    panelEl.style.width = newWidth + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    resizerEl.classList.remove('active');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}
```

侧边栏限制 180-500px，笔记列表面板限制 200-600px。

#### 场景四：售前 PPT 三轮迭代

这是一个展现 Claude Code **跨语言能力**的典型场景：

**第一轮 — 截图脚本 (JavaScript)**：
Claude Code 编写了 `tools/capture_frames.js`，使用 Electron 的 `capturePage` API 对应用进行多帧截图。

**第二轮 — GIF 合成 (Python)**：
Claude Code 切换到 Python，编写 `tools/make_gifs.py`，将截图帧合成为 GIF 动图（便签操作演示 + 主题切换演示）。

**第三轮 — PPT 生成 (Python)**：
Claude Code 继续用 Python 编写 `tools/make_ppt_v3.py`，使用 `python-pptx` 库自动生成售前演示 PPT，将截图和 GIF 嵌入幻灯片。

**跨语言产出**：
```
tools/
├── capture_frames.js     # JavaScript — Electron 截图
├── make_gifs.py          # Python — GIF 合成
├── make_ppt_v3.py        # Python — PPT 生成
├── fix_gif_in_pptx.py    # Python — GIF 嵌入修复
└── screenshots/           # 截图帧和 GIF 动图
    ├── main-light.png
    ├── main-dark.png
    ├── demo_sticky.gif
    └── demo_theme.gif
```

### 5.7 模块化重构过程

模块化重构是阶段十一的核心工作。Claude Code 将庞大的单文件拆分为语义化模块：

**主进程拆分**（`main.js` → `main/` 目录）：

| 模块 | 职责 | 行数 |
| :--- | :--- | :--- |
| `index.js` | GPU 配置 + 组装模块 + 生命周期 | 66 |
| `window-main.js` | 主窗口创建与管理 | — |
| `window-sticky.js` | 便签窗口 + 边缘检测 | 134 |
| `tray.js` | 系统托盘 | — |
| `menu.js` | 应用菜单 | — |
| `ipc.js` | IPC 通信处理 | 67 |
| `app-icon.js` | 图标工具 | — |

**渲染进程 JS 拆分**（`app.js` 2171 行 → 17 个文件）：

加载顺序：基础层（`utils` → `store` → `templates`）→ `App` 类 → Mixin 扩展（`app-*.js`）→ `app-init`

**CSS 拆分**（`style.css` 1818 行 → 13 个文件）：

`variables.css` → `base.css` → `sidebar.css` → `notelist.css` → `calendar.css` → `template.css` → `editor.css` → `modal.css` → `context-menu.css` → `toast.css` → `animations.css` → `responsive.css` → `print.css`

### 5.8 可复用 Skill

| Skill | 内容 |
| :--- | :--- |
| 渐进式开发模板 | MVP → 核心功能 → 完整功能 → 优化打磨 → 打包发布，每步可运行可验证 |
| Electron 踩坑清单 | GPU 禁用 / CDN 本地化 / frameless moved 事件 / transparent 兼容 / 单实例锁 / PDF 中文字体 |
| 纯函数设计模式 | 从有副作用的功能中提取纯计算逻辑（如 detectEdge），提升可测试性 |

---

## 第六章 软件测试

### 6.1 测试架构设计

测试方案选择 **Jest + jsdom** 组合：

```json
// package.json
{
  "devDependencies": {
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0"
  },
  "scripts": {
    "test": "jest --verbose"
  }
}
```

**核心挑战**：云笔记的渲染进程代码是**浏览器全局变量风格**（非 Node.js 模块），直接 `require` 会报错。如何在 Node.js 测试环境中加载这些代码？

### 6.2 浏览器模块测试加载器（vm 沙箱方案）

Claude Code 设计了一个巧妙的测试工具 — `load-browser-module.js`，使用 Node.js `vm` 模块创建沙箱环境：

```javascript
const vm = require('vm');

/**
 * 核心技巧：将顶层 const/let/class 声明转为 var，
 * 使其成为沙箱全局属性，测试代码可通过 ctx.XXX 访问
 */
function hoistDeclarations(code) {
  return code
    .replace(/^const\s/gm, 'var ')
    .replace(/^let\s/gm, 'var ')
    .replace(/^class\s+(\w+)/gm, 'var $1 = class $1');
}

function loadBrowserModule(filePaths, extraGlobals = {}) {
  const sandbox = {
    console, setTimeout, clearTimeout, Date, Math, JSON,
    Object, Array, String, Number, RegExp, Error, Map, Set, Promise,
    document: global.document,
    window: global.window,
    localStorage: global.localStorage,
    ...extraGlobals
  };

  const context = vm.createContext(sandbox);

  const files = Array.isArray(filePaths) ? filePaths : [filePaths];
  for (const fp of files) {
    const code = fs.readFileSync(fp, 'utf-8');
    const hoisted = hoistDeclarations(code);
    vm.runInContext(hoisted, context, { filename: fp });
  }
  return context;
}
```

**`hoistDeclarations` 的精妙之处**：
- `const Store` → `var Store`：`const` 声明有块作用域，在 `vm.runInContext` 中不会挂到沙箱全局对象上；转为 `var` 后就成为沙箱的全局属性
- `class Store` → `var Store = class Store`：同理，使类声明也挂到全局
- 这样测试代码就能通过 `ctx.Store` 访问到渲染进程中定义的类

### 6.3 Store 数据层测试

Store 测试是测试套件的核心部分（`__tests__/renderer/store.test.js`），涵盖 10 个 describe、40+ 个测试用例：

```javascript
// 使用 loadBrowserModule 加载浏览器风格的 Store 类
function createStore() {
  const ctx = loadBrowserModule(
    path.resolve(__dirname, '../../renderer/js/store.js')
  );
  Store = ctx.Store;
  return new Store();
}

beforeEach(() => {
  localStorage.clear();  // 每个测试前清空数据
});
```

**测试覆盖矩阵**：

| describe | 测试内容 | 用例数 |
| :--- | :--- | :--- |
| Store 初始化 | 默认数据、localStorage 加载、损坏 JSON 降级 | 4 |
| 笔记本 CRUD | 创建/更新/删除/递归删除/保护默认笔记本 | 6 |
| 笔记 CRUD | 创建/查询/更新/软删除/永久删除/恢复/清空回收站 | 8 |
| 笔记筛选 | all/starred/recent/todo/trash/notebookId/tag/search | 9 |
| 笔记排序 | updatedAt/title/pinned 置顶 | 3 |
| 版本历史 | 版本创建/空笔记/5 分钟节流/50 版本上限 | 4 |
| 待办检测 | checkbox HTML/Markdown `- [ ]`/`- [x]`/普通内容 | 4 |
| 复制笔记 | 基本复制/不存在返回 null/tags 深拷贝 | 3 |
| 标签统计 | 聚合计数/已删除笔记排除 | 2 |
| 导入导出 | 往返测试/无效 JSON/缺少字段 | 3 |

**关键测试示例 — tags 深拷贝验证**（Issue #3 修复）：

```javascript
test('tags 深拷贝，修改副本不影响原始', () => {
  const store = createStore();
  const orig = store.addNote({ title: '原始', tags: ['a', 'b'] });
  const copy = store.duplicateNote(orig.id);
  copy.tags.push('c');
  // 修复后：副本 tags 是独立数组
  expect(store.getNote(orig.id).tags).toEqual(['a', 'b']);
  expect(copy.tags).toEqual(['a', 'b', 'c']);
});
```

### 6.4 主进程测试（Mock Electron）

主进程测试的核心挑战是 mock Electron 模块：

```javascript
// __tests__/main/window-sticky.test.js
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    getBounds: () => mockBounds,
    setBounds: mockSetBounds,
    show: mockShow,
    focus: mockFocus,
    setAlwaysOnTop: mockSetAlwaysOnTop,
    loadFile: mockLoadFile,
    on: mockOn,
    webContents: { send: mockWebContentsSend }
  })),
  screen: {
    getPrimaryDisplay: () => ({
      workAreaSize: { width: 1920, height: 1040 },
      workArea: { x: 0, y: 0, width: 1920, height: 1040 }
    })
  }
}));
```

**边缘检测纯函数测试**（无需 mock 窗口）：

```javascript
describe('detectEdge（纯函数）', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 1040 };
  const threshold = 40;

  test('左边缘检测', () => {
    expect(detectEdge({ x: 30, y: 300, width: 320, height: 460 },
                       workArea, threshold)).toBe('left');
  });

  test('不在边缘返回 null', () => {
    expect(detectEdge({ x: 500, y: 300, width: 320, height: 460 },
                       workArea, threshold)).toBeNull();
  });

  test('恰好在阈值边界', () => {
    expect(detectEdge({ x: 40, ... }, workArea, threshold)).toBe('left');
    expect(detectEdge({ x: 41, ... }, workArea, threshold)).not.toBe('left');
  });
});
```

### 6.5 可复用 Skill

| Skill | 内容 |
| :--- | :--- |
| 浏览器模块测试加载器 | `vm.createContext` + `hoistDeclarations`（const→var, class→var 赋值），解决非 Node 模块的测试加载问题 |
| Electron Mock 模板 | `jest.mock('electron', () => ({...}))` 完整 mock 结构，覆盖 BrowserWindow/screen/ipcMain |
| 纯函数优先策略 | 从有副作用的模块中提取纯函数（如 `detectEdge`），降低测试复杂度 |

---

## 第七章 打包与发布

### 7.1 electron-builder NSIS 配置

打包使用 electron-builder，生成 NSIS 安装包（exe）：

```json
{
  "build": {
    "appId": "com.cloudnotes.app",
    "productName": "云笔记",
    "files": [
      "main/**/*", "preload/**/*", "renderer/**/*",
      "sticky/**/*", "vendor/**/*", "assets/**/*"
    ],
    "win": {
      "target": [{ "target": "nsis", "arch": ["x64"] }]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "云笔记",
      "installerLanguages": ["zh_CN"],
      "language": "2052"
    }
  }
}
```

**关键配置说明**：
- `oneClick: false` — 非一键安装，用户可选安装目录
- `language: "2052"` — Windows 简体中文语言代码
- `files` 数组 — 必须显式列出所有需要打包的目录，遗漏会导致资源加载失败

### 7.2 踩坑记录

**进程占用**：`npm run build` 失败，提示文件被占用。原因是 Electron 开发进程未完全退出。解决方案：打包前先 kill 掉所有 Electron 进程。

**包体积**：NSIS 安装包约 90MB，解压后约 270MB。这是 Electron 应用的固有特征（包含完整的 Chromium + Node.js 运行时），不是应用代码本身的问题。

### 7.3 构建命令

```bash
# NSIS 安装包
npm run build

# 便携版
npm run build:portable
```

产出位于 `dist/` 目录。

---

## 第八章 经验总结与可复用 Skill 清单

### 8.1 复盘：五个做得好

| 序号 | 做得好 | 说明 |
| :--- | :--- | :--- |
| 1 | 渐进式开发 | 每步可验证，12 个阶段有条不紊 |
| 2 | 技术选型克制 | 不用框架、不用构建工具，保持项目简洁 |
| 3 | 本地化策略 | 第三方库全部本地化，杜绝网络依赖 |
| 4 | 安全架构先行 | 第一天就采用 contextIsolation 安全模式 |
| 5 | PRD 驱动开发 | 先写需求文档再动手，功能有据可循 |

### 8.2 复盘：五个可改进

| 序号 | 可改进 | 改进方案 |
| :--- | :--- | :--- |
| 1 | localStorage 容量限制 | 立项时就规划 IndexedDB 迁移路径 |
| 2 | 图片 base64 嵌入不可持续 | 设计阶段就规划文件系统存储 |
| 3 | 自动化测试引入偏晚 | 数据层代码完成后立即写测试 |
| 4 | 代码模块化偏晚 | > 500 行时就开始拆分 |
| 5 | CSS 模块化偏晚 | 一开始就采用多文件结构 |

### 8.3 七个关键踩坑

| 编号 | 坑点 | 根因 | 解决方案 |
| :--- | :--- | :--- | :--- |
| 1 | Windows GPU 崩溃 | GPU 驱动不兼容 | 全局禁用硬件加速 |
| 2 | CDN 资源打包后不可用 | Electron 离线运行 | 第三方库本地化 |
| 3 | KaTeX 字体缺失 | 打包后路径变化 | 本地化字体 + 修正路径 |
| 4 | frameless 窗口 moved 不触发 | Windows 平台限制 | move + 防抖 |
| 5 | transparent 窗口渲染异常 | 部分 GPU 不支持 | 改用 backgroundColor |
| 6 | 打包时文件被占用 | Electron 进程未退出 | 先 kill 再打包 |
| 7 | PDF 中文字体缺失 | 隐藏窗口无字体声明 | 指定中文字体 fallback |

### 8.4 Claude Code 使用经验汇总

| 环节 | Agent 角色 | Prompt 模式 | 可复用 Skill |
| :--- | :--- | :--- | :--- |
| 需求管理 | 产品经理 | "你是资深 PM，做竞品调研/写 PRD/划分优先级" | PRD 模板、竞品对比矩阵 |
| UED 设计 | 设计师 | "生成交互式 HTML 设计规范，包含 Design Token" | CSS 变量命名规范、主题切换模式 |
| 架构设计 | 架构师 | "对比方案 A/B/C，输出决策矩阵" | 技术选型矩阵模板、安全架构清单 |
| 软件开发 | 全栈工程师 | 分阶段推进 + MEMORY.md 跨会话 | 渐进式开发模板、Electron 踩坑清单 |
| 软件测试 | 测试工程师 | "为 Store 类设计测试用例，覆盖边界场景" | vm 沙箱加载器、Electron Mock 模板 |
| 打包发布 | DevOps | "配置 electron-builder NSIS 打包" | NSIS 中文配置模板 |

### 8.5 Agent Team 协作模式总结

```
          ┌─────────────────────────────┐
          │         用 户（1人）          │
          │  提出需求 / 审核 / 验收       │
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │       Claude Code            │
          │   ┌─────────────────────┐   │
          │   │  MEMORY.md 跨会话   │   │
          │   │  持续积累项目上下文  │   │
          │   └─────────────────────┘   │
          │                              │
          │   按阶段自动切换角色：        │
          │   产品经理 → 设计师 →        │
          │   架构师 → 工程师 →          │
          │   测试工程师 → DevOps        │
          └─────────────────────────────┘
```

**关键协作原则**：
1. **分阶段推进**：每次会话聚焦一个明确目标
2. **MEMORY.md 是桥梁**：跨会话的上下文连续性
3. **人审核 + AI 执行**：人负责决策和验收，AI 负责生产
4. **渐进式交付**：每步产出可运行、可验证的成果

### 8.6 可复用产出物清单

| 产出物 | 文件 | 用途 |
| :--- | :--- | :--- |
| 产品开发规范 | `docs/development-standard.md` | 从立项到复盘的全流程规范模板 |
| PRD 模板 | `docs/development-standard.md` § 1.2 | 标准化 PRD 文档结构 |
| 技术选型矩阵 | `docs/development-standard.md` § 2.2 | 候选方案对比评估模板 |
| 开发工作流日志 | `docs/workflow-log.md` | 12 阶段开发记录模板 |
| CSS Design Token | `renderer/css/variables.css` | 89 行变量定义参考 |
| 浏览器模块测试加载器 | `__tests__/helpers/load-browser-module.js` | vm 沙箱 + hoistDeclarations 方案 |
| Electron Mock 模板 | `__tests__/main/window-sticky.test.js` | Jest mock Electron 完整结构 |
| Electron 踩坑清单 | `docs/workflow-log.md` 经验总结 | 7 个踩坑 + 解决方案 |
| NSIS 打包配置 | `package.json` build 节点 | 中文语言包 + 安装选项配置 |

---

## 附录：项目文件结构全览

```
cloud-notes/
├── main/                          # Electron 主进程（7 个模块）
│   ├── index.js                   # 主入口（组装 + 生命周期）
│   ├── window-main.js             # 主窗口管理
│   ├── window-sticky.js           # 便签窗口 + 边缘隐藏
│   ├── tray.js                    # 系统托盘
│   ├── menu.js                    # 应用菜单
│   ├── ipc.js                     # IPC 通信处理
│   └── app-icon.js                # 图标工具
├── preload/                       # 预加载脚本
│   ├── preload.js
│   └── preload-sticky.js
├── renderer/                      # 主窗口渲染进程
│   ├── index.html
│   ├── js/                        # 17 个 JS 模块
│   │   ├── store.js               # 数据持久化层
│   │   ├── templates.js           # 内置模板
│   │   ├── utils.js               # 工具函数
│   │   ├── app.js                 # App 类核心
│   │   ├── app-theme.js           # 主题管理
│   │   ├── app-events.js          # 事件绑定
│   │   ├── app-sidebar.js         # 侧边栏渲染
│   │   ├── app-notelist.js        # 笔记列表
│   │   ├── app-editor.js          # 编辑器核心
│   │   ├── app-toolbar.js         # 工具栏命令
│   │   ├── app-note-ops.js        # 笔记操作
│   │   ├── app-notebook.js        # 笔记本管理
│   │   ├── app-history.js         # 历史版本
│   │   ├── app-export.js          # 导出功能
│   │   ├── app-calendar.js        # 日历视图
│   │   ├── app-templates.js       # 模板库视图
│   │   ├── app-toast.js           # Toast 通知
│   │   └── app-init.js            # 全局初始化入口
│   └── css/                       # 13 个 CSS 模块
│       ├── variables.css           # CSS 变量与主题
│       ├── base.css ~ print.css    # 各组件样式
├── sticky/                        # 桌面便签（独立模块）
│   ├── sticky.html
│   ├── js/sticky.js
│   └── css/sticky.css
├── vendor/                        # 第三方库（本地化）
│   ├── marked.min.js / highlight.min.js / katex.min.js
│   └── fonts/                     # KaTeX 字体
├── __tests__/                     # 测试代码
│   ├── renderer/store.test.js     # Store 数据层测试
│   ├── main/window-sticky.test.js # 便签窗口测试
│   └── helpers/load-browser-module.js  # vm 沙箱加载器
├── assets/icon.svg                # 应用图标
├── docs/                          # 项目文档
│   ├── note-prd.md                # PRD v2.0
│   ├── development-plan.md        # 开发计划书
│   ├── development-standard.md    # 开发规范模板
│   ├── workflow-log.md            # 12 阶段工作流日志
│   └── ued-design-spec.html       # UED 设计规范
├── tools/                         # 工具脚本
│   ├── capture_frames.js          # 截图脚本 (JS)
│   ├── make_gifs.py               # GIF 合成 (Python)
│   ├── make_ppt_v3.py             # PPT 生成 (Python)
│   └── screenshots/               # 截图和 GIF
└── package.json                   # 项目配置 & 打包配置
```

---

> 本文档完整记录了使用 Claude Code 从零到一开发"云笔记"桌面产品的全过程。
> 每个章节都包含了 **Claude Code 做了什么**、**实际效果**和**可复用 Skill**，
> 希望这些实践经验能为更多团队和个人提供参考。
