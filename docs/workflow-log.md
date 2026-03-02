# 云笔记开发工作流记录

> 本文档按时间线记录云笔记产品从零到一的实际开发过程，包含每个阶段的工作内容、遇到的问题、解决方案和关键决策，用于项目追溯和经验沉淀。
>
> 开发周期：2026年3月
> 开发模式：AI 辅助的单人全栈开发

---

## 阶段总览

```
需求分析 → 基础框架搭建 → 核心编辑功能 → 整理组织功能 → 效率工具
    → 桌面便签 → 数据导出 → UI 优化与主题 → Bug 修复 → 打包发布 → 模块化重构
    → 文档与脚本整理
```

---

## 阶段一：需求分析与产品设计

### 工作内容

- 确定产品定位：面向日常办公的智能笔记助手
- 进行竞品调研：有道云笔记、印象笔记、Typora、Notion
- 编写产品需求文档（PRD v1.0），梳理完整功能清单
- 划分功能优先级，确定 v1.0 实现范围

### 关键决策

**决策 1：产品范围界定**

- 初始 PRD 包含了理想化的全功能集（云同步、AI、OCR、协作等）
- 经过评估，v1.0 聚焦本地单机场景，砍掉所有需要后端的功能
- 原则：**先做减法，做好核心体验，再迭代扩展**

**决策 2：数据存储方案**

- 可选方案：localStorage / IndexedDB / SQLite / 文件系统
- 选择 localStorage：零配置、API 简单、适合原型验证
- 已知风险：5-10MB 容量限制，v2.0 需迁移

### 产出物

- `note-prd.md` — 产品需求文档 v1.0

---

## 阶段二：基础框架搭建

### 工作内容

- 初始化 Electron 工程，配置 `package.json`
- 搭建主进程 `main.js`：窗口创建、安全配置、生命周期管理
- 实现预加载脚本 `preload.js`：安全 IPC 桥接
- 搭建主窗口三栏布局：侧边栏 → 笔记列表 → 编辑区
- 实现数据层 `Store` 类：localStorage CRUD 封装

### 关键决策

**决策 3：为什么选择 Electron？**

| 方案 | 优势 | 劣势 | 结论 |
| :--- | :--- | :--- | :--- |
| Electron | Web 技术栈、生态成熟、跨平台 | 包体积大（~270MB） | **选用** |
| Tauri | 包体积小（~10MB）、性能好 | Rust 学习曲线、生态相对年轻 | 备选 |
| WPF/WinForms | 原生 Windows 体验 | 仅限 Windows、C# 技术栈 | 不选 |
| PWA | 零安装、跨平台 | 无法访问系统 API（托盘/文件等） | 不选 |

最终选择 Electron 的核心原因：**Web 技术栈降低开发成本，单人即可完成全栈开发**。

**决策 4：为什么不用前端框架？**

| 方案 | 考虑 |
| :--- | :--- |
| React/Vue | 引入构建工具链（Webpack/Vite），增加项目复杂度 |
| 原生 JS | 项目规模可控（~2100 行主逻辑），原生 JS 完全胜任 |

选择原生 JS 的原因：
- 无需构建步骤，源码即运行代码
- 对 DOM 操作有完全控制，便于实现编辑器等复杂交互
- 减少依赖，降低维护成本

### 遇到的问题

**问题 1：GPU 渲染崩溃**

- 现象：部分 Windows 环境下应用启动白屏或崩溃
- 原因：GPU 驱动不兼容 Chromium 硬件加速
- 解决：在 `main.js` 中全局禁用硬件加速

```javascript
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
```

**问题 2：多实例冲突**

- 现象：用户双击 exe 可打开多个窗口实例
- 解决：使用 `app.requestSingleInstanceLock()` 实现单实例锁

### 产出物

- `main.js` — 主进程框架
- `preload.js` — 预加载脚本
- `index.html` — 主窗口页面
- `js/app.js` — Store 数据层
- `css/style.css` — 基础样式

---

## 阶段三：核心编辑功能

### 工作内容

- 实现富文本编辑器：基于 `contentEditable` + `document.execCommand`
  - 完整排版工具栏：加粗、斜体、下划线、删除线、高亮
  - 段落样式：H1-H6 标题、引用块、有序/无序列表
  - 特殊元素：链接、图片（URL + 本地 base64）、表格、代码块
  - 任务列表：可勾选待办事项
  - 公式支持：集成 KaTeX
