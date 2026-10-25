/* Page transition: a soft, feathered veil in the evening colour opens from where you clicked and
   carries a few real petals across; then it lifts away from the same point. Drawn on a 2D canvas
   with eased timing, and time-based so it always finishes even if frames stall. Reduced motion
   gets a plain fade. */

import { REDUCED } from './env.js';

let canvas, g, dpr = 1, origin = { x: 0.5, y: 0.5 };
const sprites = [0, 1, 2, 3].map((i) => { const im = new Image(); im.src = `/img/petals/p${i}.webp`; return im; });
let flock = [];

// remember where the visitor clicked, so the veil blooms from there
addEventListener('pointerdown', (e) => { origin = { x: e.clientX / innerWidth, y: e.clientY / innerHeight }; }, { capture: true, passive: true });

function build() {
  canvas = document.createElement('canvas');
  canvas.className = 'drift';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  g = canvas.getContext('2d');
}

function size() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
}

function newFlock() {
  flock = Array.from({ length: 9 }, (_, i) => ({
    img: sprites[i % sprites.length],
    y: 0.1 + Math.random() * 0.8,
    s: 40 + Math.random() * 60,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 2.4,
    lag: Math.random() * 0.35,
    sway: Math.random() * Math.PI * 2,
  }));
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// r: veil radius 0..1 of the screen diagonal; petals: 0..1 through their crossing
function draw(r, petals) {
  const w = innerWidth, h = innerHeight, R = Math.hypot(w, h) * 1.05;
  const cx = origin.x * w, cy = origin.y * h;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  if (r > 0) {
    const rad = r * R, feather = Math.max(1, rad * 0.35);
    const grd = g.createRadialGradient(cx, cy, Math.max(0, rad - feather), cx, cy, rad);
    grd.addColorStop(0, 'rgba(26,13,17,1)');
    grd.addColorStop(1, 'rgba(26,13,17,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }
  for (const p of flock) {
    const t = Math.min(1, Math.max(0, (petals - p.lag) / 0.65));
    if (t <= 0 || t >= 1 || !p.img.complete) continue;
    const x = -120 + (w + 240) * easeInOut(t);
    const y = p.y * h + Math.sin(p.sway + t * 5) * 30 - t * 40;
    g.save();
    g.globalAlpha = Math.sin(Math.PI * t);
    g.translate(x, y);
    g.rotate(p.rot + p.spin * t * 3);
    const ar = p.img.naturalHeight / p.img.naturalWidth || 1;
    g.drawImage(p.img, -p.s / 2, (-p.s * ar) / 2, p.s, p.s * ar);
    g.restore();
  }
}

function animate(duration, fn) {
  return new Promise((resolve) => {
    const start = performance.now();
    let done = false;
    const finish = () => { if (!done) { done = true; fn(1); resolve(); } };
    const tick = (now) => {
      if (done) return;
      const p = Math.min(1, (now - start) / duration);
      fn(p);
      if (p < 1) requestAnimationFrame(tick); else finish();
    };
    requestAnimationFrame(tick);
    setTimeout(finish, duration + 300); // never hang if frames stall
  });
}

export function cover() {
  if (!canvas) build();
  size();
  newFlock();
  canvas.classList.add('is-active');
  if (REDUCED) return animate(220, (p) => draw(p * 1.4, 0));
  return animate(820, (p) => draw(easeInOut(p) * 1.4, p * 0.55));
}

export function reveal() {
  // the veil lifts from the centre of the screen, the petals finish their crossing
  origin = { x: 0.5, y: 0.45 };
  if (REDUCED) return animate(220, (p) => draw(1.4 * (1 - p), 0)).then(() => canvas.classList.remove('is-active'));
  return animate(900, (p) => {
    const e = easeInOut(p);
    const w = innerWidth, h = innerHeight;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // draw a full veil, then cut a feathered hole that grows: the page appears from the middle
    draw(1.4, 0.55 + p * 0.45);
    if (e > 0) {
      const R = Math.hypot(w, h) * 1.05, rad = e * R * 1.25, feather = Math.max(1, rad * 0.4);
      const grd = g.createRadialGradient(w * origin.x, h * origin.y, Math.max(0, rad - feather), w * origin.x, h * origin.y, rad);
      grd.addColorStop(0, 'rgba(0,0,0,1)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = grd;
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
    }
  }).then(() => canvas.classList.remove('is-active'));
}
