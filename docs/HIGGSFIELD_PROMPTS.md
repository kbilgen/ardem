# ARDEM — Higgsfield Film Production Sheet

Higgsfield wasn't connected while this site was built, so every chapter currently runs on the **photographic sequence** (spotlight, loupe, beam and camera moves performed by the page itself). This sheet holds the exact prompts and specs to generate the films. Each film has a slot ready in the code.

## How the films fit the site

**The page is the camera.** Scroll already performs the pull-back (I), the loupe tour (II), the push toward the stone (III), the push-in to the pearl (IV) and the dolly (V). So the films for the site are **living stills**:

- locked framing that matches the photograph,
- only light, reflection, fabric and focus moving,
- loopable.

A film that also moves its own camera would fight the scroll choreography and make the jewellery swim. The brief's full narrative camera moves are still specified below, as **campaign cuts** for social, ads and the showroom screen.

### Global settings (all films)

| Setting | Value |
|---|---|
| Mode | **Image-to-video, using the original photograph as the first frame.** This is the single most important control for keeping the piece identical. |
| Duration | 6–8 s (site loops) · 8–10 s (campaign cuts) |
| Frame rate | 24 fps |
| Aspect / size | 16:9 at 1920×1080 (desktop) **and** 9:16 at 1080×1920 (mobile), generated separately, not cropped |
| Mobile framing | Stone or pearl in the **upper 40%** of the frame (the words sit below it on phones) |
| Motion strength | Low. If the tool exposes a motion or creativity slider, keep it in the lowest third |
| Audio | None |
| Seed | Keep the seed of an accepted 16:9 take when generating its 9:16 twin |

### Negative prompt (use on every film)

```
changing stone count, extra stones, missing stones, morphing gemstone, melting metal, warping band, bending claws, extra claws, flickering setting, unstable geometry, jewelry changing shape, colour shift of the stone, gold turning silver, silver turning gold, plastic look, CGI look, cartoon, text, watermark, logo, hands, people, fingers, glitter overlay, lens flare, sparkle stickers, star filter, fast motion, camera shake, zoom pulsing, low resolution, compression artefacts
```

### Acceptance checklist (reject the take if any fail)

- [ ] Same number of stones, claws and halo elements in the first and last frame
- [ ] Stone shape unchanged (round brilliant stays round; emerald cut keeps its corners)
- [ ] Metal colour unchanged (white metal on I and IV, yellow gold on II and III)
- [ ] No flicker in the setting when played at 2× speed
- [ ] Last frame within a few pixels of the first (for loops)

---

## Site films (slots in `src/content/films.ts`)

### FILM 01 — The Diamond Reveal → slot `arrival` (Chapter I, opening hero)

Reference: `assets/source/brilliance.png`

```
Ultra-realistic luxury jewellery film. The exact ring from the reference image: a round brilliant-cut clear diamond held in four polished white-metal claws on a slender white-metal band, resting on black velvet scattered with fine gold glitter. Complete darkness around the ring. A single controlled beam of warm amber light moves very slowly across the diamond from left to right, so light travels facet by facet across the crown and fire flickers naturally inside the stone. Soft warm bokeh points glow and breathe gently in the background. Locked-off camera, macro lens, shallow depth of field, focus held on the diamond. Natural, minimal reflections. Powerful, mysterious, exclusive. High-end jewellery advertising, photorealistic, 8K detail.
```
Camera: locked (no movement). Loop: yes.

### FILM 02 — The Emerald Story → slot `emerald` (Chapter III)

Reference: `assets/source/emerald.png`

```
Ultra-realistic luxury jewellery film. The exact ring from the reference image: a rectangular step-cut (emerald-cut) green emerald in yellow-gold claws, framed by a halo of round and pear-shaped white diamonds, with a slim green baguette set into the yellow-gold shoulder, resting in deep folds of saturated emerald-green satin. Soft champagne-gold light drifts slowly across the satin folds, the fabric moves almost imperceptibly as if touched by air, and the green stone catches the light so its step-cut facets glow from within. The diamond halo glints softly as the light passes. Locked-off camera, macro lens, shallow depth of field on the stone. Royal, elegant, captivating. Photorealistic high-end jewellery advertising.
```
Camera: locked, or the gentlest slow push (≤3%). Loop: yes.

### FILM 03 — The Pearl Poetry → slot `gold` (Chapter IV)

Reference: `assets/source/pearl.png` (the site shows a 3:4 crop, so frame the pearl and chain centrally)

