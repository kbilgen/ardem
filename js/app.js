// ARDEM — application shell: routing, scroll choreography, view mounting.
import * as V from './views.js?v=20261121d';
import { byId, COLLECTIONS, SIGNATURE_VARIANTS } from './data.js?v=20261121d';
import { initNav, initCursor, initMagnetic, initReservation, mountAppointment, reducedMotion, toast } from './ui.js?v=20261121d';
import { clamp, smooth, lerp } from './math.js?v=20261121d';

const view = document.getElementById('view');
const curtain = document.querySelector('.curtain');
const nav = initNav();
initCursor();
initMagnetic();
initReservation();

const hasGL = (() => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
})();
document.documentElement.classList.toggle('no-gl', !hasGL);
document.documentElement.classList.toggle('reduced', reducedMotion());

/* ---------- scroll engine ---------- */
const scrollFns = new Set();
const onScroll = (fn) => { scrollFns.add(fn); return () => scrollFns.delete(fn); };
let navSections = [];
function tick() {
  const y = scrollY, vh = innerHeight;
  for (const fn of scrollFns) fn(y, vh);
  // nav theme from the section under the bar
  let theme = 'light';
  for (const s of navSections) {
    const r = s.getBoundingClientRect();
    if (r.top <= 36 && r.bottom > 36) { theme = s.dataset.navLive || s.dataset.nav; break; }
  }
  nav.setTheme(theme);
  nav.setScrolled(y > 40);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const progressOf = (el, vh) => {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - vh));
};

/* ---------- reveal on view ---------- */
function observeReveals(root) {
  const items = root.querySelectorAll('[data-reveal], .ch__title, .pcard, .page-head__title');
  if (reducedMotion()) { items.forEach((i) => i.classList.add('is-in')); return () => {}; }
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  items.forEach((i) => io.observe(i));
  return () => io.disconnect();
}

function parallax(root) {
  if (reducedMotion()) return () => {};
  const els = [...root.querySelectorAll('[data-parallax]')];
  return onScroll((y, vh) => {
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const k = parseFloat(el.dataset.parallax);
      const c = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty('--py', `${(-c * k * 100).toFixed(2)}px`);
    }
  });
}

/* ---------- radiogroups (roving tabindex) ---------- */
function radiogroup(group, onChange) {
  const opts = [...group.querySelectorAll('[role=radio]')];
  const select = (el, focus) => {
    opts.forEach((o) => { const on = o === el; o.setAttribute('aria-checked', String(on)); o.tabIndex = on ? 0 : -1; });
    if (focus) el.focus();
    onChange(el.dataset.variant, el);
  };
  group.addEventListener('click', (e) => { const o = e.target.closest('[role=radio]'); if (o) select(o); });
  group.addEventListener('keydown', (e) => {
    const i = opts.indexOf(document.activeElement);
    if (i < 0) return;
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (dir) { e.preventDefault(); select(opts[(i + dir + opts.length) % opts.length], true); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select(opts[i]); }
  });
}

/* ---------- lazy 3D ---------- */
let viewerMod = null;
const loadViewer = () => (viewerMod ||= import('./viewer.js?v=20261121d'));

