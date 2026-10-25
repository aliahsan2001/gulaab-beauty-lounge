/* Gallery: the lookbook orbits the rose. Phones and lighter devices get a swipeable carousel;
   everyone gets the full album below and a lightbox. */

import { img } from '../data.js';
import { esc, idle } from '../core/ui.js';
import { LITE } from '../core/env.js';

const LOOKS = [
  ['1684868268327-7e5590bcfbd6', 'Bridal', 'Baraat in red and gold'],
  ['1773688189414-7637b9b138e1', 'Makeup', 'Soft glam, the finishing blush'],
  ['1580618672591-eb180b1a973f', 'Hair', 'Round-brush blow-dry'],
  ['1732118400647-a81e3b37be87', 'Mehndi', 'Bridal mehndi, full detail'],
  ['1610173827043-9db50e0d8ef9', 'Bridal', 'Matha patti and kundan'],
  ['1607779097040-26e80aa78e66', 'Nails', 'Mauve and silver glitter'],
  ['1643684391140-c5056cfd3436', 'Skin', 'Hydrating facial massage'],
  ['1721324807083-e9ddaa99310e', 'Bridal', 'A soft, glowing nikah look'],
  ['1734111719430-fe4a3973f8af', 'Hair', 'Long, soft waves'],
  ['1519014816548-bf5fe059798b', 'Nails', 'Valentine red nail art'],
  ['1631549423034-ceb712f24ab2', 'Bridal', 'A rose in the hair'],
  ['1596462502278-27bfdc403348', 'Makeup', 'The kit, ready for a bride'],
  ['1736849544435-62169987e56c', 'Bridal', 'Walima pastels'],
  ['1623217509141-6f735087b50c', 'Mehndi', 'Arabic mehndi, both hands'],
  ['1695527081848-1e46c06e6458', 'Hair', 'Balayage in progress'],
  ['1600685890506-593fdf55949b', 'Bridal', 'Traditional red, ornate gold'],
].map(([id, cat, title]) => ({ id, cat, title, src: img(id, 640), big: img(id, 1280) }));

export async function mount(root) {
  const cleanups = [];
  const q = (s) => root.querySelector(s);
  const N = LOOKS.length;
  q('[data-look-n]').textContent = N;
  const now = q('[data-look-now]');
  const show = (i) => {
    q('[data-look-i]').textContent = i + 1;
    now.innerHTML = `<p class="label">${esc(LOOKS[i].cat)}</p><p class="display">${esc(LOOKS[i].title)}</p>`;
  };
  show(0);

  /* ---------- lightbox ---------- */
  const lb = q('[data-lightbox]');
  const open = (i) => {
    q('[data-lb-img]').src = LOOKS[i].big;
    q('[data-lb-img]').alt = LOOKS[i].title;
    q('[data-lb-cap]').innerHTML = `<span class="label">${esc(LOOKS[i].cat)}</span> ${esc(LOOKS[i].title)}`;
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-open'));
    lb.querySelector('[data-lb-close]').focus();
  };
  const close = () => { lb.classList.remove('is-open'); setTimeout(() => (lb.hidden = true), 400); };
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('[data-lb-close]')) close(); });
  const onKey = (e) => {
    if (e.key === 'Escape' && !lb.hidden) close();
    if (!lb.hidden || e.target.closest('input, select, textarea')) return;
    if (e.key === 'ArrowRight') q('[data-next]').click();
    if (e.key === 'ArrowLeft') q('[data-prev]').click();
  };
  addEventListener('keydown', onKey);
  cleanups.push(() => removeEventListener('keydown', onKey));

  /* ---------- the orbit ---------- */
  let ring = null, idx = 0;
  q('[data-prev]').addEventListener('click', () => (ring ? ring.prev() : (idx = (idx - 1 + N) % N, show(idx))));
  q('[data-next]').addEventListener('click', () => (ring ? ring.next() : (idx = (idx + 1) % N, show(idx))));
  root.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('[data-layout]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    ring?.setLayout(b.dataset.layout);
  }));
  const use3D = !LITE && innerWidth >= 760;
  if (use3D) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountGallery } = await import('../three/gallery.js');
        if (!root.isConnected) return;
        ring = mountGallery(q('[data-look]'), { items: LOOKS, small: innerWidth < 1000, onChange: (i) => { idx = i; show(i); }, onOpen: open });
        cleanups.push(() => ring.dispose());
      } catch (err) {
        console.warn('Gallery ring unavailable, using the carousel', err);
        root.classList.add('no-ring');
      }
    });
  } else root.classList.add('no-ring');

  /* ---------- carousel + album ---------- */
  q('[data-carousel]').innerHTML = LOOKS.map((l, i) => `<button type="button" class="slide" data-open="${i}"><img src="${l.src}" alt="${esc(l.title)}" loading="lazy"><span><small class="label">${esc(l.cat)}</small>${esc(l.title)}</span></button>`).join('');
  q('[data-album]').innerHTML = LOOKS.map((l, i) => `<button type="button" class="album-item" data-open="${i}" data-reveal><img src="${l.src}" alt="${esc(l.title)}" loading="lazy"><span class="label">${esc(l.cat)}</span></button>`).join('');
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) open(Number(b.dataset.open)); });

  return () => cleanups.forEach((fn) => fn());
}
