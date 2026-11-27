const scene = document.querySelector('#archive-scene')
const pen = scene.getContext('2d')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
let selected = 0
let frame = 0
// Parallel projection of slim archival cases. Paint the far rows first.
function paint(lift = 1) {
  if (!pen) return
  const w = scene.clientWidth, h = scene.clientHeight
  if (!w || !h) return
  const density = Math.min(devicePixelRatio, 2)
  scene.width = Math.round(w * density)
  scene.height = Math.round(h * density)
  const scale = Math.max(w / 820, h / 460)
  pen.setTransform(scale*density,0,0,scale*density,(w-820*scale)*density/2,(h-460*scale)*density/2)
  function face(points, fill) {
    pen.beginPath()
    points.forEach(([x,y],i) => i ? pen.lineTo(x,y) : pen.moveTo(x,y))
    pen.closePath()
    pen.fillStyle = fill
    pen.fill()
  }
  for (let row=-2;row<5;row++) {
    for (let col=-14;col<24;col++) {
      const active = row===1 && col===4+selected%5
      const x=col*46-row*52, y=row*106+col*12-54-(active?36*lift:0)
      const side=pen.createLinearGradient(x,y,x+82,y+85)
      side.addColorStop(0,active?'#aca79a':'#b2ada2')
      side.addColorStop(.35,'#e3ded4')
      side.addColorStop(.8,'#cac3b7')
      side.addColorStop(1,'#b1a99a')
      face([[x+19,y+3],[x+153,y-73],[x+153,y+6],[x+19,y+83]],side)
      face([[x,y],[x+19,y+3],[x+19,y+83],[x,y+80]],active?'#d8d0bb':'#d5d0c6')
      face([[x,y],[x+134,y-77],[x+153,y-73],[x+19,y+3]],active?'#fffdf4':'#faf8f2')
      face([[x+6,y+8],[x+13,y+9],[x+13,y+13],[x+6,y+12]],active?'#bd7725':'#928f86')
      pen.save()
      pen.transform(1,-.57,0,1,x+31,y+9)
      pen.fillStyle='#706f67';pen.font='6px monospace'
      pen.fillText('MAJ / ARCHIVE',0,0)
      pen.restore()
    }
  }
}
function selectRecord(index) {
  selected=(index+projects.length)%projects.length
  const p=projects[selected]
  document.querySelector('#record-name').textContent=p.name
  document.querySelector('#record-category').textContent='PROJECT ARCHIVE / '+labels[p.type]
  const link=document.querySelector('#record-link')
  link.href=p.url || '#project-'+selected
  link.textContent=p.url?'打开项目仓库':'阅读功能介绍'
  if (!p.url) link.onclick=()=>render('all')
  else link.onclick=null
  document.querySelector('#position').textContent=String(selected+1).padStart(2,'0')+' / '+projects.length
  cancelAnimationFrame(frame)
  const start=performance.now()
  function animate(now) {
    const t=reduced.matches?1:Math.min(1,(now-start)/360)
    paint(1-(1-t)**3)
    if(t<1)frame=requestAnimationFrame(animate)
  }
  frame=requestAnimationFrame(animate)
}
document.querySelector('#previous').onclick=()=>selectRecord(selected-1)
document.querySelector('#next').onclick=()=>selectRecord(selected+1)
new ResizeObserver(()=>paint()).observe(scene)
selectRecord(0)
