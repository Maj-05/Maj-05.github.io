/* MAJ–05 / PROJECT ANALYSIS OS — 交互层
   档案阵列以平行投影绘制卡片，选中时沿列传播波浪；键盘与按钮均可切换。 */

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

/* ---------- Archive array canvas ---------- */
const scene = document.querySelector('#archive-scene')
const pen = scene.getContext('2d')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const stage = document.querySelector('#array-stage')
let selected = 0
let frame = 0
let wave = null
let breathe = 0

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

function waveHeight(row, col, now) {
  if (!wave) return 0
  const t = (now - wave.start) / 1000
  if (t > 1.6) { wave = null; return 0 }
  const dist = Math.abs(row - wave.row) * 1 + Math.abs(col - wave.col) * .35
  const phase = t - dist * .12
  if (phase < 0 || phase > .7) return 0
  const v = Math.sin((phase / .7) * Math.PI)
  return 30 * v * Math.exp(-t * 1.4)
}

function paint(now = performance.now(), lift = 1) {
  if (!pen) return
  if (!geometry()) return
  pen.clearRect(0, 0, 820, 470)
  const dark = document.documentElement.dataset.theme === 'dark'
  const top = dark ? '#3a3d38' : '#e3ded4'
  const sideA = dark ? '#242723' : '#bcb6aa'
  const sideB = dark ? '#31352f' : '#d8d2c7'
  const label = dark ? '#8f8a7f' : '#706f67'
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()

  // rows painted back-to-front so nearer cards overlap correctly
  for (let row = -2; row < 5; row++) {
    for (let col = -14; col < 24; col++) {
      const active = row === 1 && col === 4 + (selected % 5)
      const wh = waveHeight(row, col, now)
      const breath = active ? breathe * 6 : 0
      const y = row * 106 + col * 12 - 54 - (active ? 36 * lift : 0) - wh - breath
      const x = col * 46 - row * 52
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
      pen.fillText('MAJ / ARCHIVE', 0, 0)
      pen.restore()
    }
  }
}

function activeBreathing() { return !reduced.matches && !wave && breathe > 0 }

function loop(now) {
  if (wave) {
    paint(now)
    if (wave) frame = requestAnimationFrame(loop)
    return
  }
  breathe = Math.max(0, breathe - .006)
  paint(now, 1)
  if (activeBreathing()) frame = requestAnimationFrame(loop)
}

function selectRecord(index, emitWave = true) {
  selected = (index + projects.length) % projects.length
  const p = projects[selected]
  document.querySelector('#record-name').textContent = p.name
  document.querySelector('#record-category').textContent = 'PROJECT ARCHIVE / ' + labels[p.type]
  document.querySelector('#position').textContent = String(selected + 1).padStart(2, '0') + ' / ' + projects.length
  document.querySelector('#readout-code').textContent = code(selected)
  document.querySelector('#readout-type').textContent = labels[p.type]
  document.querySelector('#readout-index').textContent = String(selected + 1).padStart(2, '0') + ' / ' + projects.length
  const open = document.querySelector('#record-open')
  open.textContent = p.url ? 'ACCESS FILE →' : 'READ CONCEPT →'
  open.onclick = () => showDetail(selected)
  if (emitWave && !reduced.matches) wave = { row: 1, col: 4 + (selected % 5), start: performance.now() }
  breathe = 1
  cancelAnimationFrame(frame)
  const start = performance.now()
  function animate(now) {
    const t = reduced.matches ? 1 : Math.min(1, (now - start) / 420)
    paint(now, 1 - (1 - t) ** 3)
    if (t < 1) frame = requestAnimationFrame(animate)
    else if (wave) frame = requestAnimationFrame(loop)
  }
  frame = requestAnimationFrame(animate)
}

document.querySelector('#previous').onclick = () => selectRecord(selected - 1)
document.querySelector('#next').onclick = () => selectRecord(selected + 1)
new ResizeObserver(() => paint()).observe(stage)

/* 列/行导航：左右跨 5 列，上下在列内前后移动 */
function navigate(dx, dy) {
  const cols = 5
  const col = selected % cols
  const row = Math.floor(selected / cols)
  if (dx) selectRecord(((col + dx + cols) % cols) + row * cols)
  else selectRecord((selected + dy * cols + projects.length) % projects.length)
}
addEventListener('keydown', e => {
  if (document.querySelector('#detail').open) return
  if (/input|textarea/i.test(document.activeElement?.tagName || '')) return
  if (e.key === 'ArrowRight') { navigate(1, 0); e.preventDefault() }
  else if (e.key === 'ArrowLeft') { navigate(-1, 0); e.preventDefault() }
  else if (e.key === 'ArrowDown') { navigate(0, 1); e.preventDefault() }
  else if (e.key === 'ArrowUp') { navigate(0, -1); e.preventDefault() }
  else if (e.key === 'Enter') { showDetail(selected); e.preventDefault() }
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
document.querySelector('#detail-prev').onclick = () => { closeDetail(); selectRecord(selected - 1); showDetail(selected) }
document.querySelector('#detail-next').onclick = () => { closeDetail(); selectRecord(selected + 1); showDetail(selected) }

/* 点击目录卡片打开对应档案 */
grid.addEventListener('click', e => {
  const card = e.target.closest('.card')
  if (card) showDetail(Number(card.dataset.index))
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
function finishBoot() { if (booted) return; booted = true; boot.classList.add('done'); selectRecord(0) }
setTimeout(finishBoot, 2100)
addEventListener('keydown', finishBoot, { once: true })
boot.addEventListener('click', finishBoot, { once: true })
if (reduced.matches) { boot.style.display = 'none'; selectRecord(0) }