/* ---------- HOME ---------- */
async function mountHome(root) {
  const cleanups = [];
  const rm = reducedMotion();

  // hero
  const hero = root.querySelector('[data-hero]');
  const sticky = hero.querySelector('.hero__sticky');
  const caps = [...hero.querySelectorAll('.hero__cap')];
  const reveal = hero.querySelector('[data-hero-reveal]');
  const cue = hero.querySelector('[data-hero-cue]');
  const capWin = [[0.0, 0.055], [0.24, 0.37], [0.47, 0.64], [0.78, 0.89]];
  const onyx = [22, 18, 15], ivory = [244, 239, 228];
  let hp = rm ? 1 : 0;
  const paint = (s) => {
    const m = s.reveal;
    sticky.style.backgroundColor = `rgb(${onyx.map((v, i) => Math.round(v + (ivory[i] - v) * m)).join(',')})`;
    sticky.style.setProperty('--rv', m.toFixed(3));
    hero.dataset.navLive = m > 0.55 ? 'light' : 'dark';
    caps.forEach((c, i) => {
      const [a, b] = capWin[i];
      const o = rm ? 0 : (i === 0 ? s.appear : smooth(a, a + 0.03, s.p)) * (1 - smooth(b - 0.03, b, s.p));
      c.style.opacity = o.toFixed(3);
      c.style.transform = `translateY(${((1 - o) * 10).toFixed(1)}px)`;
    });
    reveal.style.opacity = m.toFixed(3);
    reveal.style.transform = `translateY(${((1 - m) * 28).toFixed(1)}px)`;
    reveal.style.visibility = m < 0.02 ? 'hidden' : 'visible';
    hero.classList.toggle('is-revealed', m > 0.6);
    cue.style.opacity = (s.appear * (1 - smooth(0.0, 0.06, s.p))).toFixed(3);
  };
  if (hasGL) {
    const { Hero } = await import('./hero.js?v=20261121d');
    const h = new Hero(hero.querySelector('.hero__gl'), { onFrame: paint });
    if (rm) { h.setProgress(1); h.p = 1; }
    const io = new IntersectionObserver((es) => (es[0].isIntersecting ? h.start() : h.stop()));
    io.observe(hero);
    cleanups.push(() => { io.disconnect(); h.stop(); h.r.gl.getExtension('WEBGL_lose_context')?.loseContext(); });
    cleanups.push(onScroll((y, vh) => { if (!rm) h.setProgress(progressOf(hero, vh)); }));
    const pm = (e) => h.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    addEventListener('pointermove', pm, { passive: true });
    cleanups.push(() => removeEventListener('pointermove', pm));
  } else {
    hero.classList.add('is-static');
    paint({ p: 1, reveal: 1, appear: 0 });
  }
  hero.querySelector('[data-hero-skip]').addEventListener('click', () => {
    const end = hero.offsetTop + hero.offsetHeight - innerHeight;
    scrollTo({ top: end, behavior: rm ? 'auto' : 'smooth' });
  });

  // origin thread drawing
  const thread = root.querySelector('.thread');
  const origin = root.querySelector('.ch--origin');
  const paths = [...thread.querySelectorAll('path')];
  paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.dataset.len = L; });
  cleanups.push(onScroll((y, vh) => {
    const r = origin.getBoundingClientRect();
    const k = rm ? 1 : clamp((vh - r.top) / (r.height + vh * 0.2));
    paths.forEach((p) => (p.style.strokeDashoffset = (p.dataset.len * (1 - k)).toFixed(1)));
  }));

  // horizontal process track
  const hs = root.querySelector('[data-hscroll]');
  const track = hs.querySelector('.hs__track');
  const bar = hs.querySelector('.hs__progress i');
  const wide = matchMedia('(min-width: 900px)');
  const layoutHs = () => {
    if (wide.matches && !rm) {
      hs.classList.add('is-pinned');
      const over = track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft || 0);
      hs.style.height = `${innerHeight + Math.max(0, over)}px`;
      hs.dataset.over = Math.max(0, over);
    } else {
      hs.style.height = '';
      hs.classList.remove('is-pinned');
      track.style.transform = '';
      hs.dataset.over = 0;
    }
  };
  layoutHs();
  addEventListener('resize', layoutHs);
  cleanups.push(() => removeEventListener('resize', layoutHs));
  const imgs = [...track.querySelectorAll('.hs__img')];
  cleanups.push(onScroll((y, vh) => {
    const over = +hs.dataset.over;
    if (!over) return;
    const p = progressOf(hs, vh);
    track.style.transform = `translate3d(${(-p * over).toFixed(1)}px,0,0)`;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    imgs.forEach((im, i) => {
      const r = im.parentElement.getBoundingClientRect();
      const c = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
      im.style.transform = `translate3d(${(c * -60).toFixed(1)}px,0,0) scale(1.12)`;
    });
  }));

  // signature selector
  const sig = root.querySelector('[data-sig]');
  const detail = sig.querySelector('[data-sig-detail]');
  const sigReserve = sig.querySelector('[data-sig-reserve]');
  let sigViewer = null;
  const product = byId('eternal-solitaire');
  if (hasGL) {
    loadViewer().then(({ Showcase }) => {
      if (!root.isConnected) return;
      sigViewer = new Showcase(sig.querySelector('.sig__gl'), {
        product, variant: 'champagne', envMix: 0.8, spin: 0.22, glints: 1, fitAspect: 0.85,
        view: { rot: [0.36, 0.5, 0], cam: { pos: [0, 0.9, 6.0], target: [0, 0.38, 0], fov: 0.5 } },
        onDragStart: () => sig.classList.add('was-dragged'),
      });
      cleanups.push(() => sigViewer.dispose());
    });
  } else {
    sig.querySelector('.sig__stage').insertAdjacentHTML('beforeend', V.img('p-eternal-solitaire-champagne', 'Eternal Solitaire in champagne gold', { cls: 'sig__fallback' }));
  }
  radiogroup(sig.querySelector('.sig__options'), (key) => {
    const v = SIGNATURE_VARIANTS.find((x) => x.key === key);
    detail.textContent = v.detail;
    sig.style.setProperty('--tint', v.tint);
    sigReserve.dataset.variant = key;
    if (sigViewer) sigViewer.setVariant(key);
    const fb = sig.querySelector('.sig__fallback');
    if (fb) fb.src = `img/p-eternal-solitaire-${key}.webp`;
  });

  // finale
  const finale = root.querySelector('.ch--finale');
  if (hasGL) {
    loadViewer().then(({ Showcase }) => {
      if (!root.isConnected) return;
      const fv = new Showcase(finale.querySelector('.finale__gl'), {
        product, variant: 'champagne', envMix: 0, envRot: 2.2, spin: 0.16, glints: 1.3, fitAspect: 1.1,
        view: matchMedia('(min-width: 900px)').matches
          ? { rot: [0.4, 0.3, 0], cam: { pos: [-1.45, 0.9, 8.4], target: [-1.45, 0.3, 0], fov: 0.5 } }
          : { rot: [0.4, 0.3, 0], cam: { pos: [0, 0.9, 7.4], target: [0, 0.35, 0], fov: 0.5 } },
      });
      cleanups.push(() => fv.dispose());
    });
  } else {
    finale.insertAdjacentHTML('afterbegin', V.img('p-eternal-solitaire-alt', 'Eternal Solitaire on black', { cls: 'finale__fallback' }));
  }

  cleanups.push(parallax(root));
  return () => cleanups.forEach((c) => c());
}

