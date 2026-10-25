/* Services & prices: a clean list. Hovering a service brings up its photo, floating at depth
   beside the cursor and leaning with the movement. Touch screens show a small photo in the row. */

import { SERVICES, CATEGORIES, img, rs, mins } from '../data.js';
import { esc } from '../core/ui.js';
import { FINE, REDUCED } from '../core/env.js';
import { gsap, scrollToEl } from '../core/motion.js';

const slug = (c) => c.split(' ')[0].toLowerCase();

export async function mount(root) {
  const q = (s) => root.querySelector(s);
  q('[data-cat-jump]').innerHTML = CATEGORIES.map((c) => `<a class="chip" href="#${slug(c)}" data-jump>${esc(c)}</a>`).join('');
  q('[data-menu]').innerHTML = CATEGORIES.map((c) => `
    <section class="menu-cat" id="${slug(c)}" aria-labelledby="h-${slug(c)}">
      <h2 id="h-${slug(c)}" class="display menu-cat-title" data-rise>${esc(c)}</h2>
      <ul class="menu-list">${SERVICES.filter((s) => s.cat === c).map((s) => `
        <li class="menu-row" data-photo="${s.photo}">
          <img class="menu-thumb" src="${img(s.photo, 640)}" alt="" loading="lazy">
          <div class="menu-name"><h3>${esc(s.name)}</h3><p>${esc(s.note)}</p></div>
          <span class="menu-dur"><svg aria-hidden="true"><use href="#i-clock"/></svg>${mins(s.dur)}</span>
          <span class="menu-price">${s.from ? '<small>from</small> ' : ''}${rs(s.price)}</span>
          <a class="menu-book" href="/book?service=${s.id}" aria-label="Book ${esc(s.name)}">Book <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
        </li>`).join('')}
      </ul>
    </section>`).join('');

  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    e.preventDefault();
    scrollToEl(q(a.getAttribute('href')), -100);
  });

  /* ---------- the floating photo ---------- */
  const float = q('[data-float]');
  const fimg = float.querySelector('img');
  let off = () => {};
  if (FINE && !REDUCED) {
    const x = gsap.quickTo(float, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(float, 'y', { duration: 0.6, ease: 'power3.out' });
    const rot = gsap.quickTo(float, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const tilt = gsap.quickTo(float, 'rotationZ', { duration: 0.8, ease: 'power3.out' });
    let lastX = 0, current = '';
    const onMove = (e) => {
      const row = e.target.closest?.('.menu-row');
      if (!row) { float.classList.remove('is-on'); current = ''; return; }
      if (row.dataset.photo !== current) {
        current = row.dataset.photo;
        fimg.src = img(current, 640);
        gsap.fromTo(fimg, { scale: 1.15 }, { scale: 1, duration: 0.9, ease: 'expo.out' });
      }
      float.classList.add('is-on');
      // sit to the right of the cursor, or the left near the right edge
      const side = e.clientX > innerWidth * 0.62 ? -300 : 40;
      x(e.clientX + side);
      y(e.clientY - 150);
      const vx = e.clientX - lastX;
      lastX = e.clientX;
      rot(Math.max(-18, Math.min(18, vx * 1.2)));
      tilt(Math.max(-6, Math.min(6, vx * 0.4)));
    };
    const onLeave = () => { float.classList.remove('is-on'); current = ''; };
    root.addEventListener('pointermove', onMove);
    q('[data-menu]').addEventListener('pointerleave', onLeave);
    off = () => root.removeEventListener('pointermove', onMove);
  }

  return () => off();
}
