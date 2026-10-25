/* Book now: three steps, and each one opens a ring of petals: service, then stylist, then time.
   When all three are chosen the rose blooms fully and a summary card shows duration and price.
   Confirming gives a reference, a calendar file and a ready-written WhatsApp message. */

import { SERVICES, STYLISTS, CATEGORIES, CONFIG, rs, mins } from '../data.js';
import { esc, idle, waLink } from '../core/ui.js';
import { LITE, REDUCED } from '../core/env.js';
import { gsap } from '../core/motion.js';
import { mountSvgRose } from '../core/svgrose.js';

const BLOOM = [0.05, 0.37, 0.69, 1];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 1000) / 1000; };
const hhmm = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')} ${m >= 720 ? 'pm' : 'am'}`;

export async function mount(root) {
  const cleanups = [];
  const q = (s) => root.querySelector(s);
  const form = q('[data-book]');
  const state = { service: null, stylist: null, day: null, time: null };
  const params = new URLSearchParams(location.search);

  /* ---------- the rose ---------- */
  let rose = null;
  const stage = q('[data-rose-stage]');
  if (!LITE) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountRose } = await import('../three/rose.js');
        if (!root.isConnected) return;
        rose = mountRose(q('[data-rose]'), { dark: true, simple: innerWidth < 760, bloom: BLOOM[done()], distance: 6.4, lookY: -0.75 });
        cleanups.push(() => rose.dispose());
      } catch (err) {
        console.warn('3D rose unavailable, drawing it instead', err);
        stage.classList.add('is-flat');
        rose = mountSvgRose(q('[data-rose-svg]'), { bloom: BLOOM[done()] });
      }
    });
  } else rose = mountSvgRose(q('[data-rose-svg]'), { bloom: BLOOM[0] });

  const done = () => (state.service ? 1 : 0) + (state.stylist ? 1 : 0) + (state.time != null ? 1 : 0);

  /* ---------- steps ---------- */
  const steps = [...root.querySelectorAll('.step')];
  function open(n) {
    steps.forEach((s, i) => {
      s.classList.toggle('is-active', i === n);
      s.querySelector('.step-head').setAttribute('aria-expanded', String(i === n));
    });
    const body = steps[n].querySelector('.step-body');
    if (!REDUCED) gsap.fromTo(body, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, clearProps: 'all' });
  }
  form.addEventListener('click', (e) => {
    const h = e.target.closest('[data-open-step]');
    if (h && !h.disabled) open(Number(h.dataset.openStep));
  });

  function refresh() {
    const n = done();
    rose?.setBloom(BLOOM[n]);
    root.querySelectorAll('[data-rings] li').forEach((li, i) => li.classList.toggle('is-open', i < n));
    steps[1].querySelector('.step-head').disabled = !state.service;
    steps[2].querySelector('.step-head').disabled = !state.stylist;
    steps.forEach((s, i) => s.classList.toggle('is-done', [state.service, state.stylist, state.time != null ? 1 : null][i] != null));
    const svc = state.service && SERVICES.find((s) => s.id === state.service);
    const sty = state.stylist && (state.stylist === 'any' ? { name: 'First available' } : STYLISTS.find((s) => s.id === state.stylist));
    q('[data-pick="0"]').textContent = svc ? `${svc.name} · ${mins(svc.dur)} · ${rs(svc.price)}` : 'What would you like done?';
    q('[data-pick="1"]').textContent = sty ? sty.name : 'Or the first one free';
    q('[data-pick="2"]').textContent = state.time != null ? `${dayLabel(state.day)}, ${hhmm(state.time)}` : "We're open Tuesday to Sunday";
    steps.forEach((s, i) => (s.querySelector('.step-edit').textContent = s.classList.contains('is-done') && !s.classList.contains('is-active') ? 'Change' : ''));
    const summary = q('[data-summary]');
    const all = n === 3;
    q('[data-contact]').hidden = !all;
    q('[data-confirm]').hidden = !all;
    summary.classList.toggle('is-on', all);
    if (all) {
      const end = state.time + svc.dur;
      summary.innerHTML = `
        <p class="label">In full bloom</p>
        <h2 class="display">${esc(svc.name)}</h2>
        <dl>
          <div><dt>With</dt><dd>${esc(sty.name)}</dd></div>
          <div><dt>When</dt><dd>${esc(dayLabel(state.day))}, ${hhmm(state.time)}</dd></div>
          <div><dt>Duration</dt><dd>${mins(svc.dur)}, until ${hhmm(end)}</dd></div>
          <div class="sum-total"><dt>Price</dt><dd>${svc.from ? 'from ' : ''}${rs(svc.price)}</dd></div>
        </dl>`;
    }
  }

  /* step 1: service */
  let cat = (SERVICES.find((s) => s.id === params.get('service')) || {}).cat || CATEGORIES[0];
  const cats = q('[data-svc-cats]');
  cats.innerHTML = CATEGORIES.map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join('');
  function drawServices() {
    q('[data-svc-list]').innerHTML = SERVICES.filter((s) => s.cat === cat).map((s) => `
      <label class="opt"><input type="radio" name="service" value="${s.id}" ${state.service === s.id ? 'checked' : ''}><b>${esc(s.name)}</b><small>${mins(s.dur)} · ${esc(s.note)}</small><span class="opt-price">${s.from ? 'from ' : ''}${rs(s.price)}</span></label>`).join('');
  }
  cats.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    cat = b.dataset.cat;
    cats.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    drawServices();
  });
  q('[data-svc-list]').addEventListener('change', (e) => {
    state.service = e.target.value;
    // a different service can change who's suitable and how long the slot needs to be
    const svc = SERVICES.find((s) => s.id === state.service);
    if (state.stylist && state.stylist !== 'any' && !STYLISTS.find((s) => s.id === state.stylist).cats.includes(svc.cat)) state.stylist = null;
    state.time = null;
    drawStylists(); drawSlots(); refresh();
    setTimeout(() => open(1), 250);
  });

  /* step 2: stylist */
  function drawStylists() {
    const svc = state.service && SERVICES.find((s) => s.id === state.service);
    const list = STYLISTS.filter((s) => !svc || s.cats.includes(svc.cat));
    q('[data-sty-list]').innerHTML = [{ id: 'any', name: 'First available', role: 'Whoever is free first', tone: '#f2c4cd' }, ...list].map((s) => `
      <label class="opt sty"><input type="radio" name="stylist" value="${s.id}" ${state.stylist === s.id ? 'checked' : ''}>
        <span class="avatar" style="--tone:${s.tone}">${s.id === 'any' ? '<svg aria-hidden="true" style="width:22px;height:22px"><use href="#i-sparkle"/></svg>' : esc(s.name.split(' ').map((w) => w[0]).join(''))}</span>
        <b>${esc(s.name)}</b><small>${esc(s.role)}${s.years ? ` · ${s.years} yrs` : ''}</small></label>`).join('');
  }
  q('[data-sty-list]').addEventListener('change', (e) => {
    state.stylist = e.target.value;
    state.time = null;
    drawSlots(); refresh();
    setTimeout(() => open(2), 250);
  });

  /* step 3: day and time */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = [];
  for (let d = 0; days.length < 14; d++) {
    const dt = new Date(today); dt.setDate(today.getDate() + d);
    if (dt.getDay() !== CONFIG.closedDay) days.push(dt);
  }
  const dayKey = (dt) => dt.toISOString().slice(0, 10);
  const dayLabel = (k) => { const dt = days.find((x) => dayKey(x) === k) || today; return `${DAYS[dt.getDay()]} ${dt.getDate()} ${MONTHS[dt.getMonth()]}`; };
  state.day = dayKey(days[0]);
  q('[data-dates]').innerHTML = days.map((dt, i) => `<button type="button" class="date" data-day="${dayKey(dt)}" aria-pressed="${i === 0}" aria-label="${DAYS[dt.getDay()]} ${dt.getDate()} ${MONTHS[dt.getMonth()]}"><small>${i === 0 ? 'Today' : DAYS[dt.getDay()]}</small><b>${dt.getDate()}</b><small>${MONTHS[dt.getMonth()]}</small></button>`).join('');
  q('[data-dates]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (!b) return;
    state.day = b.dataset.day;
    state.time = null;
    q('[data-dates]').querySelectorAll('[data-day]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    drawSlots(); refresh();
  });
  function drawSlots() {
    const svc = state.service && SERVICES.find((s) => s.id === state.service);
    const dur = svc ? svc.dur : 30;
    const isToday = state.day === dayKey(today);
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    let html = '';
    for (let m = CONFIG.open * 60; m + dur <= CONFIG.close * 60; m += 30) {
      const taken = hash(`${state.day}${m}${state.stylist}`) < 0.32 || (isToday && m < nowM + 60);
      html += `<button type="button" class="slot" data-time="${m}" ${taken ? 'disabled aria-label="' + hhmm(m) + ', taken"' : ''} aria-pressed="${state.time === m}">${hhmm(m)}</button>`;
    }
    q('[data-slots]').innerHTML = html || '<p>No times left today. Try tomorrow.</p>';
  }
  q('[data-slots]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-time]');
    if (!b || b.disabled) return;
    state.time = Number(b.dataset.time);
    q('[data-slots]').querySelectorAll('[data-time]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    refresh();
    setTimeout(() => q('#b-name').focus({ preventScroll: true }), 300);
  });

  /* ---------- confirm ---------- */
  const RULES = {
    name: (v) => (v.trim().length < 2 ? 'Please add your name.' : ''),
    phone: (v) => (/^(\+?92|0)3\d{2}[\s-]?\d{7}$/.test(v.trim()) ? '' : 'Try a mobile like 03xx xxxxxxx.'),
  };
  const check = (n) => {
    const el = form.elements[n], msg = RULES[n](el.value);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) el.setAttribute('aria-describedby', `e-${n}`); else el.removeAttribute('aria-describedby');
    q(`#e-${n}`).textContent = msg;
    return msg;
  };
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') check(e.target.name); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (done() < 3) return;
    const bad = Object.keys(RULES).filter((n) => check(n));
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    const svc = SERVICES.find((s) => s.id === state.service);
    const sty = state.stylist === 'any' ? { name: 'the first available stylist' } : STYLISTS.find((s) => s.id === state.stylist);
    const name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim();
    const ref = 'GB-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const when = `${dayLabel(state.day)}, ${hhmm(state.time)}`;
    const msg = [`Booking ${ref} at ${CONFIG.name}`, `${svc.name} (${mins(svc.dur)}, ${svc.from ? 'from ' : ''}${rs(svc.price)})`, `With ${sty.name}`, `On ${when}`, `Name: ${name}`, `Mobile: ${phone}`].join('\n');
    const [y, mo, d] = state.day.split('-').map(Number);
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = (m) => `${y}${pad(mo)}${pad(d)}T${pad(Math.floor(m / 60))}${pad(m % 60)}00`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gulaab Beauty Lounge//Booking//EN', 'BEGIN:VEVENT', `UID:${ref}@gulaab.example`, `DTSTART;TZID=Asia/Karachi:${stamp(state.time)}`, `DTEND;TZID=Asia/Karachi:${stamp(state.time + svc.dur)}`,
      `SUMMARY:${svc.name} at Gulaab Beauty Lounge`, `LOCATION:${CONFIG.address}`, `DESCRIPTION:Booking ${ref} with ${sty.name}.`, 'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Your Gulaab appointment is in 2 hours', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const icsUrl = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    cleanups.push(() => URL.revokeObjectURL(icsUrl));
    const out = q('[data-done]');
    out.innerHTML = `
      <p class="label">Booked · <span class="ref">${ref}</span></p>
      <h2 class="display">See you soon, <em>${esc(name.split(' ')[0])}.</em></h2>
      <p>${esc(svc.name)} with ${esc(sty.name)} on ${esc(when)}. We'll message you the day before. If plans change, you can reschedule free up to 6 hours before.</p>
      <div class="confirm-actions">
        <a class="btn btn-rose" href="${waLink(msg)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Send to the front desk</a>
        <a class="btn btn-line" href="${icsUrl}" download="gulaab-${ref}.ics"><svg aria-hidden="true"><use href="#i-calendar"/></svg>Add to calendar</a>
      </div>
      <p class="label">A concept site: nothing was sent and no slot was held.</p>`;
    form.hidden = true;
    out.hidden = false;
    out.focus();
    if (!REDUCED) gsap.from(out.children, { y: 16, opacity: 0, duration: 0.8, stagger: 0.07, clearProps: 'all' });
  });

  /* ---------- go ---------- */
  drawServices(); drawStylists(); drawSlots();
  const pre = SERVICES.find((s) => s.id === params.get('service'));
  if (pre) {
    state.service = pre.id;
    drawServices(); drawStylists(); drawSlots();
    refresh();
    open(1);
  } else refresh();

  return () => cleanups.forEach((fn) => fn());
}