/* ---------- PRODUCT ---------- */
function mountPiece(root) {
  const art = root.querySelector('[data-piece]');
  const p = byId(art.dataset.piece);
  const main = art.querySelector('[data-main]');
  const canvas = art.querySelector('.piece__gl');
  const tag = art.querySelector('[data-photo-tag]');
  const vname = art.querySelector('[data-vname]');
  const vnote = art.querySelector('[data-vnote]');
  const reserve = art.querySelector('[data-piece-reserve]');
  const tabs = [...art.querySelectorAll('[data-mode]')];
  const thumbs = [...art.querySelectorAll('[data-thumb]')];
  let viewer = null;
  let current = p.variants[0].key;
  if (!hasGL) tabs[1].hidden = true;

  const showImage = (name, alt, photo) => {
    main.src = `img/${name}.webp`;
    main.alt = alt;
    tag.hidden = !photo;
    thumbs.forEach((t) => t.classList.toggle('is-active', t.dataset.thumb === name));
  };
  const setMode = async (mode) => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
    const is3d = mode === '3d';
    canvas.hidden = !is3d;
    main.hidden = is3d;
    art.classList.toggle('is-3d', is3d);
    if (is3d) {
      tag.hidden = true;
      if (!viewer) {
        const { Showcase } = await loadViewer();
        viewer = new Showcase(canvas, { product: p, variant: current, envMix: 0.85, glints: p.signature ? 1 : 0, shadow: p.category === 'rings', fitAspect: 1.25 });
      }
    } else {
      const v = p.variants.find((x) => x.key === current);
      tag.hidden = !v.photo;
    }
  };
  tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));
  thumbs.forEach((t) => t.addEventListener('click', () => {
    setMode('image');
    showImage(t.dataset.thumb, t.dataset.alt, t.dataset.photo === '1');
  }));
  const group = art.querySelector('.piece__options');
  radiogroup(group, (key) => {
    current = key;
    const v = p.variants.find((x) => x.key === key);
    vname.textContent = v.label;
    if (vnote) vnote.textContent = v.note;
    reserve.dataset.variant = key;
    if (viewer) viewer.setVariant(key);
    if (!art.classList.contains('is-3d')) showImage(v.img, `${p.name} in ${v.label}${v.photo ? ', photographed' : ''}`, v.photo);
  });
  return () => viewer?.dispose();
}

