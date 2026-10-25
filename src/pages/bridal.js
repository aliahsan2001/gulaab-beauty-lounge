/* Bridal: three packages arrive as a fanned hand of 3D cards. Pick two and they flip side by side
   to compare, with the inclusions the other doesn't have marked. CSS transitions do the motion. */

import { BRIDAL, BRIDAL_ROWS, rs } from '../data.js';
import { esc } from '../core/ui.js';
import { REDUCED } from '../core/env.js';

export async function mount(root) {
  const q = (s) => root.querySelector(s);
  const hand = q('[data-hand]');
  hand.innerHTML = BRIDAL.map((p, i) => `
    <article class="bcard${p.popular ? ' is-popular' : ''}" data-id="${p.id}" style="--i:${i}">
      <div class="bcard-inner">
        <div class="bcard-face bcard-front">
          ${p.popular ? '<span class="bcard-tag">Most chosen</span>' : ''}
          <p class="label">${esc(p.meaning)}</p>
          <h2 class="display">${esc(p.name)}</h2>
          <p class="bcard-price">${rs(p.price)}</p>
          <p class="bcard-for">${esc(p.for)}</p>
          <p class="bcard-lead">${esc(p.lead)}</p>
          <span class="bcard-num" aria-hidden="true">${['I', 'II', 'III'][i]}</span>
          <label class="bcard-pick"><input type="checkbox" value="${p.id}"><span>Compare</span></label>
        </div>
        <div class="bcard-face bcard-back">
          <p class="label">${esc(p.name)} · ${esc(p.meaning)}</p>
          <p class="bcard-price">${rs(p.price)}</p>
          <ul class="bcard-list" data-list="${p.id}"></ul>
          <a class="btn btn-rose btn-sm" href="/book?service=bridal-consult&package=${p.id}">Book a consultation</a>
        </div>
      </div>
    </article>`).join('');
  const cards = [...hand.children];
  const hint = q('[data-hand-hint]');
  const back = q('[data-hand-back]');
  let picked = [];

  function lists(a, b) {
    cards.forEach((c) => {
      const p = BRIDAL.find((x) => x.id === c.dataset.id);
      const other = BRIDAL.find((x) => x.id === (c.dataset.id === a ? b : a));
      const theirs = new Map(other ? other.includes : []);
      c.querySelector('[data-list]').innerHTML = p.includes.map(([key, text]) => {
        // gold: missing from the other package, or more of it (3 events vs 1)
        const extra = other && (!theirs.has(key) || theirs.get(key) !== text && p.price > other.price);
        return `<li class="${extra ? 'is-extra' : ''}"><svg aria-hidden="true"><use href="#i-check"/></svg><span>${esc(text)}${extra ? ' <em>only here</em>' : ''}</span></li>`;
      }).join('');
    });
  }
  lists();

  function layout() {
    const compare = picked.length === 2;
    hand.classList.toggle('is-compare', compare);
    cards.forEach((c) => {
      const id = c.dataset.id;
      const k = picked.indexOf(id);
      c.classList.toggle('is-picked', k >= 0);
      c.classList.toggle('is-away', compare && k < 0);
      c.classList.toggle('is-flipped', compare && k >= 0);
      c.style.setProperty('--slot', compare && k >= 0 ? (k === 0 ? -1 : 1) : 0);
      c.querySelector('input').checked = k >= 0;
    });
    // in compare mode, the earlier package always sits on the left
    if (compare) {
      const [a, b] = [...picked].sort((x, y) => BRIDAL.findIndex((p) => p.id === x) - BRIDAL.findIndex((p) => p.id === y));
      cards.forEach((c) => { const id = c.dataset.id; if (id === a) c.style.setProperty('--slot', -1); if (id === b) c.style.setProperty('--slot', 1); });
      lists(a, b);
      hint.innerHTML = `Comparing <b>${esc(BRIDAL.find((p) => p.id === a).name)}</b> and <b>${esc(BRIDAL.find((p) => p.id === b).name)}</b>. Gold marks what only one includes, or more of it.`;
    } else {
      lists();
      hint.innerHTML = picked.length === 1 ? `Now pick one more to compare with <b>${esc(BRIDAL.find((p) => p.id === picked[0]).name)}</b>` : 'Tap <b>Compare</b> on two packages';
    }
    back.hidden = !compare;
  }

  hand.addEventListener('change', (e) => {
    const id = e.target.value;
    if (e.target.checked) { picked.push(id); if (picked.length > 2) picked.shift(); }
    else picked = picked.filter((x) => x !== id);
    layout();
  });
  back.addEventListener('click', () => { picked = []; layout(); });
  // the hand fans out on arrival
  if (!REDUCED) { hand.classList.add('is-stacked'); setTimeout(() => hand.classList.remove('is-stacked'), 120); }

  /* ---------- the full comparison table ---------- */
  q('[data-cmp]').insertAdjacentHTML('beforeend', `
    <thead><tr><th scope="col"><span class="sr-only">Detail</span></th>${BRIDAL.map((p) => `<th scope="col"><span class="display">${esc(p.name)}</span><small>${rs(p.price)}</small></th>`).join('')}</tr></thead>
    <tbody>${BRIDAL_ROWS.map(([label, fn]) => `<tr><th scope="row">${esc(label)}</th>${BRIDAL.map((p) => `<td>${esc(fn(p))}</td>`).join('')}</tr>`).join('')}</tbody>`);

  layout();
  return () => {};
}
