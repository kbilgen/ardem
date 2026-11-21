/**
 * Site-wide content and business details.
 *
 * EDIT BEFORE LAUNCH — every value marked `placeholder: true` (or commented
 * PLACEHOLDER) is a stand-in, not a real ARDEM detail. Nothing on this site
 * states prices, certifications, gem specifications, stock levels or company
 * history; add those only from verified sources.
 */

export const site = {
  name: "ARDEM",
  tagline: "Where Elegance Becomes Eternal.",
  subline: "An Expression of Timeless Beauty.",
  closing: "Elegance Is Eternal.",
  description:
    "ARDEM fine jewellery. Solitaires, an emerald halo ring and a pearl pendant, presented as a private viewing.",
  url: "https://ardem.example", // PLACEHOLDER: production domain

  contact: {
    email: "concierge@ardem.example", // PLACEHOLDER
    placeholder: true,
  },

  /**
   * Where appointment requests are sent. Leave empty to have the form prepare
   * an email to `contact.email` instead (no backend required). Set to any
   * endpoint that accepts a JSON POST (Formspree, a Next route handler, a CRM
   * webhook) to submit directly.
   */
  appointmentEndpoint: "",

  social: [
    // PLACEHOLDER: replace with ARDEM's own profile URLs
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Pinterest", href: "https://www.pinterest.com/" },
  ],

  nav: {
    left: [
      { label: "Collections", href: "/collections/" },
      { label: "Bridal", href: "/collections/bridal/" },
    ],
    right: { label: "Private Appointment", href: "/appointment/" },
  },
} as const;

/** The six chapters of the home page, in scroll order. */
export const chapters = [
  { id: "arrival", numeral: "I", title: "The Arrival" },
  { id: "brilliance", numeral: "II", title: "The Art of Brilliance" },
  { id: "emerald", numeral: "III", title: "The Emerald Experience" },
  { id: "gold", numeral: "IV", title: "The Poetry of Gold" },
  { id: "promise", numeral: "V", title: "The Eternal Promise" },
  { id: "world", numeral: "VI", title: "The ARDEM World" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

export function chapter(id: ChapterId) {
  return chapters.find((c) => c.id === id)!;
}
