/* Home: a single rose bud turns slowly in soft light; as you scroll its petals unfurl one by one.
   It opens most of the way here and saves full bloom for booking. */

import { SERVICES, STYLISTS, BRIDAL, QUOTES, img, rs, mins } from '../data.js';
import { esc, idle } from '../core/ui.js';
import { LITE, REDUCED } from '../core/env.js';
import { ScrollTrigger } from '../core/motion.js';
import { mountSvgRose } from '../core/svgrose.js';

const CATS = [
  { cat: 'Hair', title: 'Hair', line: 'Cuts, colour, keratin and blow-dries that last', photo: '1746723378067-83a345ff3160' },
  { cat: 'Skin', title: 'Skin', line: 'Facials, threading and gentle waxing', photo: '1570172619644-dfd03ed5d881' },
  { cat: 'Nails', title: 'Nails', line: 'Manicures, pedicures, gel and nail art', photo: '1632345031435-8727f6897d53' },
  { cat: 'Makeup & lashes', title: 'Makeup', line: 'Party looks, soft glam, lashes and mehndi', photo: '1773688189414-7637b9b138e1' },
];

export async function mount(root, ctx) {
  const cleanups = [];
  const q = (s) => root.querySelector(s);

  /* ---------- content ---------- */
  q('[data-cats]').innerHTML = CATS.map((c, i) => {
    const from = Math.min(...SERVICES.filter((s) => s.cat === c.cat).map((s) => s.price));
    return `<a class="cat" href="/services#${c.cat.split(' ')[0].toLowerCase()}" data-reveal style="--i:${i}">
      <div class="cat-media"><img src="${img(c.photo, 640)}" alt="" loading="lazy"></div>
      <div class="cat-body"><span class="num">0${i + 1}</span><h3 class="display">${esc(c.title)}</h3><p>${esc(c.line)}</p><span class="label">From ${rs(from)}</span></div>
    </a>`;
  }).join('');
  const popular = ['cut-blowdry', 'blowdry', 'gold-facial', 'manicure', 'gel', 'party-makeup', 'mehndi-hands', 'threading'].map((id) => SERVICES.find((s) => s.id === id));
  q('[data-popular]').innerHTML = popular.map((s) => `<li data-reveal><a href="/book?service=${s.id}"><span class="pm-name">${esc(s.name)}<small>${mins(s.dur)}</small></span><span class="pm-dots" aria-hidden="true"></span><span class="pm-price">${s.from ? 'from ' : ''}${rs(s.price)}</span></a></li>`).join('');
  q('[data-bride-list]').innerHTML = BRIDAL.map((b) => `<li><span class="display">${esc(b.name)}</span><span>${esc(b.for)}</span><b>${rs(b.price)}</b></li>`).join('');
  q('[data-team]').innerHTML = STYLISTS.map((s) => `
    <article class="stylist" data-reveal>
      <span class="avatar" style="--tone:${s.tone}">${esc(s.name.split(' ').map((w) => w[0]).join(''))}</span>
      <h3 class="display">${esc(s.name)}</h3><p>${esc(s.role)} · ${s.years} years at the chair</p>
    </article>`).join('');
  q('[data-quotes]').innerHTML = QUOTES.map((x) => `<figure class="quote" data-reveal><blockquote class="display">${esc(x.text)}</blockquote><figcaption class="label">${esc(x.who)}</figcaption></figure>`).join('');

  /* ---------- the rose ---------- */
  const hero = q('[data-hero]');
  const meter = q('[data-meter]');
  let rose = null;
  const BLOOM_MAX = 0.84;
  const apply = (p) => {
    const b = 0.04 + (1 - Math.pow(1 - p, 1.6)) * (BLOOM_MAX - 0.04); // opens early, settles slowly
    rose?.setBloom(b);
    meter.style.transform = `scaleX(${(b / 1).toFixed(3)})`;
    hero.classList.toggle('is-open', p > 0.15);
  };

  const wide = innerWidth >= 900;
  if (!LITE) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountRose } = await import('../three/rose.js');
        if (!root.isConnected) return;
        rose = mountRose(q('[data-rose]'), { dark: true, simple: innerWidth < 760, bloom: 0.04, offsetX: wide ? -0.9 : 0, lookY: wide ? 0.2 : -0.45, distance: wide ? 5.4 : 8 });
        cleanups.push(() => rose.dispose());
        apply(ScrollTrigger.getById?.('bloom')?.progress || 0);
      } catch (err) {
        console.warn('3D rose unavailable, drawing it instead', err);
        document.documentElement.classList.add('lite');
        rose = mountSvgRose(q('[data-rose-svg]'), { bloom: 0.04 });
      }
    });
  } else rose = mountSvgRose(q('[data-rose-svg]'), { bloom: 0.04 });

  // dev only: ?bloomP=0.5 jumps the hero, for screenshots
  const devP = import.meta.env.DEV && new URLSearchParams(location.search).get('bloomP');
  if (devP) { const p = Number(devP); const t = setInterval(() => rose && apply(p), 300); cleanups.push(() => clearInterval(t)); }
  else if (REDUCED) apply(1);
  else ctx.add(() => {
    ScrollTrigger.create({ id: 'bloom', trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: (s) => apply(s.progress) });
  });
  apply(0);

  return () => cleanups.forEach((fn) => fn());
}
