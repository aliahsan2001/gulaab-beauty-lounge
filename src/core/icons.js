/* Fine-line icon sprite, injected once outside the page container. */

const P = {
  arrow: ['M4 12h16M14 6l6 6-6 6'],
  back: ['M20 12H4M10 6l-6 6 6 6'],
  close: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  phone: ['M5 3h3.5l1.7 4.4-2.3 1.4a11 11 0 0 0 7.3 7.3l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'],
  wa: ['M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z', 'M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a5 5 0 0 1-2.9-2.9l1-1-1-2-1.6 1z'],
  pin: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16M8 3v4M16 3v4'],
  insta: ['M4 4h16v16H4z', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M17 7.2v.1'],
  petal: ['M12 3c5 3 6 10 0 18C6 13 7 6 12 3z', 'M12 7v10'],
  rose: ['M12 13c-3 0-5-2-5-5 2 0 3 1 3 1s0-3 2-4c2 1 2 4 2 4s1-1 3-1c0 3-2 5-5 5z', 'M12 13v8M12 17c-2 0-3-1-4-2M12 18c2 0 3-1 4-2'],
  ring: ['M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M12 4v2M12 18v2M4 12h2M18 12h2'],
  spiral: ['M12 12m-1 0a1 1 0 1 0 2 0 3 3 0 1 0-6 0 5 5 0 1 0 10 0 7 7 0 1 0-14 0'],
  scissors: ['M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M8.1 7.6L20 18M8.1 16.4L20 6'],
  sparkle: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z'],
  heart: ['M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
  download: ['M12 4v11M7 10l5 5 5-5M5 20h14'],
};

export function injectIcons() {
  if (document.getElementById('i-arrow')) return;
  const symbols = Object.entries(P).map(([n, ds]) =>
    `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`);
}
