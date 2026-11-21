// ARDEM — interface behaviours: navigation, menu, cursor, magnetic buttons, reservation modal, forms.
import { PRODUCTS, byId, RING_SIZES } from './data.js?v=20261121d';
import { submitRequest } from './store.js?v=20261121d';
import { esc } from './views.js?v=20261121d';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- nav theme + menu ---------- */
export function initNav() {
  const nav = document.querySelector('.nav');
  const menu = document.getElementById('menu');
  const toggle = document.querySelector('[data-menu-toggle]');
  let open = false;
  let lastFocus = null;
  const setOpen = (v) => {
    open = v;
    toggle.setAttribute('aria-expanded', String(v));
    toggle.querySelector('.nav__menu-label').textContent = v ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', v);
    if (v) {
      lastFocus = document.activeElement;
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      menu.querySelector('a')?.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (!open) menu.hidden = true; }, reducedMotion() ? 0 : 500);
      lastFocus?.focus?.({ preventScroll: true });
    }
  };
  toggle.addEventListener('click', () => setOpen(!open));
  menu.addEventListener('click', (e) => { if (e.target.closest('a,[data-reserve]')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
  // trap focus inside the menu (menu + toggle)
  document.addEventListener('keydown', (e) => {
    if (!open || e.key !== 'Tab') return;
    const items = [toggle, ...menu.querySelectorAll('a,button')];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { items[items.length - 1].focus(); e.preventDefault(); }
    else if (!e.shiftKey && i === items.length - 1) { items[0].focus(); e.preventDefault(); }
  });
  return {
    close: () => open && setOpen(false),
    setTheme(theme) {
      if (nav.dataset.theme !== theme) nav.dataset.theme = theme;
    },
    setScrolled(v) { nav.classList.toggle('is-scrolled', v); },
    setActive(route) {
      nav.querySelectorAll('[data-nav-link]').forEach((a) => {
        const on = route === a.dataset.navLink || (a.dataset.navLink === 'collections' && /^(rings|necklaces|earrings|bracelets|piece-)/.test(route));
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    },
  };
}

/* ---------- custom cursor ---------- */
export function initCursor() {
  const el = document.querySelector('.cursor');
  if (!finePointer() || reducedMotion()) { el.remove(); return; }
  document.documentElement.classList.add('has-cursor');
  const ring = el.querySelector('.cursor__ring');
  const dot = el.querySelector('.cursor__dot');
  const label = el.querySelector('.cursor__label');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  let shown = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; el.classList.add('is-on'); rx = x; ry = y; }
    const t = e.target;
    const drag = t.closest?.('canvas[tabindex]');
    const hot = t.closest?.('a,button,select,label,summary,input,textarea,[role=radio]');
    el.classList.toggle('is-hot', !!hot && !drag);
    el.classList.toggle('is-drag', !!drag);
    label.textContent = drag ? 'Drag' : '';
  }, { passive: true });
  document.addEventListener('pointerleave', () => { shown = false; el.classList.remove('is-on'); });
  const loop = () => {
    rx += (x - rx) * 0.2;
    ry += (y - ry) * 0.2;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- magnetic buttons ---------- */
export function initMagnetic() {
  if (!finePointer() || reducedMotion()) return;
  let active = null;
  addEventListener('pointermove', (e) => {
    const m = e.target.closest?.('.magnetic');
    if (active && active !== m) {
      active.style.transform = '';
      active.firstElementChild && (active.firstElementChild.style.transform = '');
      active = null;
    }
    if (!m) return;
    active = m;
    const b = m.getBoundingClientRect();
    const dx = (e.clientX - (b.left + b.width / 2)) / b.width;
    const dy = (e.clientY - (b.top + b.height / 2)) / b.height;
    m.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
    if (m.firstElementChild) m.firstElementChild.style.transform = `translate(${dx * 5}px, ${dy * 4}px)`;
  }, { passive: true });
}

/* ---------- toast ---------- */
export function toast(msg) {
  const t = document.querySelector('.toast');
  t.textContent = msg;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add('is-on'));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.classList.remove('is-on'); setTimeout(() => (t.hidden = true), 400); }, 3600);
}

