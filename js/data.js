// ARDEM — catalogue and copy. Descriptions cover design only; stone details,
// sizing and materials are confirmed with the client at consultation.

export const METAL_UI = {
  champagne: { label: 'Champagne gold', swatch: 'linear-gradient(135deg,#f1dcae,#c99d5c 60%,#a57b3f)' },
  rose: { label: 'Rose gold', swatch: 'linear-gradient(135deg,#f2c9b8,#cf8f78 60%,#a86a57)' },
  white: { label: 'White gold', swatch: 'linear-gradient(135deg,#ffffff,#d6d6d2 55%,#a9a9a5)' },
  yellow: { label: 'Yellow gold', swatch: 'linear-gradient(135deg,#f6dc8e,#d1a33f 60%,#a37a22)' },
};

export const SIGNATURE_VARIANTS = [
  { key: 'champagne', label: 'Champagne Gold', note: 'Warm, classic elegance.', swatch: METAL_UI.champagne.swatch,
    detail: 'Champagne gold softens the brilliance of the centre stone with a warm, quiet glow. The most classic expression of the design.', tint: '#efe6d6' },
  { key: 'rose', label: 'Rose Gold', note: 'Romantic and refined.', swatch: METAL_UI.rose.swatch,
    detail: 'A blush of rose gold brings warmth close to the skin and a gentle contrast to the white light of the stone.', tint: '#f1e2dc' },
  { key: 'white', label: 'Diamond White', note: 'Modern, luminous sophistication.', swatch: METAL_UI.white.swatch,
    detail: 'White metal disappears around the stone, so the piece reads as pure light. Crisp, modern and luminous.', tint: '#eceeee' },
  { key: 'emerald', label: 'Emerald Green', note: 'Bold, distinctive luxury.', swatch: 'radial-gradient(circle at 35% 30%,#7fd8a4,#0f7a4a 55%,#063d25)',
    detail: 'A cushion-shaped green centre stone set in yellow gold. The same silhouette, recut for depth and colour.', tint: '#dfe4da' },
];

const v = (id, metals) => metals.map((m) => ({ key: m, label: METAL_UI[m].label, swatch: METAL_UI[m].swatch, img: `p-${id}-${m}` }));

export const COLLECTIONS = [
  { id: 'rings', name: 'Rings', cover: 'photo-aurelia', coverAlt: 'Aurelia Cluster ring in yellow gold on black, photographed',
    intro: 'Solitaires, clusters and bands: pieces made to be worn every day and kept for a lifetime.' },
  { id: 'necklaces', name: 'Necklaces', cover: 'c-necklaces', coverAlt: 'Droplet pendant on a fine champagne gold chain',
    intro: 'Pendants and rivières that rest close to the collarbone and catch the light with every movement.' },
  { id: 'earrings', name: 'Earrings', cover: 'p-droplet-earrings-rose', coverAlt: 'Droplet earrings in rose gold with pear-shaped stones',
    intro: 'Studs and drops that frame the face, from quiet brilliance to evening statements.' },
  { id: 'bracelets', name: 'Bracelets', cover: 'c-bracelets', coverAlt: 'Thread bangle in champagne gold',
    intro: 'Bangles and rivières designed to move with the wrist, worn alone or layered.' },
];

const RING_VIEW = { rot: [0.42, 0.62, 0], cam: { pos: [0, 1.15, 6.1], target: [0, 0.42, 0], fov: 0.5 } };
const PENDANT_VIEW = { rot: [0, 0.25, 0], cam: { pos: [0, 0.15, 5.4], target: [0, 0.1, 0], fov: 0.62 } };
const BRACELET_VIEW = { rot: [1.0, 0.4, 0], cam: { pos: [0, 1.4, 5.6], target: [0, 0, 0], fov: 0.6 } };