- 实现 Markdown 编辑器：
  - 集成 marked.js 解析渲染
  - 集成 highlight.js 代码高亮
  - 双栏预览模式：左编辑右预览
  - Markdown 工具栏：快捷插入语法

### 关键决策

**决策 5：第三方库 CDN → 本地化**

- 初始方案：通过 CDN 加载 marked.js、highlight.js、KaTeX
- 问题：Electron 打包后无法访问 CDN（离线环境）
- 最终方案：下载所有库文件到 `vendor/` 目录本地化引用

```
vendor/
├── marked.min.js
├── highlight.min.js
├── katex.min.js
├── katex.min.css
├── github.min.css        # highlight.js 亮色主题
├── github-dark.min.css   # highlight.js 暗色主题
└── fonts/                # KaTeX 字体（15 个 woff2）
```

**经验**：桌面应用的所有资源都应本地化，不能依赖外部网络。

### 遇到的问题

**问题 3：KaTeX 字体加载失败**

- 现象：公式渲染时字体缺失，显示为方块
- 原因：KaTeX CSS 中的字体路径在打包后不正确
- 解决：将 KaTeX 字体文件放在 `vendor/fonts/` 下，调整 CSS 中的 `@font-face` 路径

**问题 4：图片插入的 base64 膨胀**

- 现象：插入本地图片后笔记体积急剧增大
- 原因：通过 `FileReader.readAsDataURL()` 将图片转为 base64 嵌入 HTML
- 临时方案：维持现有实现，在 v2.0 改为文件系统存储 + 引用路径
- 已知风险：大量图片会快速耗尽 localStorage 容量

### 产出物

- 完整的富文本编辑器
- 完整的 Markdown 编辑器
- 编辑器模式切换功能

---

## 阶段四：整理与组织功能

### 工作内容

- 实现笔记本树形管理：多级嵌套（笔记本组→笔记本→笔记）
- 实现标签系统：多标签添加、标签云展示、按标签筛选
- 实现全文搜索：标题 + 正文 + 标签关键词匹配
- 实现排序功能：按更新时间、创建时间、标题排序
- 实现视图切换：列表视图 / 网格卡片视图
- 实现分类快捷入口：全部、收藏、最近、待办、回收站
- 实现笔记操作：置顶、收藏、移动、复制、右键菜单
- 实现回收站：软删除、恢复、清空

### 关键决策

**决策 6：侧边栏导航结构**

最终采用 "导航功能区 + 笔记本树 + 标签云" 的三段式侧边栏：

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

### 遇到的问题

**问题 5：搜索性能**

- 现象：笔记数量较多时，实时搜索出现输入卡顿
- 原因：每次按键都遍历所有笔记的全部文本内容
- 解决：笔记保存时提取 `plainText`（纯文本）字段，搜索时只匹配纯文本而非富文本 HTML

**问题 6：笔记本删除的级联处理**

- 问题：删除笔记本时，子笔记本和笔记如何处理？
- 方案：递归删除所有子笔记本，将所有相关笔记移至默认笔记本（而非直接删除）

### 产出物

- 完整的笔记本管理功能
- 标签系统
- 搜索与排序
- 回收站

---

## 阶段五：效率工具

### 工作内容

- 实现模板库：9 种内置模板
  - 会议纪要、周报、读书笔记、OKR 规划、项目计划、日记、旅行清单、Markdown 笔记、知识卡片
  - 卡片式展示，一键创建笔记
- 实现日历视图：
  - 按月展示日历
  - 标记有笔记的日期
  - 点击日期查看当日笔记
- 实现历史版本：
  - 内容变更间隔 > 5 分钟自动保存版本
  - 每篇笔记最多 50 个版本
  - 版本浏览和一键恢复

### 关键决策

**决策 7：版本保存策略**

- 不能每次输入都保存版本（性能消耗大、存储膨胀）
- 不能只在手动保存时保存版本（用户可能忘记保存）
- 最终方案：**时间间隔策略** — 内容变更且距上次版本 > 5 分钟时自动保存
- 版本上限 50 个，超出后淘汰最旧版本

### 产出物

- 模板库功能
- 日历视图
- 历史版本管理

---

## 阶段六：桌面便签功能

