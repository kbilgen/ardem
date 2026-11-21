# ARDEM — Creative Direction

**Where Elegance Becomes Eternal.**

## 1. The idea in one line

**Light is the protagonist.** Every piece on the site is *found* by light: a spotlight opening in darkness, a jeweller's loupe travelling over a stone, a narrow beam falling on velvet. The page behaves like a darkened private salon, and scrolling is the act of bringing the lamp closer.

That single idea gives the site its signature moments (spotlight → loupe → beam) and also tells every other element to stay quiet. The interface stays plain so the light carries the drama.

---

## 2. Reference analysis

| # | What the photograph shows | Materials and stones (as visible) | Light and setting | Positioning |
|---|---|---|---|---|
| 1 | Round brilliant solitaire, four claws, slender band that divides at the shoulders | **White metal** (platinum or white-gold tone); clear round brilliant centre stone | Black velvet with gold glitter; warm amber bokeh points; low, warm key light from the upper left | Classic, warm, romantic: the "first light" image |
| 2 | Rectangular step-cut (emerald-cut) green stone in a halo of round and pear-shaped white stones; green baguette on the shoulder | **Yellow gold** band and claws | Deep, saturated green satin in heavy folds; hard specular on the satin | Statement and colour: the most theatrical piece |
| 3 | Single round white pearl on a gold bail, fine cable chain | Yellow gold chain and bail; white pearl with soft lustre | Ivory satin, soft daylight, low contrast | Feminine, intimate, everyday luxury |
| 4 | Round brilliant solitaire, four claws, polished band | **White metal**; clear round brilliant | Ridged black velvet pedestal; a single narrow light; strong starburst glint on the band | Iconic bridal and engagement; the emotional climax |

### Where the brief and the photographs disagree — and what the site does

The brief says the photographs are the source of truth for product accuracy, so the site follows them:

| Brief says | Photograph shows | Decision |
|---|---|---|
| Image 1 is a **gold** ring with **surrounding stones** | White-metal solitaire, **no** surrounding stones | Chapter II's step 3 ("surrounding stones become visible") became **the four claws**, then **the band**. No gold or side stones are described. |
| Image 2 is **cushion**-shaped | **Rectangular step cut** (emerald cut) | Described as "rectangular step-cut green stone". |
| Chapter III and Film 02 use a **champagne silk** environment | Stone sits on **saturated green satin** | The room turns **deep emerald**, lit by a **champagne-gold glow**. Putting this photograph on champagne silk would clash, and emerald is the brief's "selected moment" colour. The champagne atmosphere moves to the **finale (Chapter VI)**, a black warmed by gold. |

Piece names (Dawn Solitaire, Emerald Halo Ring, Pearl Drop Pendant, Eternal Solitaire) are **placeholders**. Descriptions state only what is visible. No metal purities, carat weights, certifications, prices or stock appear anywhere. Each piece has an empty `details` list that the piece page shows automatically once verified data is added.

---

## 3. Narrative — six chapters, one evening

| Time | Brief's emotion | Chapter | What happens |
|---|---|---|---|
| 0–3 s | Intrigue | **I · The Arrival** | Total black. A warm spotlight opens on a single facet (macro, slight defocus racking to sharp). A glint crosses the stone. The name rises letter by letter. |
| 3–15 s | Desire | **I → II** | Scrolling pulls the camera back until the whole ring stands in the light, then the light dims. In **The Art of Brilliance** a jeweller's loupe tours the ring in near darkness: *the crown*, *four claws*, *the band*. Each stop lifts the light a little. The loupe is set down: "Every Facet Tells a Story." |
| 15–40 s | Discovery | **III · The Emerald Experience** | The black warms into emerald under champagne light. The photograph's own satin, blurred, becomes the walls. The ring opens out of the silk, the camera eases toward the stone, and two close-ups follow (halo, shoulder baguette). |
| 40–70 s | Emotional connection | **IV · The Poetry of Gold** | Light rises into an ivory room. The pendant floats, drifts slower than the page, and the camera pushes in until the pearl fills the frame, dissolving into a sharper close-up. Then the light falls away into black. |
| 70 s + | Climax | **V · The Eternal Promise** | Black velvet. A narrow beam finds the stone; gold dust drifts in it. A slow dolly in, the light widens across the pedestal, and the line arrives: "Some Moments Are Forever." |
| | Conversion | **VI · The ARDEM World** | The collections hang like a small exhibition, asymmetric and with wall labels rather than product cards. Quick view, discover the collection, then the name gathers itself from wide tracking: **ARDEM — Elegance Is Eternal.** Two invitations: explore everything, or book a private appointment. |

---

## 4. Design system

### Colour

| Token | Hex | Role |
|---|---|---|
| Obsidian Black | `#0B0B0D` | Default salon; Chapters I, II, V |
| Warm Ivory | `#F7F3EB` | The ivory room (IV), appointment page, pearl and necklace pages |
| Champagne Gold | `#C6A46B` | **Light only**: hairlines, chapter numerals, the loupe rim, button fill on hover, particles |
| Gold, deep | `#85693A` | Gold for text on ivory (4.6:1 contrast; brand gold on ivory is too faint to read) |
| Emerald Green | `#0D5946` / night `#062820` | Chapter III and the emerald piece page only |
| Soft Platinum | `#D8D8D6` | Secondary text on dark, at 74% and 42% |
| Champagne atmosphere | `#17130D` | Black warmed by gold light, for the finale and appointment bands |

