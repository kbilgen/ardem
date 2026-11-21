# ARDEM — QA Summary

## How it was tested

The workspace this was built in couldn't reach the npm registry, so the Next.js runtime itself couldn't be installed there. Testing therefore ran on two layers:

1. **Type safety.** The whole codebase (routes, layout, components, content) passes `tsc --strict`. Next's `Link`/`usePathname`/`Metadata` were type-stubbed for this check.
2. **Behaviour.** The *same* React components were server-rendered to static HTML and hydrated (`preview/build.mjs`, real Tailwind 4 compiler, real GSAP 3.15 and Lenis 1.3). That build was then driven in headless Google Chrome via Playwright, served from a sub-folder.

**First thing to do on your machine:** `npm install && npm run build`. The Next-specific files (`src/app/**`, `next.config.ts`) are small and standard (App Router, async `params`, `generateStaticParams`, static export), but they haven't been through `next build` yet.

## Results

| Area | Check | Result |
|---|---|---|
| Console | Errors and warnings across all 12 pages, scrolling the full film both ways | **None** |
| Links | Every internal link on a collection page, resolved from a sub-folder | **14/14 OK** |
| Layout | Horizontal overflow at 390 / 834 / 1440 px | **None** |
| Layout shift | CLS on load (desktop + phone) | **0** |
| Load | LCP, throttled 4G, 4× CPU on phone | **≈2.9–3.0 s** (see note) |
| Weight | JS gzip / CSS gzip / first-view transfer | **130 KB / 9 KB / ≈0.7–0.8 MB** incl. fonts |
| Pins | Hero, Loupe, Promise, scrolling down and back up (wheel and jump) | States reverse correctly; no jumps |
| Atmospheres | Nav tone and chapter index when entering any chapter from either direction | Correct after fix (below) |
| Lenis | Wheel smoothing; anchor and chapter-index jumps land under the nav | OK (lands 88 px down) |
| Menu (phone) | Opens, focus to first item, Escape closes, scroll locked | OK |
| Quick view | Opens as modal, focus to Close, Escape closes, focus returns to opener | OK |
| Loupe | Hover (mouse); toggle + drag/arrow keys (touch, keyboard) | OK |
| Form | Required-field errors, focus to first error, pre-selects the piece from `#slug`, honest "ready to send" state | OK |
| Films | Slot marked ready → plays WebM, pauses off-screen, skipped for reduced motion | OK (tested with a synthetic clip, then reverted) |
| Reduced motion | No Lenis, no pins, final compositions, no particles | OK |
| No JavaScript | Every page fully lit and readable | OK |
| Fonts | Cormorant 300/400 (incl. italic) and Inter load on every page type; no unused preloads | OK |

**LCP note:** the brief's opening, a near-black screen with the name rising as the light arrives, means the largest text paints at about 1–3 s by design. If raw LCP matters more than the reveal, start the letters at `0` instead of `0.9` in `src/chapters/Arrival.tsx`.

## Issues found and fixed during QA

- The hero wordmark overlapped the stone at desktop widths, so it was resized and the copy fade moved earlier.
- A grey wash appeared when the page cross-faded between ivory and black. Light rooms now paint their own background with gradient edges, and the colour field only moves between dark tones.
- The two emerald close-ups were nearly identical crops. They were re-cut: the halo macro and the shoulder baguette.
- The botanical shadow read as a smudge, so it was removed.
- The Chapter V beam had hard triangular edges. The blur now sits outside the clip.
- On phones the Chapter V stone sat low enough to touch the chapter label, and the hero stone sat low on tall screens. On portrait screens the stage now extends upward.
- The pearl crossfade ghosted two different crops. It is now an aligned push-in that dissolves into the close-up.
- After jumping back into a pinned chapter, the nav kept the wrong tone and the chapter index missed it. Both now measure the chapter's full pinned length.
- The loupe's magnified image downloaded at page load. It now loads lazily.
- The preview relied on a `<base>` tag that sandboxed hosts may ignore. All preview paths are now page-relative.

## Not yet verified (needs real devices)

Only Chromium was available here. Please check:

- [ ] **Safari macOS / iOS**: masked spotlight (`-webkit-mask-image` included), smoked-glass nav (`-webkit-backdrop-filter` included), AVIF (Safari 16+; WebP fallback present), `svh` units (15.4+)
- [ ] **Safari < 16.2**: button borders use `color-mix()`; on older versions the border falls back to none (cosmetic)
- [ ] **Firefox**: scrubbed CSS-variable mask radius performance
- [ ] **Android mid-range**: pin smoothness. If it stutters, lower `density` on `<Particles>` or remove the grain on mobile
- [ ] **iOS address-bar resize** during pinned chapters (ScrollTrigger `ignoreMobileResize` is on)

## Before launch

- [ ] Replace placeholders in `src/content/site.ts`: domain, `concierge@ardem.example`, social URLs
- [ ] Confirm or rename the four piece names in `src/content/catalogue.ts`
- [ ] Add verified specifications to `details` (metal, stones, sizes); leave out anything unverified
- [ ] Connect `appointmentEndpoint` (or keep the email hand-off)
- [ ] Add privacy and terms pages if the form posts to a backend (data-protection notice for the appointment form)
- [ ] Generate and add the Higgsfield films (optional; the site is complete without them)
- [ ] Run Lighthouse on the deployed URL and the device checks above
