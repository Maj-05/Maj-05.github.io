/* MAJ–05 / PROJECT ANALYSIS OS — 交互层
   档案阵列以平行投影绘制；切换时整排书页沿传送带连续下翻（cursor 不回跳）。 */

/* 用档案数量填充所有硬编码占位，避免以后加项目还要手改数字 */
const totalFiles = String(projects.length).padStart(2, '0') + ' FILES'
document.querySelectorAll('[data-total-files]').forEach(el => { el.textContent = totalFiles })
document.querySelector('#status-count').textContent = totalFiles

const grid = document.querySelector('#project-grid')
const buttons = [...document.querySelectorAll('.filters button')]
const labels = { mods: '游戏模组', plugins: '机器人插件', tools: '工具与方案' }
const searchInput = document.querySelector('#search')
const resultCount = document.querySelector('#result-count')
let activeFilter = 'all'
let query = ''

function code(i) { return 'FILE–' + String(i + 1).padStart(2, '0') }

function render() {
  const visible = projects
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => (activeFilter === 'all' || p.type === activeFilter) &&
      (!query || (p.name + p.desc + p.tech + labels[p.type]).toLowerCase().includes(query)))
  grid.innerHTML = visible.length
    ? visible.map(({ p, i }) => `
      <article class="card" data-type="${p.type}" data-index="${i}">
        <div class="card-meta"><span class="card-icon" aria-hidden="true">${p.icon}</span><span>${code(i)} / ${labels[p.type]}</span></div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="card-bottom"><span>${p.tech}</span><span class="code">${p.url ? 'ACCESS ↗' : 'CONCEPT'}</span></div>
      </article>`).join('')
    : '<p class="empty">未找到匹配的档案 / NO MATCHING FILES</p>'
  buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === activeFilter)))
  resultCount.textContent = '共 ' + visible.length + ' 份档案'
}
buttons.forEach(b => b.addEventListener('click', () => { activeFilter = b.dataset.filter; render() }))
searchInput.addEventListener('input', () => { query = searchInput.value.trim().toLowerCase(); render() })
render()

/* ---------- Archive array canvas（连续翻页传送带 · 横向铺满） ---------- */
const scene = document.querySelector('#archive-scene')
const pen = scene.getContext('2d')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const stage = document.querySelector('#array-stage')
const N = projects.length
let cursor = 0        // 无界位置：上一份 -1、下一份 +1，永不回跳
let pos = 0           // 平滑跟随 cursor 的浮点位置
let frame = 0
let wave = null
let breathe = 0

const FOCUS = 1       // 选中排停留在画面 row≈1（与原版构图一致）
const COL_MIN = -14   // 保持原版的横向铺满范围
const COL_MAX = 24

function currentIndex() { return ((cursor % N) + N) % N }

function geometry() {
  const w = scene.clientWidth, h = scene.clientHeight
  if (!w || !h) return null
  const density = Math.min(devicePixelRatio || 1, 2)
  if (scene.width !== Math.round(w * density) || scene.height !== Math.round(h * density)) {
    scene.width = Math.round(w * density)
    scene.height = Math.round(h * density)
  }
  const scale = Math.max(w / 820, h / 470)
  pen.setTransform(scale * density, 0, 0, scale * density, (w - 820 * scale) * density / 2, (h - 470 * scale) * density / 2)
  return { w, h }
}

function face(points, fill) {
  pen.beginPath()
  points.forEach(([x, y], i) => i ? pen.lineTo(x, y) : pen.moveTo(x, y))
  pen.closePath()
  pen.fillStyle = fill
  pen.fill()
}

function waveHeight(j, col, now) {
  if (!wave) return 0
  const t = (now - wave.start) / 1000
  if (t > 1.6) { wave = null; return 0 }
  const dist = Math.abs(j - wave.j) * 0.6 + Math.abs(col - 4) * 0.25
  const phase = t - dist * 0.12
  if (phase < 0 || phase > 0.7) return 0
  return 30 * Math.sin((phase / 0.7) * Math.PI) * Math.exp(-t * 1.4)
}

function paint(now = performance.now()) {
  if (!pen || !geometry()) return
  pen.clearRect(0, 0, 820, 470)
  const dark = document.documentElement.dataset.theme === 'dark'
  const top = dark ? '#3a3d38' : '#e3ded4'
  const sideA = dark ? '#242723' : '#bcb6aa'
  const sideB = dark ? '#31352f' : '#d8d2c7'
  const label = dark ? '#8f8a7f' : '#706f67'
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  const settled = reduced.matches ? 1 : Math.max(0, 1 - Math.abs(cursor - pos))

  // 覆盖 pos 与 cursor 之间的全部排，保证快速连点时高亮排也在画面内
  const lo = Math.min(Math.floor(pos), cursor) - 5
  const hi = Math.max(Math.floor(pos), cursor) + 5

  // 远的排先画，近的排后画覆盖（与原版顺序一致）
  for (let j = lo; j <= hi; j++) {
    const row = FOCUS + (j - pos)
    const idx = ((j % N) + N) % N
    const labelText = 'FILE-' + String(idx + 1).padStart(2, '0')
    for (let col = COL_MIN; col < COL_MAX; col++) {
      const active = j === cursor && col === 4
      const wh = waveHeight(j, col, now)
      const breath = active ? breathe * 6 : 0
      const x = col * 46 - row * 52
      const y = row * 106 + col * 12 - 54 - (active ? 36 * settled : 0) - wh - breath
      const g = pen.createLinearGradient(x, y, x + 82, y + 85)
      g.addColorStop(0, active ? accent : sideA)
      g.addColorStop(.35, active ? top : sideB)
      g.addColorStop(.8, sideB)
      g.addColorStop(1, sideA)
      face([[x + 19, y + 3], [x + 153, y - 73], [x + 153, y + 6], [x + 19, y + 83]], g)
      face([[x, y], [x + 19, y + 3], [x + 19, y + 83], [x, y + 80]], active ? accent : sideA)
      face([[x, y], [x + 134, y - 77], [x + 153, y - 73], [x + 19, y + 3]], active ? (dark ? '#f0ece4' : '#fffdf4') : top)
      face([[x + 6, y + 8], [x + 13, y + 9], [x + 13, y + 13], [x + 6, y + 12]], active ? accent : label)
      pen.save()
      pen.transform(1, -.57, 0, 1, x + 31, y + 9)
      pen.fillStyle = label
      pen.font = '6px monospace'
      pen.fillText(labelText, 0, 0)
      pen.restore()
    }
  }
}