### 工作内容

- 创建独立便签窗口 `sticky.html`
- 实现 Todo 增删改查：输入框添加、勾选完成、双击编辑、删除
- 实现优先级标记：`!!` 高优先级（红色）、`!` 中优先级（橙色）、默认低优先级
- 实现筛选切换：全部 / 待办 / 已完成
- 实现 6 种主题色切换：浅黄、蓝、绿、粉、紫、暗色
- 实现窗口置顶（图钉按钮）
- 实现最小化按钮
- 实现边缘隐藏：拖动到屏幕左/右/上边缘自动隐藏，露出 6px 窄条，点击恢复
- 数据持久化：localStorage 独立存储

### 关键决策

**决策 8：便签窗口架构**

- 便签使用独立 `BrowserWindow`，与主窗口完全隔离
- 独立预加载脚本 `preload-sticky.js`，只暴露便签所需的 IPC 接口
- 独立样式 `css/sticky.css`，不与主应用样式耦合
- 独立逻辑 `js/sticky.js`，不与主应用逻辑耦合

**决策 9：边缘隐藏的实现方案**

- 检测方式：监听 `move` 事件 + 300ms 防抖（`moved` 事件在无边框窗口上不可靠）
- 隐藏阈值：距屏幕边缘 40px 以内触发
- 隐藏状态：窗口移出屏幕，仅保留 6px 露出
- 恢复方式：点击露出区域，通过 IPC 通知主进程恢复原始位置

### 遇到的问题

**问题 7：无边框窗口的 `moved` 事件不可靠**

- 现象：Windows 上 frameless window 的 `moved` 事件不稳定触发
- 解决：改用 `move` 事件 + `setTimeout` 防抖，拖动停止 300ms 后检测边缘

```javascript
stickyWindow.on('move', () => {
  if (edgeCheckTimer) clearTimeout(edgeCheckTimer);
  edgeCheckTimer = setTimeout(() => { checkEdgeHide(); }, 300);
});
```

**问题 8：透明窗口在部分环境下的渲染问题**

- 现象：`transparent: true` 在部分 Windows 环境下背景显示异常
- 解决：改用 `transparent: false` + `backgroundColor: '#fffde7'`，用 CSS 实现圆角等视觉效果

### 产出物

- `sticky.html` — 便签页面
- `js/sticky.js` — 便签逻辑
- `css/sticky.css` — 便签样式
- `preload-sticky.js` — 便签预加载脚本

---

## 阶段七：数据导出功能

### 工作内容

- 实现 PDF 导出：利用 Electron `printToPDF` API
- 实现 HTML 导出：生成完整 HTML 文件（内嵌样式）
- 实现 Markdown 导出：富文本转 MD / MD 直接导出源码
- 实现纯文本导出：去除所有格式标记
- 实现 JSON 导出：单篇笔记完整数据导出
- 实现全量备份：所有笔记本、笔记、设置导出为 JSON
- 实现数据导入：JSON 备份文件恢复

### 关键决策

**决策 10：PDF 导出的技术方案**

- 方案 A：使用 `window.print()` — 无法自定义样式和文件名
- 方案 B：使用第三方库（jsPDF / Puppeteer） — 增加依赖和包体积
- **方案 C（选用）**：Electron 内置 `printToPDF` — 零额外依赖，渲染质量好

实现方式：创建隐藏 BrowserWindow 加载 HTML → 调用 `webContents.printToPDF` → 保存文件

```javascript
ipcMain.handle('export-pdf', async (_event, html, title) => {
  const pdfWin = new BrowserWindow({ show: false, ... });
  await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  const pdfData = await pdfWin.webContents.printToPDF({ pageSize: 'A4' });
  fs.writeFileSync(filePath, pdfData);
  pdfWin.destroy();
});
```

### 遇到的问题

**问题 9：PDF 中文字体缺失**

- 现象：导出 PDF 中部分中文字符显示为方块
- 原因：隐藏窗口加载的 HTML 没有指定中文字体
- 解决：在导出 HTML 中显式指定中文 font-family fallback 链

### 产出物

- 5 种格式导出功能
- 全量数据备份/恢复功能

---

## 阶段八：UI 优化与主题

### 工作内容

