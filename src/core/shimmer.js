/* The cursor leaves a faint shimmer, like highlighter on skin: tiny pearly sparkles that fade
   within a second. Fine pointers only, and it rests when the pointer does. */

import { FINE, REDUCED } from './env.js';

export function initShimmer() {
  if (!FINE || REDUCED) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'shimmer';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const g = canvas.getContext('2d');
  let dpr = 1, raf = 0, lx = 0, ly = 0;
  const dots = [];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; };
  size();
  addEventListener('resize', size);

  function tick(now) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      const t = (now - d.born) / d.life;
      if (t >= 1) { dots.splice(i, 1); continue; }
      const a = (1 - t) * d.a;
      const r = d.r * (1 - t * 0.5);
      const grd = g.createRadialGradient(d.x, d.y + t * 6, 0, d.x, d.y + t * 6, r * 3);
      grd.addColorStop(0, `rgba(255,248,240,${a})`);
      grd.addColorStop(0.35, `rgba(200,150,120,${a * 0.55})`);
      grd.addColorStop(1, 'rgba(200,150,120,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(d.x, d.y + t * 6, r * 3, 0, Math.PI * 2);
      g.fill();
    }
    raf = dots.length ? requestAnimationFrame(tick) : 0;
  }

  addEventListener('pointermove', (e) => {
    const dist = Math.hypot(e.clientX - lx, e.clientY - ly);
    lx = e.clientX; ly = e.clientY;
    const n = Math.min(3, Math.floor(dist / 14));
    for (let i = 0; i < n; i++) {
      dots.push({ x: e.clientX + (Math.random() - 0.5) * 14, y: e.clientY + (Math.random() - 0.5) * 14, r: 1 + Math.random() * 1.6, a: 0.35 + Math.random() * 0.4, born: performance.now(), life: 600 + Math.random() * 500 });
    }
    if (dots.length > 140) dots.splice(0, dots.length - 140);
    if (!raf && dots.length) raf = requestAnimationFrame(tick);
  }, { passive: true });
}
