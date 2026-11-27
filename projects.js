const projects=[
 {name:'Delta Force · 机密/绝密难度',type:'mods',label:'GAME MOD',icon:'◈',desc:'为《逃离鸭科夫》加入普通、机密与绝密难度，并提供 AI、物资爆率和隐藏分等自定义选项。',tech:'C# · Escape from Duckov',url:'https://github.com/Maj-05/Delta-Force-Classified-Top-Secret-Difficulty-Adapted-by-Duckov'},
 {name:'Escape from Duckov 模组集合',type:'mods',label:'GAME MODS',icon:'⬡',desc:'鸭科夫相关模组与实验项目。具体功能以各模组页面和创意工坊说明为准。',tech:'C# · Game Modding',url:'https://github.com/Maj-05/-Escape-from-Duckov-mod-'},
 {name:'Bilibili 链接解析',type:'plugins',label:'YUNZAI PLUGIN',icon:'▶',desc:'自动识别 B 站视频、专栏、动态和 QQ 分享卡片，并将内容整理后发送到聊天。',tech:'JavaScript · Yunzai',url:'https://github.com/Maj-05/yunzai-plugin-bili'},
 {name:'梗百科',type:'plugins',label:'YUNZAI PLUGIN',icon:'⌕',desc:'本地查询梗、缩写与网络黑话，内置 6696 条词条，支持命令查询和其他插件调用。',tech:'JavaScript · SQLite',url:'https://github.com/Maj-05/memewiki-plugin'},
 {name:'贴吧 Dive',type:'plugins',label:'YUNZAI PLUGIN',icon:'↗',desc:'面向 TRSS-Yunzai / Miao-Yunzai 的贴吧读帖、日报与签到插件，支持可选自动化功能。',tech:'JavaScript · Yunzai',url:'https://github.com/Maj-05/yunzai-tieba-dive'},
 {name:'Limbus Company 图鉴',type:'plugins',label:'YUNZAI PLUGIN',icon:'▦',desc:'离线查询人格、E.G.O、敌人与饰品，支持筛选、分页、随机抽卡与队伍参考。',tech:'JavaScript · Offline Data',url:'https://github.com/Maj-05/yunzai-limbus-plugin'},
 {name:'重返未来：1999 图鉴',type:'plugins',label:'YUNZAI PLUGIN',icon:'✳',desc:'在云崽与 AstrBot 中离线查询角色各阶技能、心相增幅与物品来源，支持稀有度和灵感组合筛选。',tech:'Yunzai · AstrBot',url:'https://github.com/Maj-05/r1999-plugin'},
 {name:'ChatAI 扩展模块',type:'plugins',label:'AI EXTENSIONS',icon:'✦',desc:'将表情按情绪分类供 AI 按语境调用；支持中断生成，以及让机器人判断何时适合主动接话或问候。仅介绍功能思路，不公开仓库文件。',tech:'JavaScript · AI · 方法概览'},
 {name:'ChatAI 个性化增强',type:'plugins',label:'PRIVATE PROJECT · CONCEPT ONLY',icon:'◌',desc:'围绕多模型接入、工具与 MCP 调用、记忆和人格管理，以及 Web 管理面板做本地化扩展。这里仅展示功能方向。',tech:'Yunzai · LLM · MCP'},
 {name:'鸭科夫模组实验集',type:'mods',label:'PRIVATE PROJECT · CONCEPT ONLY',icon:'⌖',desc:'探索敌情提示、敌人侦测与语音替换、地图信息显示控制，以及任务区域排序等玩法扩展。只展示方法方向，不提供私密仓库或文件。',tech:'C# · Game Modding'},
 {name:'Hunt 战绩查询',type:'tools',label:'STANDALONE TOOL',icon:'◎',desc:'独立运行的 Hunt: Showdown 1896 玩家战绩与排行榜查询工具，提供 CLI 和 HTTP API。',tech:'Node.js · HTTP API',url:'https://github.com/Maj-05/hunt-plugin'},
 {name:'MOSS-Image 远程调用方案',type:'tools',label:'DEPLOYMENT GUIDE',icon:'⌘',desc:'记录本地 GPU 文生图服务、按需启动、闲置释放和安全 API 调用的部署思路。',tech:'Python · FastAPI · CUDA',url:'https://github.com/Maj-05/moss-image-remote-render'},
 {name:'QQBot 插件集合',type:'plugins',label:'PLUGIN COLLECTION',icon:'⌁',desc:'收集视频解析、图片检索等 QQBot / 云崽插件示例与小工具。',tech:'JavaScript · QQBot',url:'https://github.com/Maj-05/QQBot-Plugins'}
];
const grid = document.querySelector('#project-grid')
const buttons = [...document.querySelectorAll('.filters button')]
const labels = { mods: '游戏模组', plugins: '机器人插件', tools: '工具与方案' }

function render(filter) {
  const visible = projects.filter(project => filter === 'all' || project.type === filter)
  grid.innerHTML = visible.map(p => `
    <article class="card" data-type="${p.type}">
      <div class="card-meta"><span class="card-icon" aria-hidden="true">${p.icon}</span><span>${labels[p.type]}</span></div>
      <h3>${p.url ? `<a href="${p.url}">${p.name}</a>` : p.name}</h3>
      <p>${p.desc}</p>
      <div class="card-bottom"><span>${p.tech}</span><span>${p.url ? 'GitHub' : '功能介绍'}</span></div>
    </article>`).join('')
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)))
  document.querySelector('#result-count').textContent = '共 ' + visible.length + ' 个项目'
}
buttons.forEach(button => button.addEventListener('click', () => render(button.dataset.filter)))
render('all')