- 实现亮色/暗色主题切换：CSS 自定义属性（CSS Variables）
- 面板拖拽缩放：侧边栏（180-500px）和笔记列表面板（200-600px）拖拽调整宽度
- 侧边栏折叠/展开
- 右键菜单美化
- Toast 提示系统
- 全屏模式
- 缩放控制（Ctrl+=/Ctrl+-）

### 关键决策

**决策 11：主题实现方案**

采用 CSS 自定义属性（CSS Custom Properties）：

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1e1e1e;
  --text-primary: #e0e0e0;
  /* ... */
}
```

优势：
- 主题切换只需修改 `data-theme` 属性，无需加载额外 CSS
- 所有组件统一引用 CSS 变量，维护方便
- 性能好，浏览器原生支持

### 产出物

- 完整的亮色/暗色主题
- 面板拖拽缩放
- UI 交互优化

---

## 阶段九：Bug 修复与优化

### 主要修复的问题

| 问题 | 修复方案 |
| :--- | :--- |
| 编辑器内容丢失 | 增加自动保存机制，输入变化后自动持久化 |
| 主窗口关闭后便签窗口残留 | 主窗口 `closed` 事件中同步销毁便签窗口 |
| 应用退出后托盘图标残留 | `before-quit` 事件中手动销毁托盘 |
| 便签窗口拖动闪烁 | 调整 `move` 事件防抖策略 |
| 暗色主题下部分 UI 元素颜色异常 | 补全所有 CSS 变量的 dark 主题值 |
| 笔记列表在特定排序下显示异常 | 修复排序比较函数中的空值处理 |

### 性能优化

| 优化项 | 方案 |
| :--- | :--- |
| 初始加载速度 | `show: false` + `ready-to-show` 事件，消除白屏 |
| 编辑器输入性能 | 防抖保存，避免每次按键都写 localStorage |
| 笔记列表渲染 | 只渲染可见笔记，减少 DOM 节点 |

---

## 阶段十：打包与发布

### 工作内容

- 配置 electron-builder：NSIS 安装包
- 配置安装选项：允许自定义安装目录、桌面快捷方式、开始菜单
- 中文语言包支持
- 构建 NSIS 安装包（exe）
- 构建便携版（portable）

### 关键配置

```json
{
  "build": {
    "appId": "com.cloudnotes.app",
    "productName": "云笔记",
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

### 遇到的问题

**问题 10：打包时进程占用**

- 现象：`npm run build` 失败，提示文件被占用
- 原因：之前运行的 Electron 开发进程未完全退出
- 解决：打包前先 kill 掉所有 Electron 进程

**问题 11：打包产出体积大**

- 现象：NSIS 安装包约 90MB，解压后约 270MB
- 原因：Electron 运行时（Chromium + Node.js）占据绝大部分体积
- 接受现状：这是 Electron 应用的固有特征，后续可考虑增量更新

### 产出物

- `dist/` 目录下的 NSIS 安装包
- 便携版 exe

---

## PRD 更新

在全部开发完成后，回顾 v1.0 实际实现情况，将 PRD 从 v1.0 更新为 v2.0：

- 标注所有功能的实现状态（✅ 已实现 / 规划中）
- 补充技术架构章节（文件结构、数据模型、IPC 通信接口）
- 重新梳理未实现功能的优先级（P1/P2/P3）
- 记录已知问题与优化方向

### 产出物

- `note-prd.md` v2.0

---

## 阶段十一：模块化重构

### 工作内容

项目代码从集中式大文件拆分为模块化结构，提升可维护性和可读性。

**主进程拆分（main.js → main/）**
- `main/index.js` — GPU 配置 + 组装模块 + 生命周期
- `main/window-main.js` — 主窗口管理
- `main/window-sticky.js` — 便签窗口 + 边缘隐藏
- `main/tray.js` — 系统托盘
- `main/menu.js` — 应用菜单
- `main/ipc.js` — IPC 通信处理
- `main/app-icon.js` — 图标工具

**CSS 拆分（css/style.css → renderer/css/）**
- 1818 行的单文件拆分为 13 个语义化 CSS 文件
- variables.css、base.css、sidebar.css、notelist.css、calendar.css、template.css、editor.css、modal.css、context-menu.css、toast.css、animations.css、responsive.css、print.css

**渲染进程 JS 拆分（js/app.js → renderer/js/）**
- 2171 行的单文件拆分为 17 个文件
- 采用 Prototype Mixin 模式：App 类核心 + 各模块通过原型挂载方法
- 加载顺序：基础层（utils → store → templates） → App 类 → Mixin 扩展 → 初始化

**便签模块独立（sticky/）**
- sticky.html、js/sticky.js、css/sticky.css 移入 sticky/ 目录

**预加载脚本移动（preload/）**
- preload.js、preload-sticky.js 移入 preload/ 目录

### 关键决策

| 决策 | 选择 | 原因 |
| :--- | :--- | :--- |
| JS 模块化方式 | Prototype Mixin | 不引入构建工具，保持零构建简洁性 |
| CSS 模块化方式 | 多 link 标签 | HTML 直接引用，无需预处理器 |
| 主进程模块化 | Node.js require | Electron 主进程原生支持 CommonJS |

### 产出物

- 模块化后的完整项目文件结构（7 个主进程模块、17 个渲染进程 JS 模块、13 个 CSS 模块）
- 更新后的 package.json 打包配置
- 更新后的项目文档

---

## 阶段十二：文档与脚本整理

### 工作内容

模块化重构完成后，根目录仍散落着工具脚本（截图/GIF/PPT 生成）、产品文档和演示文件。将它们归类到合适目录，使项目结构更清晰。

- 创建 `tools/` 目录，移入 4 个工具脚本和 `screenshots/` 目录
- 将 `note-prd.md` 和 `云笔记产品介绍.pptx` 移入 `docs/`
- 修复脚本中因路径变化而失效的引用（共 6 处）
- 更新 `development-standard.md` 和 `note-prd.md` 中的文件结构描述
- 更新 `.gitignore` 添加 `tools/_pptx_temp/` 条目

### 文件移动清单

| 原路径 | 新路径 |
| :--- | :--- |
| `note-prd.md` | `docs/note-prd.md` |
| `云笔记产品介绍.pptx` | `docs/云笔记产品介绍.pptx` |
| `capture_frames.js` | `tools/capture_frames.js` |
| `make_gifs.py` | `tools/make_gifs.py` |
| `make_ppt_v3.py` | `tools/make_ppt_v3.py` |
| `fix_gif_in_pptx.py` | `tools/fix_gif_in_pptx.py` |
| `screenshots/` | `tools/screenshots/` |

### 产出物

- 整洁的根目录（仅剩 package.json、package-lock.json、.gitignore）
- `tools/` 工具脚本目录
- 更新后的文档和路径引用

---

## 经验总结

### 做得好的

1. **渐进式开发**：先跑通最小可用版本，再逐步叠加功能，每步都可验证
2. **技术选型克制**：不用框架、不用构建工具，保持项目简洁可控
3. **本地化策略**：第三方库全部本地化，避免网络依赖
4. **安全架构**：从一开始就采用 `contextIsolation` + `preload` 的安全模式
5. **PRD 驱动**：先写需求文档再开发，确保功能有据可循

### 可以改进的

1. **数据层选型**：localStorage 容量限制是硬伤，应更早考虑 IndexedDB
2. **图片存储**：base64 嵌入方案不可持续，应从设计阶段就规划文件系统存储
3. **测试覆盖**：缺少自动化测试，功能回归依赖手动验证
4. **代码模块化**：`app.js` 单文件 2100 行，应更早拆分模块
5. **CSS 规范**：`style.css` 1800 行无模块化方案，后期维护成本高

### 关键踩坑记录

| 编号 | 坑点 | 根因 | 解决方案 |
| :--- | :--- | :--- | :--- |
| 1 | Windows GPU 崩溃 | GPU 驱动不兼容 | 全局禁用硬件加速 |
| 2 | CDN 资源打包后不可用 | Electron 离线运行 | 第三方库本地化 |
| 3 | KaTeX 字体缺失 | 打包后路径变化 | 本地化字体文件并修正路径 |
| 4 | 无边框窗口 moved 事件不触发 | Windows 平台限制 | 改用 move + 防抖 |
| 5 | transparent 窗口渲染异常 | 部分 GPU 环境不支持 | 改用 backgroundColor |
| 6 | 打包时文件被占用 | Electron 进程未退出 | 先 kill 进程再打包 |
| 7 | PDF 中文字体缺失 | 隐藏窗口无字体声明 | 导出 HTML 中指定中文字体 |
