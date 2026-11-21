import type { MediaKey } from "./media";

/**
 * The four pieces and four collections.
 *
 * Piece names are PLACEHOLDERS chosen for the prototype; rename freely.
 * Descriptions only state what is visible in the photographs. `details`
 * (metal, stones, sizes, price) is deliberately empty: fill it from the
 * maison's verified records, and the piece page will show it automatically.
 */

export type Atmosphere = "obsidian" | "emerald" | "ivory";

export type Piece = {
  slug: string;
  name: string;
  media: MediaKey;
  /** Collections this piece appears in; the first is its home collection. */
  collections: CollectionSlug[];
  summary: string;
  /** Observations a visitor can verify from the photograph. */
  observed: string[];
  alt: string;
  atmosphere: Atmosphere;
  /** Focal point the loupe opens on, by name in media.ts */
  loupeAt: string;
  /** Verified specifications. Empty until supplied by the maison. */
  details: { label: string; value: string }[];
};

export type CollectionSlug = "rings" | "necklaces" | "statement" | "bridal";

export type Collection = {
  slug: CollectionSlug;
  name: string;
  line: string;
  cover: string; // piece slug used as the cover image
};

export const pieces: Piece[] = [
  {
    slug: "dawn-solitaire",
    name: "Dawn Solitaire",
    media: "brilliance",
    collections: ["rings", "bridal"],
    summary:
      "A round brilliant stone held high in four claws above a slender, polished band.",
    observed: [
      "Round brilliant-cut centre stone",
      "Four-claw setting",
      "White-metal band that divides at the shoulders",
    ],
    alt: "A round brilliant solitaire ring in a four-claw setting on black velvet, lit by warm points of light.",
    atmosphere: "obsidian",
    loupeAt: "stone",
    details: [],
  },
  {
    slug: "emerald-halo-ring",
    name: "Emerald Halo Ring",
    media: "emerald",
    collections: ["statement", "rings"],
    summary:
      "A rectangular step-cut green stone framed by round and pear-shaped stones, set in yellow gold.",
    observed: [
      "Rectangular step-cut green centre stone",
      "Halo of round and pear-shaped white stones",
      "Green baguette set into the shoulder",
      "Yellow-gold band and claws",
    ],
    alt: "An emerald-cut green stone ring with a halo of white stones and a yellow-gold band, resting in folds of green satin.",
    atmosphere: "emerald",
    loupeAt: "stone",
    details: [],
  },
  {
    slug: "pearl-drop-pendant",
    name: "Pearl Drop Pendant",
    media: "pearl",
    collections: ["necklaces"],
    summary:
      "A single round white pearl on a gold bail, suspended from a fine gold cable chain.",
    observed: ["Round white pearl", "Gold bail", "Fine gold cable chain"],
    alt: "A gold chain necklace with a single round white pearl pendant lying on ivory satin.",
    atmosphere: "ivory",
    loupeAt: "pearl",
    details: [],
  },
  {
    slug: "eternal-solitaire",
    name: "Eternal Solitaire",
    media: "solitaire",
    collections: ["bridal", "rings"],
    summary:
      "A round brilliant centre stone in a four-claw setting on a polished white-metal band.",
    observed: [
      "Round brilliant-cut centre stone",
      "Four-claw setting",
      "Polished white-metal band",
    ],
    alt: "A round brilliant solitaire engagement ring on a ridged black velvet pedestal under a narrow light.",
    atmosphere: "obsidian",
    loupeAt: "stone",
    details: [],
  },
];

export const collections: Collection[] = [
  {
    slug: "rings",
    name: "Rings",
    line: "Solitaires and halo settings, each built around a single stone.",
    cover: "dawn-solitaire",
  },
  {
    slug: "necklaces",
    name: "Necklaces",
    line: "Fine chains and pendants, made to sit close.",
    cover: "pearl-drop-pendant",
  },
  {
    slug: "statement",
    name: "Statement Pieces",
    line: "Colour and scale for the evenings that ask for more.",
    cover: "emerald-halo-ring",
  },
  {
    slug: "bridal",
    name: "Bridal",
    line: "Solitaires for the promise, and for every day after it.",
    cover: "eternal-solitaire",
  },
];

export function getPiece(slug: string) {
  return pieces.find((p) => p.slug === slug);
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function piecesIn(slug: CollectionSlug) {
  return pieces.filter((p) => p.collections.includes(slug));
}

export function homeCollection(piece: Piece) {
  return getCollection(piece.collections[0])!;
}
