import type { MediaKey } from "./media";

/**
 * Cinematic film slots.
 *
 * Each chapter is built to play a Higgsfield clip when one exists and to fall
 * back to the photographic sequence when it doesn't (or fails to load, or the
 * visitor prefers reduced motion). To add a film:
 *
 *   1. Generate it with the prompt in docs/HIGGSFIELD_PROMPTS.md
 *   2. Run scripts/encode-films.sh <raw.mp4> <slot>   → public/films/<slot>-*.mp4|webm|jpg
 *   3. Set `ready: true` for the slot below.
 *
 * The scroll choreography (spotlight, camera pull-back, loupe) stays the same;
 * the film simply replaces the still inside the same frame.
 */

export type FilmSlot = {
  /** Base filename in public/films */
  name: string;
  /** Still used as poster and as the fallback */
  poster: MediaKey;
  ready: boolean;
};

export const films = {
  arrival: { name: "arrival", poster: "brilliance", ready: false },
  emerald: { name: "emerald", poster: "emerald", ready: false },
  gold: { name: "gold", poster: "pearl-portrait", ready: false },
  promise: { name: "promise", poster: "solitaire", ready: false },
  /** Transition veils: light drifting from black into emerald silk, and ivory silk dimming to black. */
  veilEmerald: { name: "veil-emerald", poster: "emerald", ready: false },
  veilBlack: { name: "veil-black", poster: "pearl-portrait", ready: false },
} satisfies Record<string, FilmSlot>;
