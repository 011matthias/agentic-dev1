// Proof-of-life canvas loop: a square bouncing in the viewport. Replace with the
// real game. Framework-free on purpose (blueprint: a game loop does not want React;
// canvas games get Vite + TS with no UI framework).

// index.html ships the #stage canvas, so both lookups are guaranteed here; the
// non-null assertions keep `canvas`/`ctx` narrowed inside the loop closures (TS
// widens a guarded `const` back to `| null` across a function boundary).
const canvas = document.querySelector<HTMLCanvasElement>('#stage')!
const ctx = canvas.getContext('2d')!

function resize(): void {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
window.addEventListener('resize', resize)
resize()

const box = { x: 80, y: 80, vx: 180, vy: 140, size: 40 }
let last = performance.now()

function frame(now: number): void {
  // Clamp dt so a backgrounded tab does not teleport the box on return.
  const dt = Math.min((now - last) / 1000, 1 / 30)
  last = now

  box.x += box.vx * dt
  box.y += box.vy * dt
  if (box.x < 0 || box.x + box.size > canvas.width) box.vx *= -1
  if (box.y < 0 || box.y + box.size > canvas.height) box.vy *= -1

  ctx.fillStyle = '#0b0b12'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#77ccff'
  ctx.fillRect(box.x, box.y, box.size, box.size)

  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