/* ---------- validation ---------- */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function validate(form, rules) {
  const errors = [];
  for (const [name, check] of Object.entries(rules)) {
    const input = form.elements[name];
    const el = input instanceof RadioNodeList ? input[0] : input;
    const msg = check(input);
    const errEl = form.querySelector(`#${el.getAttribute('aria-describedby') || ''}`);
    if (msg) {
      errors.push({ el, msg });
      el.setAttribute('aria-invalid', 'true');
      if (errEl) errEl.textContent = msg;
    } else {
      el.removeAttribute('aria-invalid');
      if (errEl) errEl.textContent = '';
    }
  }
  const summary = form.querySelector('[data-error-summary]');
  if (errors.length) {
    summary.hidden = false;
    summary.innerHTML = `<p>${errors.length === 1 ? 'One detail needs your attention.' : `${errors.length} details need your attention.`}</p><ul>${errors.map((e) => `<li><a href="#${e.el.id}" data-focus="${e.el.id}">${esc(e.msg)}</a></li>`).join('')}</ul>`;
    errors[0].el.focus();
  } else {
    summary.hidden = true;
    summary.innerHTML = '';
  }
  return errors.length === 0;
}
export const rules = {
  name: (i) => (i.value.trim().length < 2 ? 'Enter your full name.' : ''),
  email: (i) => (!EMAIL.test(i.value.trim()) ? 'Enter a valid email address, like name@example.com.' : ''),
  phone: (required) => (i) => {
    const digits = i.value.replace(/\D/g, '');
    if (!i.value.trim()) return required ? 'Add a phone number so an advisor can call you.' : '';
    return digits.length < 7 ? 'Enter a phone number with at least 7 digits.' : '';
  },
  consent: (i) => (!i.checked ? 'Confirm that we may contact you about this request.' : ''),
  date: (i) => (!i.value ? 'Choose a preferred date.' : i.value < i.min ? 'Choose a date from today onward.' : ''),
};
export function wireErrorLinks(root) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-focus]');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.focus)?.focus();
  });
}