function loop(now) {
  const diff = cursor - pos
  let moving = false
  if (Math.abs(diff) > 0.003) { pos += diff * 0.16; moving = true }
  else pos = cursor
  if (!wave && breathe > 0) breathe = Math.max(0, breathe - 0.006)
  paint(now) // waveHeight 会在结束时把 wave 置空
  if (moving || wave || breathe > 0) frame = requestAnimationFrame(loop)
}

function sync(emitWave = true) {
  const idx = currentIndex()
  const p = projects[idx]
  document.querySelector('#record-name').textContent = p.name
  document.querySelector('#record-category').textContent = 'PROJECT ARCHIVE / ' + labels[p.type]
  document.querySelector('#position').textContent = String(idx + 1).padStart(2, '0') + ' / ' + N
  document.querySelector('#readout-code').textContent = code(idx)
  document.querySelector('#readout-type').textContent = labels[p.type]
  document.querySelector('#readout-index').textContent = String(idx + 1).padStart(2, '0') + ' / ' + N
  const open = document.querySelector('#record-open')
  open.textContent = p.url ? 'ACCESS FILE →' : 'READ CONCEPT →'
  open.onclick = () => showDetail(idx)
  if (emitWave && !reduced.matches) wave = { j: cursor, start: performance.now() }
  breathe = 1
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(loop)
}

/** 直接跳到某个项目（优先走最短路径，避免从 19 跳 0 时倒着滑回去） */
function goTo(index) {
  const target = ((index % N) + N) % N
  const k = Math.round((cursor - target) / N)
  cursor = target + k * N
  sync()
}

/** 上一份 / 下一份：cursor 无界增减，一路往下翻 */
function step(delta) {
  cursor += delta
  sync()
}

document.querySelector('#previous').onclick = () => step(-1)
document.querySelector('#next').onclick = () => step(1)
new ResizeObserver(() => paint()).observe(stage)

addEventListener('keydown', e => {
  if (document.querySelector('#detail').open) return
  if (/input|textarea/i.test(document.activeElement?.tagName || '')) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { step(1); e.preventDefault() }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { step(-1); e.preventDefault() }
  else if (e.key === 'Enter') { showDetail(currentIndex()); e.preventDefault() }
})

/* ---------- Detail dialog ---------- */
const detail = document.querySelector('#detail')
function showDetail(i) {
  const p = projects[i]
  document.querySelector('#detail-code').textContent = code(i)
  document.querySelector('#detail-kicker').textContent = 'PROJECT ARCHIVE / ' + labels[p.type]
  document.querySelector('#detail-title').textContent = p.name
  document.querySelector('#detail-type').textContent = labels[p.type]
  document.querySelector('#detail-tech').textContent = p.tech
  document.querySelector('#detail-status').textContent = p.url ? '公开档案 / 已归档' : '概念记录 / 不公开文件'
  document.querySelector('#detail-desc').textContent = p.desc
  const link = document.querySelector('#detail-link')
  if (p.url) { link.href = p.url; link.style.display = '' }
  else { link.href = '#'; link.style.display = 'none' }
  document.querySelector('#array-mode').textContent = 'ACCESS'
  detail.showModal()
}
function closeDetail() { detail.close(); document.querySelector('#array-mode').textContent = 'PREVIEW' }
document.querySelector('#detail-close').onclick = closeDetail
detail.addEventListener('click', e => { if (e.target === detail) closeDetail() })
document.querySelector('#detail-prev').onclick = () => { closeDetail(); step(-1); showDetail(currentIndex()) }
document.querySelector('#detail-next').onclick = () => { closeDetail(); step(1); showDetail(currentIndex()) }

/* 点击目录卡片打开对应档案 */
grid.addEventListener('click', e => {
  const card = e.target.closest('.card')
  if (card) {
    goTo(Number(card.dataset.index))
    showDetail(currentIndex())
  }
})

/* ---------- Theme ---------- */
const themeToggle = document.querySelector('#theme-toggle')
const saved = localStorage.getItem('maj05-theme')
if (saved) document.documentElement.dataset.theme = saved
themeToggle.onclick = () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  localStorage.setItem('maj05-theme', next)
  document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#1b1d1b' : '#e8e5e1'
  paint()
}

/* ---------- Boot ---------- */
const boot = document.querySelector('#boot')
let booted = false
function finishBoot() { if (booted) return; booted = true; boot.classList.add('done'); sync(false) }
setTimeout(finishBoot, 2100)
addEventListener('keydown', finishBoot, { once: true })
boot.addEventListener('click', finishBoot, { once: true })
if (reduced.matches) { boot.style.display = 'none'; pos = cursor; sync(false) }
