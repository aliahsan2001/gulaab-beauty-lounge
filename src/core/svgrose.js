/* A drawn rose for devices without WebGL: four rings of petals seen from above. Each ring opens
   by turning and spreading as bloom goes 0 -> 1 (outer ring first), with the same API as the
   3D rose so pages don't need to care which one they got. */

const RINGS = [
  { n: 5, r: 0.2, len: 34, w: 30, c1: '#4f0b22', c2: '#a8234a' },
  { n: 6, r: 0.34, len: 44, w: 38, c1: '#7a1636', c2: '#c23a62' },
  { n: 7, r: 0.5, len: 56, w: 46, c1: '#a8234a', c2: '#e27a98' },
  { n: 8, r: 0.66, len: 66, w: 54, c1: '#c23a62', c2: '#f3b2c4' },
];

export function mountSvgRose(host, { bloom = 0 } = {}) {
  host.classList.add('svg-rose');
  const defs = RINGS.map((rg, i) => `<radialGradient id="pg${i}" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="${rg.c1}"/><stop offset="1" stop-color="${rg.c2}"/></radialGradient>`).join('');
  const rings = RINGS.map((rg, i) => {
    const petals = Array.from({ length: rg.n }, (_, k) => {
      const a = (360 / rg.n) * k + i * 17;
      return `<g transform="rotate(${a})"><path d="M0 0 C ${rg.w / 2} -${rg.len * 0.3}, ${rg.w / 2} -${rg.len}, 0 -${rg.len} C -${rg.w / 2} -${rg.len}, -${rg.w / 2} -${rg.len * 0.3}, 0 0Z" fill="url(#pg${i})" stroke="rgba(79,11,34,.25)" stroke-width=".6"/></g>`;
    }).join('');
    return `<g class="sr-ring" data-ring="${i}">${petals}</g>`;
  }).reverse().join('');
  host.innerHTML = `<svg viewBox="-100 -100 200 200" aria-hidden="true"><defs>${defs}</defs>${rings}<circle r="7" fill="#4f0b22"/></svg>`;
  const els = [...host.querySelectorAll('.sr-ring')].reverse(); // inner first
  function set(b) {
    els.forEach((g, i) => {
      const start = (1 - i / (els.length - 1)) * 0.6;
      const o = Math.min(1, Math.max(0, (b - start) / 0.4));
      const scale = 0.35 + RINGS[i].r * 0.4 + o * (0.65 - RINGS[i].r * 0.2);
      g.style.transform = `rotate(${(1 - o) * 40}deg) scale(${scale.toFixed(3)})`;
      g.style.opacity = String(0.55 + o * 0.45);
    });
  }
  set(bloom);
  return { setBloom: (b) => set(b), dispose() { host.innerHTML = ''; } };
}
