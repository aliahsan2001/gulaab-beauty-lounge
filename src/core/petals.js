/* Loose petals that drift across the page to frame each section. Each [data-petals] section
   gets a few petals (rendered from the 3D rose) at its edges that float down and turn as you
   scroll past, nearer ones faster and farther ones softly blurred. */

import { gsap, ScrollTrigger } from './motion.js';
import { REDUCED } from './env.js';


export function loosePetals(root, selector = 'main [data-petals], [data-barba="container"][data-petals], [data-barba="container"] [data-petals]') {
  root.querySelectorAll(selector).forEach((sec, si) => {
    if (sec.querySelector(':scope > .petal-layer')) return;
    const n = Number(sec.dataset.petals) || 4;
    const layer = document.createElement('div');
    layer.className = 'petal-layer';
    layer.setAttribute('aria-hidden', 'true');
    let html = '';
    for (let i = 0; i < n; i++) {
      // real petals, rendered from the 3D rose, at a few depths
      const left = i % 2 ? 89 + ((i * 7 + si * 3) % 8) : -5 + ((i * 11 + si * 5) % 6); // hug the page edges, clear of the text
      const top = 6 + ((i * 29 + si * 17) % 74);
      const depth = ((i * 37 + si * 11) % 10) / 10;
      html += `<img class="loose-petal" src="/img/petals/p${(i + si) % 4}.webp" alt="" style="left:${left}%;top:${top}%;--s:${(0.55 + depth * 0.7).toFixed(2)};--r:${(i * 47 + si * 19) % 360}deg;--b:${depth < 0.25 ? 2 : 0}px" data-depth="${depth.toFixed(2)}">`;
    }
    layer.innerHTML = html;
    sec.prepend(layer);
    if (REDUCED) return;
    [...layer.children].forEach((el, i) => {
      const drift = 60 + Number(el.dataset.depth) * 160; // nearer petals travel further
      gsap.fromTo(el, { y: -drift, rotation: -30 }, {
        y: drift, rotation: 40 + i * 25, x: (i % 2 ? -1 : 1) * 40, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      });
    });
  });
  ScrollTrigger.refresh();
}
