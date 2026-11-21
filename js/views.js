// ARDEM — page templates. Each view renders HTML; app.js mounts behaviour.
import { PRODUCTS, COLLECTIONS, SIGNATURE_VARIANTS, PROCESS, MARQUEE, byId, inCategory } from './data.js?v=20261121d';

const DIM = { p: [960, 1200], c: [960, 1200], m: [1280, 960], photo: [1024, 1024], crop: [900, 900], f: [1120, 1120], origin: [960, 1200], wide: [1600, 900] };
export function img(name, alt, { cls = '', eager = false, sizes = '' } = {}) {
  const key = name.startsWith('origin-thread') ? 'wide' : name.split('-')[0];
  const [w, h] = DIM[key] || [960, 1200];
  return `<img src="img/${name}.webp" alt="${esc(alt)}" width="${w}" height="${h}"${cls ? ` class="${cls}"` : ''} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${sizes ? ` sizes="${sizes}"` : ''}>`;
}
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const chapterHead = (n, name, title, lead = '', cls = '') => `
  <header class="ch__head ${cls}">
    <p class="ch__num"><span>Chapter ${n}</span><span class="ch__name">${name}</span></p>
    <h2 class="ch__title" data-split>${title}</h2>
    ${lead ? `<p class="ch__lead">${lead}</p>` : ''}
  </header>`;

const swatches = (p) => `<ul class="swatches" aria-label="Available in">${p.variants
  .map((v) => `<li><span class="sw" style="background:${v.swatch}" title="${esc(v.label)}"></span><span class="sr-only">${esc(v.label)}</span></li>`)
  .join('')}</ul>`;

export const productCard = (p, i = 0) => {
  const main = p.variants[0];
  const alt = p.gallery[0];
  return `
  <a class="pcard" href="#piece-${p.id}" style="--i:${i}">
    <figure class="pcard__media">
      ${img(main.img, `${p.name} in ${main.label}${main.photo ? ', photographed' : ''}`, { cls: 'pcard__img' })}
      ${alt ? img(alt.img, '', { cls: 'pcard__alt' }) : ''}
      ${main.photo ? '<span class="tag">Photographed</span>' : ''}
    </figure>
    <div class="pcard__meta">
      <h3 class="pcard__name">${esc(p.name)}</h3>
      <p class="pcard__line">${esc(p.line)}</p>
      <div class="pcard__foot">${swatches(p)}<span class="pcard__price">Price on request</span></div>
    </div>
  </a>`;
};

