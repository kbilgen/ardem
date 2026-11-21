# ARDEM — Where Elegance Becomes Eternal.

A cinematic fine jewellery website in six scroll-driven chapters, plus collection, piece and private-appointment pages.

**Stack:** Next.js (App Router, static export) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger + SplitText · Lenis

- `docs/CREATIVE_DIRECTION.md`: concept, reference analysis, design system, motion language
- `docs/HIGGSFIELD_PROMPTS.md`: film prompts, specs, and how to add films
- `docs/QA.md`: what was tested, results, and the pre-launch checklist

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static site → out/
npm run serve        # preview out/ locally
```

Requires Node 20.9+. `npm run build` type-checks and pre-renders every route (home, collections, 4 collection pages, 4 piece pages, appointment, 404) to plain HTML in `out/`.

## Deploy

The build is fully static, so it deploys anywhere:

- **Vercel**: import the repository; no settings needed (static export is detected).
- **Netlify / Cloudflare Pages**: build `npm run build`, publish directory `out`.
- **Any web server or bucket**: upload `out/`. Set `404.html` as the error page.

## Editing content

| What | Where |
|---|---|
| Brand lines, contact email, social links, appointment endpoint | `src/content/site.ts` |
| Pieces (names, descriptions, verified details) and collections | `src/content/catalogue.ts` |
| Images and their focal points (drive camera, spotlight, loupe) | `src/content/media.ts` |
| Films (Higgsfield slots) | `src/content/films.ts` |

**Before launch, replace the placeholders** in `site.ts` (domain, email, social URLs) and confirm the piece names in `catalogue.ts`. Add verified specifications to each piece's `details` array (e.g. `{ label: "Metal", value: "…" }`); the piece page then shows a details table instead of the "shared during a private appointment" note. Nothing on the site states prices, certifications, gem specs or stock.

### Appointment requests

With `appointmentEndpoint` empty (the default), the form validates and prepares the request as an email to `contact.email`, with a copy button. It never claims to have sent anything. To submit directly, set `appointmentEndpoint` to any URL that accepts a JSON POST (Formspree, a CRM webhook, an n8n webhook, or your own API). The body is `{ name, email, phone, date, message, pieces: [slug] }`.

### Replacing or adding photographs

Put the source PNG/JPG in `assets/source/` and run:

```bash
npm run images     # python3 + Pillow (with AVIF support)
```

This writes AVIF + WebP sizes, the detail crops, the blurred silk backdrop, the grain tile and `og.jpg`. If the framing changes, update the focal points in `src/content/media.ts`. The spotlights, camera moves and loupe all aim at those points.

### Adding Higgsfield films

```bash
scripts/encode-films.sh path/to/clip-16x9.mp4 emerald path/to/clip-9x16.mp4 --loop
```

Then set `ready: true` for that slot in `src/content/films.ts`. Details are in `docs/HIGGSFIELD_PROMPTS.md`.

## Project structure

```
src/
  app/                 Next.js routes, layout, globals.css (design tokens + effects)
  chapters/            The six home-page chapters (each owns its GSAP timeline)
  components/          Shell: SmoothScroll (Lenis↔ScrollTrigger), Atmosphere, Nav,
                       Cursor, Particles, Photo, Film, LoupeImage, QuickView, forms
  views/               Page bodies shared by the Next routes and the portable build
  content/             All editable content
  lib/                 Motion helpers (matchMedia, cover-fit focal maths), paths, boot script
preview/               Portable static build (no Next runtime) used for QA and file-only hosts
scripts/               prepare-images.py, encode-films.sh
assets/source/         The four original photographs
public/                Fonts (self-hosted), generated images, films, favicon, og.jpg
```

## Portable build (optional)

`npm run build:portable` renders the same components to `out-preview/` with every link and asset relative to its page, so the site works from any sub-folder, a file share or a sandboxed preview host. `next build` remains the production path.

## Motion, accessibility, performance

- All motion runs through `gsap.matchMedia` with three modes: desktop, mobile (shorter pins, fewer particles, no blur filters), and reduced motion (no smoothing, no pins, final compositions).
- Without JavaScript, or if scripts fail, every page renders fully lit and readable.
- Keyboard: skip link, visible focus everywhere, focus-trapped menu and quick view (Escape closes and focus returns), loupe operable with the arrow keys.
- Custom cursor only on fine, hover-capable pointers.
- AVIF/WebP with intrinsic sizes (zero layout shift), lazy loading below the fold, a high-priority hero image, preloaded fonts, particles and films paused off-screen.
