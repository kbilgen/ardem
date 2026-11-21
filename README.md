# ARDEM — Crafted to Become Eternal

A cinematic luxury jewelry site: a scroll-driven WebGL hero (a drop of molten gold drawn into a thread that becomes the signature ring), six story chapters, four collections, product pages with live 3D, and reservation / private-appointment flows.

Static site with no build step and no dependencies.

## Structure

```
index.html        shell: nav, menu, reservation modal, footer
css/ardem.css     design tokens + all styles
js/app.js         router (#hash views), scroll choreography, view mounting
js/views.js       page templates
js/data.js        catalogue, collections, copy
js/ui.js          nav, cursor, magnetic buttons, modal, form validation
js/store.js       reservation/appointment storage (see below)
js/hero.js        the hero sequence
js/viewer.js      live 3D showcase (drag to rotate, variant transitions)
js/jewels.js      jewelry models + materials (metals, stones, variants)
js/renderer.js    WebGL2 renderer: PBR gold, faceted gems with dispersion, studio light
js/geometry.js    procedural geometry (brilliant/cushion/pear cuts, bands, tubes)
js/math.js        matrix/vector helpers
img/              rendered stills (p-*, m-*, c-*, origin-*) and photographs (photo-*, crop-*)
```

## Run locally

```
python3 -m http.server 8000   # then open http://localhost:8000
```

## Releasing changes

Files are not content-hashed. When you change JS or CSS, bump the `?v=` tag on the imports (all `js/*.js` files and `index.html`) so browsers never mix old and new modules:

```
sed -i -E "s/\?v=[0-9a-z]+/?v=NEW_TAG/g" index.html js/*.js
```

When an image changes, give it a new file name.

## Reservations

`js/store.js` saves requests to the Claude artifact database when the page runs as a Claude artifact. Anywhere else (including Vercel) it keeps the request in the visitor's browser and the confirmation says so. To receive real requests, replace `submitRequest()` with a call to your own endpoint (for example a Vercel Function that emails the advisor or writes to a database).

## Content notes

Product images are digitally rendered except files named `photo-*` / `crop-*`, which are photographs and are labelled "Photographed" on the site. Prices, stone grading and material specifications are intentionally not stated; pieces show "Price on request".
