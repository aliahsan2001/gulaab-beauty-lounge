/* Gulaab Beauty Lounge — app shell.
   Header, footer, the cursor shimmer and the petal drift persist; Barba swaps the page
   container underneath and each page module mounts and cleans up its own scene. */

import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/flows.css';

import barba from '@barba/core';
import { LITE } from './core/env.js';
import { injectIcons } from './core/icons.js';
import { gsap, ScrollTrigger, initSmoothScroll, resetScroll, reveals, counters, lockScroll, scrollToEl } from './core/motion.js';
import { cover, reveal } from './core/transition.js';
import { riseHeadings, sharpen } from './core/effects.js';
import { initShimmer } from './core/shimmer.js';
import { loosePetals } from './core/petals.js';
import { waLink } from './core/ui.js';
import { CONFIG } from './data.js';

const pages = {
  home: () => import('./pages/home.js'),
  services: () => import('./pages/services.js'),
  bridal: () => import('./pages/bridal.js'),
  gallery: () => import('./pages/gallery.js'),
  book: () => import('./pages/book.js'),
  404: () => import('./pages/notfound.js'),
};

let current = { ctx: null, cleanup: null };

function setActiveNav(ns) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.dataset.nav === ns) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.querySelector('[data-nav-book]')?.toggleAttribute('hidden', ns === 'book');
}

function wireWhatsApp(root) {
  root.querySelectorAll('[data-wa-chat]').forEach((a) => (a.href = waLink(`Hello ${CONFIG.name}, I'd like to ask about an appointment.`)));
}

async function mount(container) {
  if (!container) throw new Error('page container missing');
  const ns = container.dataset.barbaNamespace;
  setActiveNav(ns);
  wireWhatsApp(container);
  let cleanup = null;
  const ctx = gsap.context(() => {}, container);
  if (pages[ns]) {
    const mod = await pages[ns]();
    cleanup = await mod.mount(container, ctx);
  }
  // shared effects run after the page has rendered its dynamic content
  ctx.add(() => {
    reveals(container);
    counters(container);
    riseHeadings(container);
    sharpen(container);
    loosePetals(container);
  });
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    syncHeaderTone();
    const target = location.hash && container.querySelector(location.hash);
    if (target) setTimeout(() => scrollToEl(target, -100), 300);
  });
  current = { ctx, cleanup };
}

// the header turns light whenever it sits over an evening (dark) section
let darkZones = [];
function syncHeaderTone() {
  darkZones = [...document.querySelectorAll('[data-barba="container"] [data-dark], .site-footer')];
  const hr = document.querySelector('[data-header]')?.getBoundingClientRect();
  const y = hr ? hr.top + hr.height / 2 : 40; // the header's own middle, wherever it sits
  const over = darkZones.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  document.documentElement.classList.toggle('hdr-dark', over);
}
addEventListener('scroll', () => requestAnimationFrame(syncHeaderTone), { passive: true });
addEventListener('resize', syncHeaderTone);

function unmount() {
  try { current.cleanup?.(); } catch (err) { console.error('[gulaab] cleanup failed', err); }
  current.ctx?.revert();
  current = { ctx: null, cleanup: null };
}

function syncHead(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  document.title = doc.title;
  const desc = doc.querySelector('meta[name="description"]')?.content;
  if (desc) document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
}

function initNav() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const header = document.querySelector('[data-header]');
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('nav-open', open);
    lockScroll(open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  document.querySelector('[data-mobile-nav]').addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.documentElement.classList.contains('nav-open')) setOpen(false); });
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => document.documentElement.classList.contains('nav-open') && setOpen(false);
}

/* ---------- boot ---------- */
injectIcons();
initSmoothScroll();
initShimmer();
const closeNav = initNav();
wireWhatsApp(document);
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
document.documentElement.classList.add('js');
loosePetals(document, '.site-footer[data-petals]'); // the footer persists across pages
if (LITE) console.info('Gulaab: lite mode (lighter scenes, same content). Add ?full to force 3D.');

barba.init({
  preventRunning: true,
  timeout: 10000,
  // a slow or failed fetch of the next page: go there the ordinary way instead
  requestError: (trigger, action, url) => { if (action === 'click') location.href = url; return false; },
  prevent: ({ el }) => el.hasAttribute('data-no-barba'),
  transitions: [{
    name: 'petals',
    once: ({ next }) => mount(next.container),
    async leave() {
      closeNav();
      await cover();
    },
    afterLeave: () => unmount(),
    enter({ next }) {
      syncHead(next.html);
      resetScroll();
    },
    async after({ next }) {
      try {
        await mount(next.container);
      } catch (err) {
        console.error('[gulaab] page mount failed, reloading', err);
        location.href = next.url.href;
        return;
      }
      syncHeaderTone();
      // the new page rises gently into place as the veil lifts
      const c = next.container;
      gsap.fromTo(c, { y: 36, opacity: 0.4 }, { y: 0, opacity: 1, duration: 1.3, ease: 'expo.out', clearProps: 'transform,opacity' });
      setTimeout(() => gsap.set(c, { clearProps: 'transform,opacity' }), 1700);
      await reveal();
    },
  }],
});
