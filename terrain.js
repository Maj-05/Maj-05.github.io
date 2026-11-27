// Draw the feature illustration locally so it stays sharp across screen sizes.
const canvas = document.querySelector('#terrain')
const ctx = canvas.getContext('2d')
if (ctx) {
  function drawTerrain() {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    const density = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * density)
    canvas.height = Math.round(height * density)
    ctx.setTransform(canvas.width / 800, 0, 0, canvas.height / 440, 0, 0)
    ctx.fillStyle = '#182922'
    ctx.fillRect(0, 0, 800, 440)
    ctx.fillStyle = '#6b9176'
    for (let y = 12; y < 440; y += 17) {
      for (let x = 12; x < 800; x += 17) ctx.fillRect(x, y, 1, 1)
    }
    ctx.save()
    ctx.beginPath()
    ctx.arc(567, 103, 57, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = '#d6f594'
    ctx.fillRect(510, 45, 114, 116)
    ctx.fillStyle = '#182922'
    for (let y = 94; y < 163; y += 7) ctx.fillRect(505, y, 125, (y - 85) / 15)
    ctx.restore()
    const point = (x, z) => {
      const peak = (cx, cz, spread, amplitude) => amplitude * Math.exp(-((x-cx)**2 + (z-cz)**2) / spread)
      const relief = peak(-.45,.43,.095,162) + peak(.34,.35,.045,125) + peak(.83,.53,.05,86)
      const ripples = 11*Math.sin(10*x+5*z) + 7*Math.cos(19*x-8*z)
      return [400+x*(450+180*z), 208 + 273*z - relief - ripples]
    }
    for (let row = 0; row < 34; row++) {
      const z = row/33
      const line = Array.from({length:73}, (_,i) => point(i/36-1,z))
      const back = Array.from({length:73}, (_,i) => point(i/36-1,z-1/33))
      ctx.beginPath()
      back.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y))
      for (let i = line.length-1; i >= 0; i--) ctx.lineTo(...line[i])
      ctx.closePath()
      ctx.fillStyle = '#1a3026'
      ctx.fill()
      ctx.strokeStyle = 'rgba(184,226,141,.72)'
      ctx.lineWidth = 1.15
      ctx.beginPath()
      line.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y))
      ctx.stroke()
      ctx.strokeStyle = 'rgba(135,183,131,.42)'
      ctx.beginPath()
      for(let i=0;i<line.length;i+=2){ctx.moveTo(...back[i]);ctx.lineTo(...line[i])}
      ctx.stroke()
    }
  }
  new ResizeObserver(drawTerrain).observe(canvas)
  drawTerrain()
}