/* ---------- router ---------- */
const ROUTES = {
  home: () => ({ html: V.home(), mount: mountHome, title: 'ARDEM — Crafted to Become Eternal' }),
  collections: () => ({ html: V.collections(), title: 'Collections — ARDEM' }),
  'our-story': () => ({ html: V.story(), title: 'Our story — ARDEM' }),
  craftsmanship: () => ({ html: V.craft(), title: 'Craftsmanship — ARDEM' }),
  appointment: () => ({ html: V.appointment(), mount: (r) => mountAppointment(r), title: 'Private appointment — ARDEM' }),
};
COLLECTIONS.forEach((c) => (ROUTES[c.id] = () => ({ html: V.category(c.id), title: `${c.name} — ARDEM` })));

function resolve(hash) {
  const h = (hash || '').replace(/^#/, '') || 'home';
  if (ROUTES[h]) return { name: h, ...ROUTES[h]() };
  if (h.startsWith('piece-') && byId(h.slice(6))) {
    const p = byId(h.slice(6));
    return { name: h, html: V.piece(p.id), mount: mountPiece, title: `${p.name} — ARDEM` };
  }
  return { name: 'notfound', html: V.notFound(), title: 'Not found — ARDEM' };
}

let cleanup = null;
let current = null;
let pendingScroll = null;
async function go(hash, { initial = false } = {}) {
  const route = resolve(hash);
  if (current === route.name && !initial) return;
  const animate = !initial && !reducedMotion();
  if (animate) {
    curtain.classList.add('is-in');
    await new Promise((r) => setTimeout(r, 520));
  }
  cleanup?.();
  cleanup = null;
  view.innerHTML = route.html;
  document.title = route.title;
  current = route.name;
  nav.setActive(route.name);
  nav.close();
  scrollTo(0, 0);
  navSections = [...document.querySelectorAll('[data-nav]')].filter((n) => !n.classList.contains('nav'));
  const unReveal = observeReveals(view);
  const unPar = route.mount === mountHome ? () => {} : parallax(view);
  const m = route.mount ? await route.mount(view) : null;
  cleanup = () => { unReveal(); unPar(); if (typeof m === 'function') m(); };
  if (pendingScroll) {
    const el = document.getElementById(pendingScroll);
    pendingScroll = null;
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'auto' }), 60);
  }
  if (animate) {
    requestAnimationFrame(() => curtain.classList.remove('is-in'));
  }
  if (!initial) document.getElementById('main').focus({ preventScroll: true });
}

addEventListener('hashchange', () => go(location.hash));
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  if (a.matches('[data-skip]')) {
    e.preventDefault();
    document.getElementById('main').focus();
    return;
  }
  if (a.dataset.scrollTo) pendingScroll = a.dataset.scrollTo;
  const target = a.getAttribute('href');
  if (target === (location.hash || '#home') || (target === '#home' && !location.hash)) {
    e.preventDefault();
    if (pendingScroll) {
      document.getElementById(pendingScroll)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
      pendingScroll = null;
    } else scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    nav.close();
  }
});

go(location.hash, { initial: true });
window.ARDEM = { go, toast };