/* ---------- reservation modal ---------- */
export function initReservation() {
  const modal = document.getElementById('reserve');
  const panel = modal.querySelector('.modal__panel');
  const form = modal.querySelector('[data-res-form]');
  const success = modal.querySelector('[data-res-success]');
  const selPiece = form.querySelector('[data-res-piece]');
  const selVar = form.querySelector('[data-res-variant]');
  const sizeField = form.querySelector('[data-size-field]');
  const sizeSel = form.querySelector('#res-size');
  const media = modal.querySelector('[data-res-img]');
  const submit = form.querySelector('[data-res-submit]');
  let lastFocus = null;

  selPiece.innerHTML = ['rings', 'necklaces', 'earrings', 'bracelets']
    .map((c) => `<optgroup label="${c[0].toUpperCase() + c.slice(1)}">${PRODUCTS.filter((p) => p.category === c).map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</optgroup>`)
    .join('');
  sizeSel.insertAdjacentHTML('beforeend', RING_SIZES.map((s) => `<option value="${s}">EU ${s}</option>`).join(''));

  const syncPiece = (variantKey) => {
    const p = byId(selPiece.value);
    selVar.innerHTML = p.variants.map((v) => `<option value="${v.key}">${esc(v.label)}</option>`).join('');
    if (variantKey && p.variants.some((v) => v.key === variantKey)) selVar.value = variantKey;
    sizeField.hidden = p.category !== 'rings';
    syncImage();
  };
  const syncImage = () => {
    const p = byId(selPiece.value);
    const v = p.variants.find((x) => x.key === selVar.value) || p.variants[0];
    media.src = `img/${v.img}.webp`;
    media.alt = '';
  };
  selPiece.addEventListener('change', () => syncPiece());
  selVar.addEventListener('change', syncImage);
  form.addEventListener('change', (e) => {
    if (e.target.name === 'contact') {
      form.querySelector('[data-phone-opt]').textContent = e.target.value === 'phone' ? 'required' : 'optional';
    }
  });
  wireErrorLinks(form);

  const open = (productId = 'eternal-solitaire', variant) => {
    lastFocus = document.activeElement;
    form.hidden = false;
    success.hidden = true;
    selPiece.value = byId(productId) ? productId : 'eternal-solitaire';
    syncPiece(variant);
    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    setTimeout(() => form.querySelector('#res-name').focus({ preventScroll: true }), reducedMotion() ? 0 : 350);
  };
  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(() => { modal.hidden = true; }, reducedMotion() ? 0 : 450);
    lastFocus?.focus?.({ preventScroll: true });
  };

  document.addEventListener('click', (e) => {
    const trig = e.target.closest('[data-reserve]');
    if (trig) {
      e.preventDefault();
      open(trig.dataset.product, trig.dataset.variant);
      return;
    }
    if (!modal.hidden && e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [...panel.querySelectorAll('button,select,input,textarea,a[href]')].filter((n) => !n.closest('[hidden]') && !n.disabled);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && i === f.length - 1) { f[0].focus(); e.preventDefault(); }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const byPhone = form.elements.contact.value === 'phone';
    const ok = validate(form, { name: rules.name, email: rules.email, phone: rules.phone(byPhone), consent: rules.consent });
    if (!ok) return;
    const p = byId(selPiece.value);
    const v = p.variants.find((x) => x.key === selVar.value);
    const data = {
      piece: p.id, pieceName: p.name, variant: v.key, variantLabel: v.label,
      size: p.category === 'rings' ? form.elements.size.value || 'not sure' : '',
      name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(), contact: form.elements.contact.value,
      notes: form.elements.notes.value.trim(),
    };
    submit.disabled = true;
    submit.classList.add('is-busy');
    submit.firstElementChild.textContent = 'Reserving…';
    const res = await submitRequest('reservations', data);
    submit.disabled = false;
    submit.classList.remove('is-busy');
    submit.firstElementChild.textContent = 'Reserve piece';
    success.querySelector('[data-success-ref]').textContent = res.ref;
    success.querySelector('[data-success-summary]').innerHTML = `
      <div><dt>Piece</dt><dd>${esc(p.name)}</dd></div>
      <div><dt>${p.signature ? 'Expression' : 'Metal'}</dt><dd>${esc(v.label)}</dd></div>
      ${data.size ? `<div><dt>Ring size</dt><dd>${data.size === 'not sure' ? 'To be measured' : 'EU ' + esc(data.size)}</dd></div>` : ''}
      <div><dt>Contact</dt><dd>${esc(data.contact === 'phone' ? data.phone : data.email)}</dd></div>`;
    success.querySelector('[data-success-title]').textContent = res.mode === 'db' ? 'Reservation received' : 'Reservation saved';
    success.querySelector('[data-success-note]').textContent =
      res.mode === 'db'
        ? `An advisor will reply to ${data.email} to confirm availability, sizing and next steps.`
        : 'Preview mode: this request is saved in this browser only, because no reservation service is connected to this page yet.';
    form.hidden = true;
    success.hidden = false;
    success.focus();
    form.reset();
  });

  return { open, close };
}

/* ---------- appointment form ---------- */
export function mountAppointment(root) {
  const form = root.querySelector('[data-appt-form]');
  if (!form) return;
  const success = root.querySelector('[data-appt-success]');
  wireErrorLinks(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = validate(form, { name: rules.name, email: rules.email, phone: rules.phone(false), date: rules.date, consent: rules.consent });
    if (!ok) return;
    const f = form.elements;
    const data = {
      format: f.format.value, name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
      interest: f.interest.value, date: f.date.value, time: f.time.value, message: f.message.value.trim(),
    };
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.firstElementChild.textContent = 'Sending request…';
    const res = await submitRequest('appointments', data);
    const when = new Date(data.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    success.innerHTML = `
      <svg class="success__mono" aria-hidden="true"><use href="#monogram"/></svg>
      <h2 class="modal__title">${res.mode === 'db' ? 'Appointment requested' : 'Appointment request saved'}</h2>
      <p class="success__ref">Reference <strong>${res.ref}</strong></p>
      <dl class="success__summary">
        <div><dt>Format</dt><dd>${data.format === 'video' ? 'By video' : 'In person'}</dd></div>
        <div><dt>Preferred</dt><dd>${esc(when)}, ${esc(data.time.toLowerCase())}</dd></div>
        <div><dt>Contact</dt><dd>${esc(data.email)}</dd></div>
      </dl>
      <p class="success__note">${res.mode === 'db' ? `We'll write to ${esc(data.email)} to confirm a time.` : 'Preview mode: this request is saved in this browser only, because no booking service is connected to this page yet.'}</p>
      <a class="btn btn--dark" href="#collections"><span>Explore the collections</span></a>`;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
}