export const PRODUCTS = [
  {
    id: 'eternal-solitaire', name: 'Eternal Solitaire', category: 'rings', signature: true, builder: 'solitaire',
    line: 'A round brilliant raised on four claws above a pavé-set band.',
    story: 'The ARDEM signature. One silhouette, drawn once and refined until nothing could be taken away: a single stone held high so light can reach it from every side, and a slender band set with pavé that carries the sparkle down the shoulders.',
    design: ['Four-claw raised setting with an open gallery', 'Pavé-set shoulders, single row', 'Round brilliant centre stone, or a cushion-shaped green stone in the Emerald Green expression'],
    variants: SIGNATURE_VARIANTS.map((s) => ({ ...s, img: `p-eternal-solitaire-${s.key}` })),
    gallery: [
      { img: 'p-eternal-solitaire-alt', alt: 'Eternal Solitaire in champagne gold on black velvet' },
      { img: 'photo-solitaire', alt: 'Solitaire on a black velvet ring box, photographed', photo: true },
      { img: 'p-eternal-solitaire-white-alt', alt: 'Eternal Solitaire in Diamond White, side view' },
    ],
    view: RING_VIEW,
  },
  {
    id: 'aurelia-cluster', name: 'Aurelia Cluster', category: 'rings', builder: 'cluster', stone: 'diamond',
    line: 'A round centre stone crowned by smaller stones on polished ball claws.',
    story: 'Aurelia gathers light the way a flower gathers petals. A large round centre stone sits within a crown of smaller round stones, each held on its own polished ball claw, above a pavé shank.',
    design: ['Round centre stone with a crown of twelve round stones', 'Ball claws in polished gold', 'Pavé-set shank'],
    variants: [
      { key: 'yellow', label: 'Yellow gold', swatch: METAL_UI.yellow.swatch, img: 'photo-aurelia', photo: true },
    ],
    gallery: [
      { img: 'p-aurelia-cluster-main', alt: 'Aurelia Cluster rendered on ivory' },
      { img: 'p-aurelia-cluster-alt', alt: 'Aurelia Cluster rendered on black' },
    ],
    view: RING_VIEW,
  },
  {
    id: 'verdant-halo', name: 'Verdant Halo', category: 'rings', builder: 'halo', stone: 'emerald',
    line: 'A cushion-shaped green stone framed by a halo of round diamonds.',
    story: 'Deep green at the centre, a fine line of light around it. Verdant sets a cushion-shaped green stone within a halo of round stones and carries the pavé onto a slender white-gold band.',
    design: ['Cushion-shaped green centre stone', 'Diamond halo with a double gallery', 'Slender pavé band'],
    variants: [
      { key: 'white', label: 'White gold', swatch: METAL_UI.white.swatch, img: 'photo-verdant', photo: true },
    ],
    gallery: [
      { img: 'p-verdant-halo-main', alt: 'Verdant Halo rendered on ivory' },
      { img: 'p-verdant-halo-alt', alt: 'Verdant Halo rendered on black' },
    ],
    view: RING_VIEW,
  },
  {
    id: 'thread-band', name: 'Thread Band', category: 'rings', builder: 'rope',
    line: 'Two strands of gold turned around each other.',
    story: 'The golden thread at the heart of ARDEM, made permanent. Two polished strands are turned around each other into a band that wears alone or stacks beside the signature.',
    design: ['Two twisted strands, polished', 'Comfortable rounded profile', 'Designed to stack'],
    variants: v('thread-band', ['champagne', 'rose', 'white']),
    gallery: [{ img: 'p-thread-band-alt', alt: 'Thread Band on black' }],
    view: { rot: [0.38, 0.75, 0], cam: { pos: [0, 0.9, 6.2], target: [0, 0, 0], fov: 0.5 } },
  },
  {
    id: 'droplet-pendant', name: 'Droplet Pendant', category: 'necklaces', builder: 'dropPendant', stone: 'diamond',
    line: 'A pear-shaped stone in a fine gold bezel on a delicate chain.',
    story: 'The drop of molten gold, made to wear. A pear-shaped stone points upward like a falling droplet, outlined by a thin gold bezel and suspended from a fine chain.',
    design: ['Pear-shaped stone, point up', 'Fine bezel edge', 'Delicate cable chain'],
    variants: v('droplet-pendant', ['champagne', 'rose', 'white']),
    gallery: [{ img: 'p-droplet-pendant-alt', alt: 'Droplet Pendant on black' }],
    view: PENDANT_VIEW,
  },
  {
    id: 'verdant-pendant', name: 'Verdant Pendant', category: 'necklaces', builder: 'haloPendant', stone: 'emerald',
    line: 'A cushion-shaped green stone within a halo, on a fine chain.',
    story: 'The Verdant motif, lifted to the collarbone: a cushion-shaped green stone within a halo of round stones, framed twice in white gold.',
    design: ['Cushion-shaped green stone', 'Diamond halo with double frame', 'Fine white-gold chain'],
    variants: [{ key: 'white', label: 'White gold', swatch: METAL_UI.white.swatch, img: 'p-verdant-pendant-main' }],
    gallery: [{ img: 'p-verdant-pendant-alt', alt: 'Verdant Pendant on black' }],
    view: { ...PENDANT_VIEW, rot: [0, -0.25, 0] },
  },
  {
    id: 'riviere-necklace', name: 'Rivière Necklace', category: 'necklaces', builder: 'riviere', stone: 'diamond',
    line: 'A graduated line of round stones, each in its own collet.',
    story: 'One continuous line of light. Round stones graduate in size toward the centre, each held in its own fine collet so the necklace follows the neckline without a break.',
    design: ['Graduated round stones', 'Individual collet settings', 'Flexible articulation'],
    variants: [{ key: 'white', label: 'White gold', swatch: METAL_UI.white.swatch, img: 'p-riviere-necklace-main' }],
    gallery: [{ img: 'p-riviere-necklace-alt', alt: 'Rivière Necklace on black' }],
    view: { rot: [0.15, 0, 0], cam: { pos: [0, -0.1, 5.6], target: [0, -0.35, 0], fov: 0.62 } },
  },
  {
    id: 'droplet-earrings', name: 'Droplet Earrings', category: 'earrings', builder: 'dropEarrings', stone: 'diamond',
    line: 'Pear drops beneath small round studs.',
    story: 'A small round stud at the lobe and a pear-shaped drop beneath it, linked so the drop moves freely and catches light with every turn of the head.',
    design: ['Round brilliant studs', 'Pear-shaped drops in fine bezels', 'Articulated link'],
    variants: v('droplet-earrings', ['rose', 'champagne', 'white']),
    gallery: [{ img: 'p-droplet-earrings-alt', alt: 'Droplet Earrings on black' }],
    view: { rot: [0, 0.3, 0], cam: { pos: [0, 0.1, 5.2], target: [0, 0.05, 0], fov: 0.62 } },
  },
  {
    id: 'solitaire-studs', name: 'Solitaire Studs', category: 'earrings', builder: 'studs', stone: 'diamond',
    line: 'Round brilliants on four claws.',
    story: 'The simplest form, made precisely. A round brilliant on four claws, set low enough to wear every day.',
    design: ['Round brilliant stones', 'Four-claw settings', 'Low profile for everyday wear'],
    variants: v('solitaire-studs', ['white', 'champagne']),
    gallery: [{ img: 'p-solitaire-studs-alt', alt: 'Solitaire Studs on black' }],
    view: { rot: [0.15, 0.35, 0], cam: { pos: [0, 0, 4.6], target: [0, 0, 0], fov: 0.6 } },
  },
  {
    id: 'verdant-drops', name: 'Verdant Drops', category: 'earrings', builder: 'emeraldDrops', stone: 'emerald',
    line: 'Cushion-shaped green stones in halos, suspended from round studs.',
    story: 'Colour for the evening. Cushion-shaped green stones sit within halos of round stones and hang from small round studs, framed in yellow gold.',
    design: ['Cushion-shaped green stones', 'Diamond halos', 'Round stud tops'],
    variants: [{ key: 'yellow', label: 'Yellow gold', swatch: METAL_UI.yellow.swatch, img: 'p-verdant-drops-main' }],
    gallery: [{ img: 'p-verdant-drops-alt', alt: 'Verdant Drops on black' }],
    view: { rot: [0, -0.3, 0], cam: { pos: [0, 0, 5.6], target: [0, 0, 0], fov: 0.62 } },
  },
  {
    id: 'riviere-bracelet', name: 'Rivière Bracelet', category: 'bracelets', builder: 'tennis', stone: 'diamond',
    line: 'A flexible line of collet-set round stones.',
    story: 'The rivière, scaled to the wrist. A flexible line of round stones in individual collets that circles the wrist without a gap.',
    design: ['Round stones in individual collets', 'Fully articulated line', 'Sized to the wrist at consultation'],
    variants: v('riviere-bracelet', ['white', 'champagne']),
    gallery: [{ img: 'p-riviere-bracelet-alt', alt: 'Rivière Bracelet on black' }],
    view: BRACELET_VIEW,
  },
  {
    id: 'thread-bangle', name: 'Thread Bangle', category: 'bracelets', builder: 'ropeBangle',
    line: 'Two strands, turned and polished.',
    story: 'The twisted thread of the Thread Band, scaled to the wrist. Two strands are turned around each other and polished until the reflections run unbroken.',
    design: ['Two twisted strands', 'Polished finish', 'Pairs with the Thread Band'],
    variants: v('thread-bangle', ['rose', 'champagne', 'white']),
    gallery: [{ img: 'p-thread-bangle-alt', alt: 'Thread Bangle on black' }],
    view: { ...BRACELET_VIEW, rot: [0.95, 0.5, 0] },
  },
  {
    id: 'pave-bangle', name: 'Pavé Bangle', category: 'bracelets', builder: 'paveBangle',
    line: 'A smooth bangle with a single row of pavé.',
    story: 'A clean, smooth bangle with a single row of pavé across its upper face: quiet from the side, luminous from above.',
    design: ['Smooth rounded profile', 'Single row of pavé', 'Designed to layer'],
    variants: v('pave-bangle', ['champagne', 'white']),
    gallery: [{ img: 'p-pave-bangle-alt', alt: 'Pavé Bangle on black' }],
    view: { ...BRACELET_VIEW, rot: [0.75, 0.4, 0] },
  },
];