Rules: gold never fills large areas. Emerald appears only where the emerald is. Light rooms paint their own background with gradient edges (light rising from above, dimming below), so the page never washes through grey between ivory and black.

### Type

- **Cormorant Garamond** (300/400/500, italic 300/400): everything *spoken*: the name, chapter lines, piece names, the roman chapter numerals.
- **Inter** (variable): everything *functional*: body, captions, form fields, buttons.
- Scale: display `clamp(2.6rem, 5.4vw, 5.6rem)` / title `clamp(2.2rem, 3.6vw, 3.6rem)` / italic subline `clamp(1.25rem, 1.7vw, 1.6rem)` / body 16px at 1.7 line height, 34em measure / small 13px.
- The **wordmark** is Cormorant 300 with 0.2em tracking, optically recentred. In the finale it animates from 0.55em tracking to 0.2em: the name "gathering itself".
- **Navigation** is the only all-caps, tracked text (0.28em), as the brief asks. Everything else is sentence or title case. There are no tracked eyebrow labels above headings.
- Fonts are self-hosted (latin + latin-ext, so Turkish and European names render correctly) and preloaded.

### Layout

- **Museum hang**: large photographs, generous margins, wall-label captions (a hairline, then name and collection). Asymmetric pairs instead of card grids.
- Chapters alternate their spreads (text left / image right in III; image left / text right in IV), and the gallery staggers four frames of different proportions across a 12-column grid.
- Max content width 1320–1440px; full-bleed for cinematic scenes.

### Components

- **Primary button**: 1px gold rule; on hover a gold fill rises from the bottom and the text turns obsidian.
- **Secondary link**: a short gold hairline that extends to full width on hover.
- **Chapter mark**: italic roman numeral in gold, a hairline, then the chapter name. Used because the home page genuinely is a sequence.
- **Chapter index** (≥1440px): fixed roman numerals at the right edge; shows the current chapter and jumps to any chapter.

---

## 5. Motion language

One principle: **motion is camera and light, never decoration.** There are no generic fade-up-on-every-block entrances. Each chapter has one orchestrated move.

| Chapter | Technique | Detail |
|---|---|---|
| I | Pinned (140% desktop / 100% mobile), scrubbed | Radial mask centred on the stone (computed from the cover-fit maths so it tracks on every screen); intro opens it over 2.8s with a defocus rack and one glint; scroll adds radius, pulls the camera from 1.55× to 1× (0.9× on portrait), fades the copy, then dims |
| II | Pinned (280% / 220%), scrubbed | A real magnifier: a circular window showing the same photo at 2.3× (2.6× on mobile), tweened between named focal points; the shade over the base image lifts per stop; headline words rise from masks (GSAP SplitText) |
| III | Scrubbed reveal + parallax | `clip-path` inset opens, inner image settles from 1.28× then eases toward the stone; silk backdrop drifts at a different rate; close-ups wipe in |
| IV | Scrubbed push-in + ambient float | A 3–4s sine float; parallax drift; a push-in toward the pearl with an exactly aligned close-up dissolving in |
| V | Pinned (220% / 170%), scrubbed | Beam (soft-edged clipped shaft, blurred outside the clip), dolly to 1.18×, mask from 6vmin to full; particles confined to the beam |
| VI | Triggered reveals | Frames wipe up once; wall labels follow; the wordmark's tracking is scrubbed |

**Scroll** uses Lenis, driven by GSAP's ticker and updating ScrollTrigger every frame, on the native scroll position (no transformed wrapper), so the scrollbar, keyboard, anchor links and find-in-page all keep working. Touch devices keep native scrolling. If a visitor scrolls during the opening, the intro speeds up 3× rather than fighting the scroll.

**Reduced motion**: no smoothing, no pins, no particles, no grain animation; every chapter renders in its final, fully lit composition. **No JavaScript**: the same fully lit static page. A boot script reveals intro content after four seconds if the motion system never starts.

---

## 6. The six effects

| Effect | Implementation | Restraint |
|---|---|---|
| Film grain | 256px transparent noise tile, translated in 5 steps at 0.9s | Only in dark scenes (I, II, III, V); static on low-power devices |
| Light particles | One canvas per scene, pre-rendered sprite, ≤1.5× pixel density | About 30 motes on desktop, 15 on phones, half on low-power; confined to the beam in V; paused off-screen and in background tabs |
| Vignette | Radial + bottom gradient overlay | Hero compositions only (I, V) |
| Editorial glass | Smoked surface + 18px blur + one gold hairline, no radius | Navigation only; tone switches to ivory glass over light rooms |
| Colour atmospheres | One fixed colour field scrubbed between dark atmospheres; light rooms carry their own gradient edges | Never lags behind content; never washes grey |
| Scroll pacing | ScrollTrigger + Lenis; three pins only | No scroll-jacking elsewhere; navigation hides on the way down and returns on the way up |

---

## 7. Copy

Headlines and sublines are the brief's own words. Everything else is written to be plain and functional: captions say what you are looking at ("Four claws: the stone sits high, open to light from every side"), and buttons say what happens ("Book a Private Appointment", "Quick view", "Examine with the loupe"). The appointment form never claims to have sent anything it didn't send.

## 8. Deliberately not done

- No invented prices, certifications, gem specifications, stock levels, founding dates or heritage claims.
- No sparkle overlays, lens flares, gradient text or glassmorphism cards.
- No AI-redesigned jewellery: every frame on the site is one of the four photographs or a crop of one.
