// Lightweight confetti / paint-splat burst. Vanilla canvas so it needs no React
// state and can fire from anywhere (the catch, a coronation). Spawns a temporary
// full-screen canvas, animates particles under gravity, removes itself when done.
// Skips entirely under prefers-reduced-motion.

const COLORS = ['#7c5cff', '#00d9c0', '#ffce3f', '#36d399', '#ff7ec9', '#ff8c42'];

interface Part {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  color: string;
  rect: boolean;
  life: number;
  ttl: number;
}

export function fireConfetti(opts?: { count?: number; originY?: number }): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  } catch {
    /* ignore */
  }
  const count = opts?.count ?? 90;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const cx = W / 2;
  const cy = (opts?.originY ?? 0.42) * H;
  const parts: Part[] = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const sp = 6 + Math.random() * 9;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 6,
      r: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rect: Math.random() < 0.5,
      life: 0,
      ttl: 60 + Math.random() * 40,
    };
  });

  let raf = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of parts) {
      p.life++;
      if (p.life > p.ttl) continue;
      alive = true;
      p.vy += 0.32; // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.ttl);
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.rect) {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (alive) {
      raf = requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(draw);
  window.setTimeout(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
  }, 4000);
}