```
Ultra-realistic luxury jewellery film. The exact necklace from the reference image: a single round white pearl with soft lustre on a small gold bail, hanging from a fine yellow-gold cable chain, resting on warm ivory silk satin. Warm morning sunlight moves slowly across the silk, the satin ripples very gently, and the pearl's surface shows a soft travelling highlight and subtle orient. Faint, soft botanical leaf shadows drift slowly across the fabric. Locked-off camera, macro lens, shallow depth of field on the pearl. Feminine, delicate, timeless. Photorealistic high-end jewellery advertising.
```
Camera: locked. Loop: yes. Deliver 16:9 and a 3:4 (1536×2048) version if the tool allows; otherwise 9:16.

### FILM 04 — The Eternal Solitaire → slot `promise` (Chapter V, the climax)

Reference: `assets/source/solitaire.png`

```
Ultra-realistic luxury jewellery film. The exact ring from the reference image: a round brilliant-cut clear diamond in a four-claw polished white-metal setting on a slim white-metal band, resting on a ridged black velvet pedestal. Deep darkness. A narrow spotlight from above falls on the diamond; natural reflections move slowly across its facets, and a single soft star glint breathes on the polished band. Fine dust drifts slowly through the beam. Locked-off camera, macro lens, elegant cinematic depth of field, the diamond in perfect focus. Eternal love, sophistication, iconic luxury. Photorealistic high-end jewellery advertising.
```
Camera: locked. Loop: yes.

### Opening hero sequence

The opening hero is **FILM 01 in the `arrival` slot**. The page wraps it in the spotlight-from-darkness reveal, the name animation and the scroll pull-back, so no separate intro film is needed on the site. For a standalone teaser, use campaign cut C1 below.

### TRANSITION T1 — Into emerald → slot `veil-emerald` (top of Chapter III)

Text-to-video or image-to-video from a dark frame of `emerald.png`.

```
Abstract luxury film. Deep black frame. Slowly, soft champagne-gold light reveals heavy folds of emerald-green satin emerging from darkness, the fabric moving very slowly like a breath. No jewellery, no objects, no text. Smooth, slow, photorealistic fabric, shallow depth of field, cinematic grade, deep blacks.
```
6–8 s, loop, 16:9 and 9:16. Shown at 60% opacity, masked into the top of the chapter.

### TRANSITION T2 — Into night → slot `veil-black` (bottom of Chapter IV)

```
Abstract luxury film. Warm ivory silk satin in soft folds, lit by gentle warm light that slowly fades away until the silk falls into deep black, as if evening arrives. No jewellery, no objects, no text. Slow, photorealistic fabric, cinematic grade.
```
6–8 s, loop (the encoder's `--loop` will blend the ends), 16:9 and 9:16.

---

## Campaign cuts (narrative camera, not used on the scroll page)

These follow the brief's scene descriptions literally. Use them for social, paid media and a showroom screen. Generate as image-to-video **with the reference photograph as the last frame** (end-frame conditioning) so every cut lands on the true product.

| Cut | Brief film | Camera | Length |
|---|---|---|---|
| C1 | Diamond Reveal | Extreme facet macro → slow pull-back → slight orbit, ending on the reference frame | 8–10 s |
| C2 | Emerald Story | Macro on the green stone → slow orbit around the ring → hold on the reference frame | 8–10 s |
| C3 | Pearl Poetry | Macro on the pearl's surface → gentle drift along the chain → necklace on silk | 8 s |
| C4 | Eternal Solitaire | Darkness → narrow spotlight → slow dolly toward the stone → hero frame | 8–10 s |

Add to each prompt: *"The camera move ends exactly on the composition of the reference image."* Keep the negative prompt.

---

## Putting a film on the site

```bash
# 1. Encode (16:9 master, optional 9:16 twin, --loop for seamless repeat)
scripts/encode-films.sh ~/Downloads/emerald-16x9.mp4 emerald ~/Downloads/emerald-9x16.mp4 --loop

# 2. Switch the slot on
#    src/content/films.ts → emerald: { ..., ready: true }

# 3. Build
npm run build
```

What the site does with it:

- It loads only when the chapter is near the screen (`preload="none"` until then), plays only while visible, and pauses off-screen and in background tabs.
- It serves 9:16 to portrait phones and WebM/VP9 to browsers that support it, with H.264 MP4 everywhere else.
- It fades in over the photograph only once it can actually play, so a slow or failed load simply leaves the still.
- It never plays for visitors who prefer reduced motion or have Data Saver on.
- Size targets: ≤2.5 MB per desktop loop and ≤1.2 MB per mobile loop.
