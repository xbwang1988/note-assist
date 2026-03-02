/**
 * 云笔记 - 内置模板
 */
const TEMPLATES = [
  {
    name: '会议纪要',
    icon: '&#128172;',
    desc: '标准会议记录模板，包含议题、参与人、决议等',
    type: 'richtext',
    content: `<h2>会议纪要</h2>
<p><strong>会议主题：</strong></p>
<p><strong>会议时间：</strong>${new Date().toLocaleDateString('zh-CN')}</p>
<p><strong>参会人员：</strong></p>
<p><strong>会议地点：</strong></p>
<hr>
<h3>一、会议议题</h3>
<ol><li>议题一</li><li>议题二</li><li>议题三</li></ol>
<h3>二、讨论内容</h3>
<p></p>
<h3>三、决议事项</h3>
<div class="todo-item"><input type="checkbox"><span class="todo-text">待办事项 1</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">待办事项 2</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">待办事项 3</span></div>
<h3>四、下次会议安排</h3>
<p></p>`
  },
  {
    name: '周报模板',
    icon: '&#128202;',
    desc: '每周工作总结与计划模板',
    type: 'richtext',
    content: `<h2>周报 - ${new Date().toLocaleDateString('zh-CN')}</h2>
<h3>一、本周工作总结</h3>
<ol><li><strong>项目/任务名称：</strong>完成情况描述</li><li><strong>项目/任务名称：</strong>完成情况描述</li></ol>
<h3>二、关键成果</h3>
<ul><li>成果 1</li><li>成果 2</li></ul>
<h3>三、遇到的问题</h3>
<ul><li>问题描述及解决方案</li></ul>
<h3>四、下周工作计划</h3>
<div class="todo-item"><input type="checkbox"><span class="todo-text">计划事项 1</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">计划事项 2</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">计划事项 3</span></div>
<h3>五、需要的支持</h3>
<p></p>`
  },
  {
    name: '读书笔记',
    icon: '&#128214;',
    desc: '读书心得、摘录与思考模板',
    type: 'richtext',
    content: `<h2>读书笔记</h2>
<p><strong>书名：</strong></p>
<p><strong>作者：</strong></p>
<p><strong>阅读日期：</strong>${new Date().toLocaleDateString('zh-CN')}</p>
<p><strong>评分：</strong>⭐⭐⭐⭐⭐</p>
<hr>
<h3>核心观点</h3>
<p></p>
<h3>精彩摘录</h3>
<blockquote>摘录内容...</blockquote>
<h3>个人感悟</h3>
<p></p>
<h3>行动计划</h3>
<div class="todo-item"><input type="checkbox"><span class="todo-text">实践要点 1</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">实践要点 2</span></div>`
  },
  {
    name: 'OKR 规划',
    icon: '&#127919;',
    desc: '目标与关键成果规划模板',
    type: 'richtext',
    content: `<h2>OKR 规划</h2>
<p><strong>周期：</strong>${new Date().getFullYear()} Q${Math.ceil((new Date().getMonth() + 1) / 3)}</p>
<hr>
<h3>目标 1（Objective）</h3>
<p><em>目标描述...</em></p>
<ul>
<li><strong>KR 1：</strong>关键成果描述<br><small>进度：0%</small></li>
<li><strong>KR 2：</strong>关键成果描述<br><small>进度：0%</small></li>
<li><strong>KR 3：</strong>关键成果描述<br><small>进度：0%</small></li>
</ul>
<h3>目标 2（Objective）</h3>
<p><em>目标描述...</em></p>
<ul>
<li><strong>KR 1：</strong>关键成果描述<br><small>进度：0%</small></li>
<li><strong>KR 2：</strong>关键成果描述<br><small>进度：0%</small></li>
</ul>`
  },
  {
    name: '项目计划',
    icon: '&#128640;',
    desc: '项目启动与任务分解模板',
    type: 'richtext',
    content: `<h2>项目计划</h2>
<p><strong>项目名称：</strong></p>
<p><strong>负责人：</strong></p>
<p><strong>开始日期：</strong>${new Date().toLocaleDateString('zh-CN')}</p>
<p><strong>截止日期：</strong></p>
<hr>
<h3>项目背景</h3>
<p></p>
<h3>项目目标</h3>
<ul><li>目标 1</li><li>目标 2</li></ul>
<h3>里程碑</h3>
<table>
<tr><th>阶段</th><th>任务</th><th>负责人</th><th>截止日期</th><th>状态</th></tr>
<tr><td>阶段一</td><td></td><td></td><td></td><td>未开始</td></tr>
<tr><td>阶段二</td><td></td><td></td><td></td><td>未开始</td></tr>
<tr><td>阶段三</td><td></td><td></td><td></td><td>未开始</td></tr>
</table>
<h3>风险与应对</h3>
<ul><li>风险 1：应对措施</li></ul>`
  },
  {
    name: '日记',
    icon: '&#128214;',
    desc: '每日记录模板',
    type: 'richtext',
    content: `<h2>&#128197; ${new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
<h3>今日心情</h3>
<p>😊 😐 😔 （选择一个）</p>
<h3>今日要事</h3>
<div class="todo-item"><input type="checkbox"><span class="todo-text">要事 1</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">要事 2</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">要事 3</span></div>
<h3>今日记录</h3>
<p></p>
<h3>感恩时刻</h3>
<p></p>
<h3>明日计划</h3>
<p></p>`
  },
  {
    name: '旅行清单',
    icon: '&#9992;&#65039;',
    desc: '旅行准备与行程规划模板',
    type: 'richtext',
    content: `<h2>旅行清单</h2>
<p><strong>目的地：</strong></p>
<p><strong>出发日期：</strong></p>
<p><strong>返回日期：</strong></p>
<hr>
<h3>证件物品</h3>
<div class="todo-item"><input type="checkbox"><span class="todo-text">身份证/护照</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">机票/车票</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">酒店预订确认</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">现金/银行卡</span></div>
<h3>行李清单</h3>
<div class="todo-item"><input type="checkbox"><span class="todo-text">换洗衣物</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">洗漱用品</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">充电器/数据线</span></div>
<div class="todo-item"><input type="checkbox"><span class="todo-text">相机</span></div>
<h3>行程安排</h3>
<table>
<tr><th>日期</th><th>上午</th><th>下午</th><th>晚上</th></tr>
<tr><td>Day 1</td><td></td><td></td><td></td></tr>
<tr><td>Day 2</td><td></td><td></td><td></td></tr>
<tr><td>Day 3</td><td></td><td></td><td></td></tr>
</table>`
  },
  {
    name: 'Markdown 笔记',
    icon: '&#128187;',
    desc: '空白 Markdown 笔记，适合技术文档',
    type: 'markdown',
    content: `# 标题\n\n## 概述\n\n在此输入概述内容...\n\n## 详细内容\n\n### 要点一\n\n- 列表项 1\n- 列表项 2\n\n### 要点二\n\n\`\`\`javascript\n// 代码示例\nconsole.log('Hello World');\n\`\`\`\n\n## 总结\n\n> 引用内容\n\n---\n\n- [ ] 待办事项 1\n- [ ] 待办事项 2\n`
  },
  {
    name: '知识卡片',
    icon: '&#128161;',
    desc: '简洁的知识点记录模板',
    type: 'richtext',
    content: `<h2>&#128161; 知识卡片</h2>
<p><strong>主题：</strong></p>
<p><strong>分类：</strong></p>
<p><strong>日期：</strong>${new Date().toLocaleDateString('zh-CN')}</p>
<hr>
<h3>核心概念</h3>
<p></p>
<h3>关键要点</h3>
<ul><li>要点 1</li><li>要点 2</li><li>要点 3</li></ul>
<h3>示例</h3>
<p></p>
<h3>延伸阅读</h3>
<ul><li><a href="">参考链接 1</a></li></ul>`
  }
];