/* ---------------- HOME ---------------- */
export function home() {
  const sig = byId('eternal-solitaire');
  const first = SIGNATURE_VARIANTS[0];
  const marqueeItems = (hidden) => MARQUEE.map((m) => `<span class="marquee__item">${m}</span><svg class="marquee__sep" aria-hidden="true"><use href="#monogram"/></svg>`).join('');
  return `
  <section class="hero" data-nav="dark" data-hero aria-label="Introduction">
    <div class="hero__sticky">
      <canvas class="hero__gl" aria-hidden="true"></canvas>
      <div class="hero__caps" aria-hidden="true">
        <p class="hero__cap">It begins in the crucible.</p>
        <p class="hero__cap">Poured into a single line of light.</p>
        <p class="hero__cap">Turned, patiently, into form.</p>
        <p class="hero__cap">Then set with a stone that holds the light.</p>
      </div>
      <div class="hero__reveal" data-hero-reveal>
        <p class="hero__word" aria-hidden="true">ARDEM</p>
        <h1 class="hero__title">Some Things Are Made to Last Forever.</h1>
        <p class="hero__tag">Crafted to Become Eternal.</p>
        <div class="hero__ctas">
          <a class="btn btn--dark magnetic" href="#collections"><span>Explore the Collection</span></a>
          <a class="btn btn--line magnetic" href="#our-story"><span>Discover Our Story</span></a>
        </div>
      </div>
      <div class="hero__cue" data-hero-cue aria-hidden="true"><span>Scroll to begin</span><i></i></div>
      <button class="hero__skip" type="button" data-hero-skip>Skip intro</button>
    </div>
  </section>

  <section class="ch ch--origin" data-nav="dark" aria-labelledby="ch1">
    <svg class="thread" viewBox="0 0 400 1200" preserveAspectRatio="none" aria-hidden="true">
      <path class="thread__glow" d="M210 0 C 140 160, 330 260, 250 420 S 90 640, 200 780 S 330 1010, 230 1200"/>
      <path class="thread__line" d="M210 0 C 140 160, 330 260, 250 420 S 90 640, 200 780 S 330 1010, 230 1200"/>
    </svg>
    <div class="wrap origin">
      <div class="origin__copy">
        ${chapterHead('01', 'The Origin', 'Every Masterpiece Begins With a Spark.', 'Before there is a ring, there is heat and light: gold melted in the crucible and poured in a single glowing line, then drawn into a thread as fine as a line of ink. Everything ARDEM makes begins in that moment.').replace('class="ch__title"', 'class="ch__title" id="ch1"')}
        <p class="origin__note">From that thread comes every curve of the house: the twist of the Thread Band, the line of a rivière, the claws that hold a stone up to the light.</p>
      </div>
      <figure class="origin__fig" data-parallax="0.12">
        ${img('origin-pour', 'Molten gold pouring from a dark crucible in a single glowing stream')}
        <figcaption class="label"><span>The first pour</span><span>Molten gold leaving the crucible</span></figcaption>
      </figure>
    </div>
    <figure class="origin__wide" data-parallax="-0.06">
      ${img('origin-thread', 'The poured gold drawn out into a glowing thread, floating through darkness')}
    </figure>
  </section>

  <section class="ch ch--craft" data-nav="light" data-hscroll aria-labelledby="ch2">
    <div class="hs__sticky">
      ${chapterHead('02', 'The Art of Creation', 'The Beauty Is in Every Detail.', 'Four stages, each slow by design. Scroll to move through the making of the signature.', 'ch__head--row').replace('class="ch__title"', 'class="ch__title" id="ch2"')}
      <ol class="hs__track">
        ${PROCESS.map((s, i) => `
        <li class="hs__panel">
          <figure class="hs__media">${img(s.img, s.alt, { cls: 'hs__img' })}${s.photo ? '<span class="tag">Photographed</span>' : ''}</figure>
          <div class="hs__label"><span class="hs__n">${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></div>
        </li>`).join('')}
      </ol>
      <div class="hs__progress" aria-hidden="true"><i></i></div>
    </div>
  </section>

  <section class="ch ch--sig" data-nav="light" style="--tint:${first.tint}" data-sig aria-labelledby="ch3">
    <div class="wrap sig">
      <div class="sig__stage">
        <canvas class="sig__gl" tabindex="0" role="img" aria-label="Eternal Solitaire in 3D. Drag, or use the arrow keys, to rotate."></canvas>
        <p class="sig__hint" aria-hidden="true">Drag to turn the ring</p>
      </div>
      <div class="sig__panel">
        ${chapterHead('03', 'The Signature Collection', 'One Design. Endless Expressions.').replace('class="ch__title"', 'class="ch__title" id="ch3"')}
        <p class="sig__product"><span>${sig.name}</span> ${esc(sig.line)}</p>
        <div class="sig__options" role="radiogroup" aria-label="Choose an expression">
          ${SIGNATURE_VARIANTS.map((v, i) => `
          <button class="opt" type="button" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-variant="${v.key}">
            <span class="sw sw--lg" style="background:${v.swatch}"></span>
            <span class="opt__name">${v.label}</span>
            <span class="opt__note">${v.note}</span>
          </button>`).join('')}
        </div>
        <p class="sig__detail" aria-live="polite" data-sig-detail>${first.detail}</p>
        <div class="sig__ctas">
          <button class="btn btn--ruby magnetic" type="button" data-reserve data-product="eternal-solitaire" data-variant="champagne" data-sig-reserve><span>Reserve this piece</span></button>
          <a class="btn btn--line magnetic" href="#piece-eternal-solitaire"><span>View the piece</span></a>
        </div>
      </div>
    </div>
  </section>

  <section class="ch ch--collections" data-nav="light" aria-labelledby="ch4">
    <div class="wrap">
      ${chapterHead('04', 'The Collections', 'Discover Your Expression.', 'Four collections, each curated piece by piece. Choose where to begin.').replace('class="ch__title"', 'class="ch__title" id="ch4"')}
      <div class="cards">
        ${COLLECTIONS.map((c, i) => `
        <a class="card card--${i + 1}" href="#${c.id}" data-reveal>
          <figure class="card__media">${img(c.cover, c.coverAlt, { cls: 'card__img' })}</figure>
          <div class="card__meta">
            <h3 class="card__name">${c.name}</h3>
            <p class="card__intro">${c.intro}</p>
            <span class="card__count">${inCategory(c.id).length} pieces</span>
          </div>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <div class="marquee" data-nav="dark" role="region" aria-label="ARDEM principles">
    <div class="marquee__track">
      <div class="marquee__group">${marqueeItems()}</div>
      <div class="marquee__group" aria-hidden="true">${marqueeItems(true)}</div>
    </div>
  </div>

  <section class="ch ch--phil" data-nav="light" aria-labelledby="ch5">
    <div class="wrap phil">
      <figure class="phil__img" data-parallax="0.08">
        ${img('photo-verdant', 'Verdant Halo ring resting on champagne satin, photographed')}
        <figcaption class="label"><span>Verdant Halo</span><span>Photographed</span></figcaption>
      </figure>
      <div class="phil__text">
        ${chapterHead('05', 'The ARDEM Philosophy', 'Beyond Jewelry. A Personal Legacy.').replace('class="ch__title"', 'class="ch__title" id="ch5"')}
        <blockquote class="phil__quote"><p>Jewelry is one of the few things made to outlast its first owner. We design with that in mind.</p></blockquote>
        <dl class="phil__list">
          <div><dt>Timeless design</dt><dd>We design away from trends. Proportion, balance and restraint decide whether a piece will still feel right in forty years.</dd></div>
          <div><dt>Individuality</dt><dd>The same design can say very different things. Metal, stone and setting are chosen with you, so the piece becomes yours.</dd></div>
          <div><dt>Meaningful moments</dt><dd>A promise, an anniversary, a first success. We make pieces for the moments people want to hold on to, and for those they pass them to.</dd></div>
        </dl>
        <a class="textlink" href="#our-story">Read our story</a>
      </div>
      <figure class="phil__detail" data-parallax="-0.1">${img('crop-sparkle', 'Close-up of a round brilliant catching the light, photographed')}</figure>
    </div>
  </section>

  <section class="ch ch--finale" data-nav="dark" aria-labelledby="ch6">
    <canvas class="finale__gl" tabindex="0" role="img" aria-label="The Eternal Solitaire turning slowly under studio light. Drag to rotate."></canvas>
    <div class="finale__copy">
      ${chapterHead('06', 'Your ARDEM Moment', 'A Piece of Forever, Just for You.', 'Reserve the Eternal Solitaire in the expression that feels like yours, or begin with the full collection.').replace('class="ch__title"', 'class="ch__title" id="ch6"')}
      <div class="finale__ctas">
        <a class="btn btn--light magnetic" href="#collections"><span>Discover the Collection</span></a>
        <button class="btn btn--ruby magnetic" type="button" data-reserve data-product="eternal-solitaire"><span>Reserve Your Piece</span></button>
      </div>
    </div>
  </section>`;
}

/* ---------------- COLLECTIONS ---------------- */
const pageHead = (crumbs, title, lead, extra = '') => `
  <header class="page-head" data-nav="light">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">ARDEM</a>${crumbs.map((c) => c.href ? `<a href="${c.href}">${c.label}</a>` : `<span aria-current="page">${c.label}</span>`).join('')}</nav>
      <h1 class="page-head__title">${title}</h1>
      ${lead ? `<p class="page-head__lead">${lead}</p>` : ''}
      ${extra}
    </div>
  </header>`;

export function collections() {
  const sig = byId('eternal-solitaire');
  return `
  ${pageHead([{ label: 'Collections' }], 'The Collections', 'Rings, necklaces, earrings and bracelets, curated piece by piece. Every design can be explored in 3D and reserved online.')}
  <section class="feature" data-nav="dark">
    <div class="wrap feature__grid">
      <figure class="feature__media">${img('p-eternal-solitaire-alt', 'Eternal Solitaire in champagne gold on black')}</figure>
      <div class="feature__copy">
        <p class="kicker">The signature</p>
        <h2 class="feature__title">${sig.name}</h2>
        <p>${sig.story}</p>
        <div class="feature__ctas">
          <a class="btn btn--light magnetic" href="#piece-eternal-solitaire"><span>View the piece</span></a>
          <button class="btn btn--ruby magnetic" type="button" data-reserve data-product="eternal-solitaire"><span>Reserve</span></button>
        </div>
      </div>
    </div>
  </section>
  ${COLLECTIONS.map((c) => `
  <section class="coll-row" data-nav="light" aria-labelledby="row-${c.id}">
    <div class="wrap">
      <div class="coll-row__head">
        <h2 id="row-${c.id}" class="coll-row__title">${c.name}</h2>
        <p>${c.intro}</p>
        <a class="textlink" href="#${c.id}">View all ${c.name.toLowerCase()}</a>
      </div>
      <div class="grid grid--3">${inCategory(c.id).slice(0, 3).map(productCard).join('')}</div>
    </div>
  </section>`).join('')}`;
}

export function category(id) {
  const c = COLLECTIONS.find((x) => x.id === id);
  const items = inCategory(id);
  const others = COLLECTIONS.filter((x) => x.id !== id);
  return `
  ${pageHead([{ label: 'Collections', href: '#collections' }, { label: c.name }], c.name, c.intro, `<p class="page-head__count">${items.length} pieces</p>`)}
  <section class="cat" data-nav="light">
    <div class="wrap">
      <div class="grid grid--3">${items.map(productCard).join('')}</div>
    </div>
  </section>
  <section class="cat-next" data-nav="light">
    <div class="wrap">
      <h2 class="cat-next__title">Continue exploring</h2>
      <div class="cat-next__links">${others.map((o) => `<a href="#${o.id}" class="cat-next__link"><span>${o.name}</span><span class="cat-next__count">${inCategory(o.id).length} pieces</span></a>`).join('')}</div>
    </div>
  </section>`;
}

/* ---------------- PRODUCT ---------------- */
export function piece(id) {
  const p = byId(id);
  const c = COLLECTIONS.find((x) => x.id === p.category);
  const v0 = p.variants[0];
  const thumbs = [...p.variants.map((v) => ({ img: v.img, alt: `${p.name} in ${v.label}`, photo: v.photo, variant: v.key })), ...p.gallery];
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);
  return `
  <article class="piece" data-nav="light" data-piece="${p.id}">
    <div class="wrap piece__grid">
      <div class="piece__gallery">
        <div class="piece__stage">
          <img class="piece__main" src="img/${v0.img}.webp" alt="${esc(`${p.name} in ${v0.label}${v0.photo ? ', photographed' : ''}`)}" width="960" height="1200" data-main fetchpriority="high">
          <canvas class="piece__gl" tabindex="0" role="img" aria-label="${esc(p.name)} in 3D. Drag, or use the arrow keys, to rotate." hidden></canvas>
          <span class="tag" data-photo-tag ${v0.photo ? '' : 'hidden'}>Photographed</span>
          <div class="piece__modes" role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected="true" data-mode="image">Image</button>
            <button type="button" role="tab" aria-selected="false" data-mode="3d">3D view</button>
          </div>
        </div>
        <ul class="piece__thumbs" aria-label="More images">
          ${thumbs.map((t, i) => `<li><button type="button" class="thumb${i === 0 ? ' is-active' : ''}" data-thumb="${t.img}" data-photo="${t.photo ? 1 : 0}" data-alt="${esc(t.alt)}" aria-label="Show image: ${esc(t.alt)}"><img src="img/${t.img}.webp" alt="" width="96" height="120" loading="lazy"></button></li>`).join('')}
        </ul>
      </div>
      <div class="piece__info">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">ARDEM</a><a href="#collections">Collections</a><a href="#${c.id}">${c.name}</a></nav>
        ${p.signature ? '<p class="kicker">The signature</p>' : ''}
        <h1 class="piece__name">${esc(p.name)}</h1>
        <p class="piece__line">${esc(p.line)}</p>
        <p class="piece__price">Price on request</p>
        <div class="piece__variants">
          <p class="piece__vlabel" id="vlabel">${p.signature ? 'Expression' : 'Metal'}: <strong data-vname>${esc(v0.label)}</strong></p>
          <div class="piece__options" role="radiogroup" aria-labelledby="vlabel">
            ${p.variants.map((v, i) => `<button type="button" class="swbtn" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-variant="${v.key}" aria-label="${esc(v.label)}"><span class="sw sw--lg" style="background:${v.swatch}"></span></button>`).join('')}
          </div>
          ${p.signature ? `<p class="piece__vnote" data-vnote>${esc(v0.note)}</p>` : ''}
        </div>
        <div class="piece__ctas">
          <button class="btn btn--ruby magnetic" type="button" data-reserve data-product="${p.id}" data-variant="${v0.key}" data-piece-reserve><span>Reserve this piece</span></button>
          <a class="btn btn--line magnetic" href="#appointment"><span>Book a private appointment</span></a>
        </div>
        <p class="piece__story">${esc(p.story)}</p>
        <div class="acc">
          <details open><summary>The design</summary><ul>${p.design.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></details>
          <details><summary>Stones, materials and sizing</summary><p>Stone details, metal and sizing are confirmed with you in writing before anything is made or reserved. Ask your advisor for any documentation available for the stones in your piece.</p></details>
          <details><summary>Care</summary><p>Store each piece separately in its pouch, clean gently with warm water and a soft brush, and have claws and settings checked from time to time.</p></details>
        </div>
      </div>
    </div>
  </article>
  ${related.length ? `
  <section class="related" data-nav="light" aria-labelledby="related-title">
    <div class="wrap">
      <h2 class="related__title" id="related-title">More ${c.name.toLowerCase()}</h2>
      <div class="grid grid--3">${related.map(productCard).join('')}</div>
    </div>
  </section>` : ''}`;
}

/* ---------------- STORY ---------------- */
export function story() {
  return `
  ${pageHead([{ label: 'Our story' }], 'Beyond Jewelry. A Personal Legacy.', 'ARDEM makes jewelry for the moments people keep. A piece worth wearing every day should still feel right decades from now.')}
  <section class="story" data-nav="light">
    <div class="wrap story__grid">
      <figure class="story__img">${img('origin-pour', 'Molten gold pouring from a crucible')}</figure>
      <div class="story__text">
        <h2>The thread</h2>
        <p>Every ARDEM piece begins with the same image: gold poured from the crucible in a single line, then drawn into a thread. Something molten and fleeting, given form through patience, becoming something lasting.</p>
        <p>That thread runs through everything we design. It is the twist of the Thread Band, the unbroken line of a rivière, the slender claws that raise a stone toward the light.</p>
      </div>
    </div>
  </section>
  <section class="principles" data-nav="dark">
    <div class="wrap">
      <h2 class="principles__title">What we hold to</h2>
      <ol class="principles__list">
        <li><h3>Timeless design</h3><p>We design away from trends. Proportion, balance and restraint decide whether a piece will still feel right in forty years.</p></li>
        <li><h3>Individuality</h3><p>The same design can say very different things. Metal, stone and setting are chosen with you, so the piece becomes yours rather than a copy.</p></li>
        <li><h3>Meaningful moments</h3><p>Engagements, anniversaries, a first success, a quiet promise. We make pieces for the moments people want to hold on to.</p></li>
      </ol>
    </div>
  </section>
  <section class="story story--alt" data-nav="light">
    <div class="wrap story__grid story__grid--rev">
      <figure class="story__img">${img('photo-verdant', 'Verdant Halo ring on champagne satin, photographed')}<figcaption class="label"><span>Verdant Halo</span><span>Photographed</span></figcaption></figure>
      <div class="story__text">
        <h2>A personal legacy</h2>
        <p>Jewelry is one of the few things made to outlast its first owner. We design with that in mind: settings that hold securely, proportions that can be worn every day, finishes that can be restored rather than replaced.</p>
        <p>What a piece comes to mean is yours to decide. Our part is to make something worthy of it.</p>
        <a class="btn btn--dark magnetic" href="#appointment"><span>Book a private appointment</span></a>
      </div>
    </div>
  </section>`;
}

/* ---------------- CRAFT ---------------- */
export function craft() {
  return `
  ${pageHead([{ label: 'Craftsmanship' }], 'The Beauty Is in Every Detail.', 'How an ARDEM piece is made, from the first form to the final inspection, and how to care for it once it is yours.')}
  <section class="process" data-nav="light">
    <div class="wrap">
      <ol class="process__list">
        ${PROCESS.map((s, i) => `
        <li class="process__step${i % 2 ? ' process__step--rev' : ''}">
          <figure class="process__img">${img(s.img, s.alt)}${s.photo ? '<span class="tag">Photographed</span>' : ''}</figure>
          <div class="process__text"><span class="process__n">Stage ${i + 1}</span><h2>${s.title}</h2><p>${s.text}</p></div>
        </li>`).join('')}
      </ol>
    </div>
  </section>
  <section class="materials" data-nav="dark">
    <div class="wrap materials__grid">
      <div>
        <h2 class="materials__title">Gold, in four tones</h2>
        <p>Pure gold is soft, so it is alloyed with other metals for strength. The alloy also sets the colour: warmer yellow and champagne tones, rose tones from a higher share of copper, and white gold, which is typically given a bright white finish.</p>
        <p class="fine">The exact metal of your piece is confirmed in writing at your consultation.</p>
      </div>
      <ul class="tones">
        ${[['Champagne gold', 'champagne'], ['Rose gold', 'rose'], ['White gold', 'white'], ['Yellow gold', 'yellow']].map(([n, k]) => `<li><span class="tones__sw tones__sw--${k}"></span>${n}</li>`).join('')}
      </ul>
    </div>
  </section>
  <section class="care" data-nav="light" id="care" aria-labelledby="care-title">
    <div class="wrap care__grid">
      <h2 id="care-title" class="care__title">Caring for your jewelry</h2>
      <dl class="care__list">
        <div><dt>Store</dt><dd>Keep each piece in its own pouch or compartment so stones cannot scratch metal or each other.</dd></div>
        <div><dt>Clean</dt><dd>Warm water, a drop of mild soap and a soft brush. Rinse, then dry with a lint-free cloth.</dd></div>
        <div><dt>Wear</dt><dd>Put jewelry on last, after creams and perfume, and take rings off for sport, gardening or heavy work.</dd></div>
        <div><dt>Check</dt><dd>Claws and settings wear gently over the years. Have them checked periodically, especially on rings worn every day.</dd></div>
      </dl>
    </div>
  </section>`;
}

/* ---------------- APPOINTMENT ---------------- */
export function appointment() {
  const today = new Date().toISOString().slice(0, 10);
  return `
  ${pageHead([{ label: 'Private appointment' }], 'Private appointment', 'Meet an advisor in person or by video to view pieces, try variants, discuss sizing and plan something made for you.')}
  <section class="appt" data-nav="light">
    <div class="wrap appt__grid">
      <form class="form appt__form" novalidate data-appt-form>
        <div class="form__error-summary" role="alert" aria-live="assertive" data-error-summary hidden></div>
        <fieldset class="field field--choice">
          <legend>Format</legend>
          <div class="choice-row">
            <label class="choice"><input type="radio" name="format" value="in-person" checked><span>In person</span></label>
            <label class="choice"><input type="radio" name="format" value="video"><span>By video</span></label>
          </div>
        </fieldset>
        <div class="form__row form__row--2">
          <div class="field"><label for="ap-name">Full name</label><input id="ap-name" name="name" autocomplete="name" required aria-describedby="ap-name-err"><p class="field__err" id="ap-name-err"></p></div>
          <div class="field"><label for="ap-email">Email</label><input id="ap-email" name="email" type="email" autocomplete="email" required aria-describedby="ap-email-err"><p class="field__err" id="ap-email-err"></p></div>
        </div>
        <div class="form__row form__row--2">
          <div class="field"><label for="ap-phone">Phone <span class="optl">optional</span></label><input id="ap-phone" name="phone" type="tel" autocomplete="tel" aria-describedby="ap-phone-err"><p class="field__err" id="ap-phone-err"></p></div>
          <div class="field"><label for="ap-interest">Interested in</label>
            <select id="ap-interest" name="interest">
              <option value="">Just browsing</option>
              ${COLLECTIONS.map((c) => `<optgroup label="${c.name}">${inCategory(c.id).map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</optgroup>`).join('')}
              <option value="bespoke">Something made for me</option>
            </select>
          </div>
        </div>
        <div class="form__row form__row--2">
          <div class="field"><label for="ap-date">Preferred date</label><input id="ap-date" name="date" type="date" min="${today}" required aria-describedby="ap-date-err"><p class="field__err" id="ap-date-err"></p></div>
          <div class="field"><label for="ap-time">Time of day</label>
            <select id="ap-time" name="time"><option>Morning</option><option>Afternoon</option><option>Early evening</option></select>
          </div>
        </div>
        <div class="field"><label for="ap-msg">Anything we should know <span class="optl">optional</span></label><textarea id="ap-msg" name="message" rows="4" placeholder="An occasion, a ring size, a piece you'd like to see…"></textarea></div>
        <label class="check"><input type="checkbox" name="consent" aria-describedby="ap-consent-err"><span>I agree that ARDEM may contact me about this appointment.</span></label>
        <p class="field__err" id="ap-consent-err"></p>
        <div class="form__actions"><button class="btn btn--dark magnetic" type="submit"><span>Request appointment</span></button></div>
      </form>
      <div class="appt__success success" data-appt-success hidden tabindex="-1"></div>
      <aside class="appt__aside">
        <h2>What to expect</h2>
        <ol class="appt__steps">
          <li><strong>We confirm</strong> a time with you by email, usually with a few options.</li>
          <li><strong>Your advisor prepares</strong> the pieces and variants you asked about.</li>
          <li><strong>You meet</strong> in person or by video, for as long as you need.</li>
        </ol>
        <figure>${img('p-droplet-pendant-champagne', 'Droplet Pendant in champagne gold')}</figure>
      </aside>
    </div>
  </section>`;
}

export function notFound() {
  return `${pageHead([{ label: 'Not found' }], 'This page has moved.', 'The link you followed does not match a page on this site.', '<a class="btn btn--dark" href="#home"><span>Return home</span></a>')}`;
}