export const byId = (id) => PRODUCTS.find((p) => p.id === id);
export const inCategory = (c) => PRODUCTS.filter((p) => p.category === c);

export const PROCESS = [
  { title: 'The form', img: 'm-form', alt: 'The bare setting of the Eternal Solitaire, before stones are set',
    text: 'Every piece begins as a form, drawn and refined until its proportions feel inevitable. The setting is shaped before any stone is chosen.' },
  { title: 'The setting', img: 'm-setting', alt: 'Macro view of four claws holding a round brilliant',
    text: 'Claws are shaped to hold the stone securely while leaving it open, so light can enter from every side and return through the table.' },
  { title: 'The polish', img: 'm-polish', alt: 'Macro view of two polished gold strands twisted together',
    text: 'Surfaces are polished in stages, from fine abrasives to the final buff, until reflections run unbroken across the metal.' },
  { title: 'The finish', img: 'crop-claws', alt: 'Close-up of polished ball claws around round stones, photographed', photo: true,
    text: 'The last details are refined by hand and inspected under magnification: each claw tip, each edge, each stone checked for security.' },
];

export const MARQUEE = ['Designed for eternity', 'The art of fine jewelry', 'Precision in every detail', 'Timeless by design', 'A personal expression'];

export const RING_SIZES = ['44', '46', '48', '50', '52', '54', '56', '58', '60', '62'];
