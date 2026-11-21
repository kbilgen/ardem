"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Photo } from "@/components/Photo";
import { QuickView } from "@/components/QuickView";
import { ChapterMark } from "@/components/Cinema";
import { collections, getPiece, type Piece } from "@/content/catalogue";
import { site } from "@/content/site";
import { useMotion } from "@/lib/motion";

/**
 * Where each collection hangs on the wall: an asymmetric two-column hang with
 * staggered heights, so no two frames line up like product cards.
 */
const HANG: Record<string, { li: string; aspect: string; sizes: string }> = {
  rings: { li: "min-[900px]:col-start-1 min-[900px]:col-span-7", aspect: "aspect-[10/7]", sizes: "(min-width: 900px) 56vw, 92vw" },
  statement: { li: "min-[900px]:col-start-9 min-[900px]:col-span-4 min-[900px]:mt-[24vh]", aspect: "aspect-[4/5]", sizes: "(min-width: 900px) 30vw, 80vw" },
  necklaces: { li: "min-[900px]:col-start-2 min-[900px]:col-span-4 min-[900px]:-mt-[6vh]", aspect: "aspect-[3/4]", sizes: "(min-width: 900px) 30vw, 80vw" },
  bridal: { li: "min-[900px]:col-start-7 min-[900px]:col-span-6 min-[900px]:mt-[14vh]", aspect: "aspect-square", sizes: "(min-width: 900px) 46vw, 92vw" },
};
const ORDER = ["rings", "statement", "necklaces", "bridal"] as const;

/**
 * Chapter VI — The ARDEM World. The collections hang like a small exhibition;
 * every piece opens a quick view or leads into its collection, and the film
 * closes on the brand.
 */
export function ArdemWorld() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Piece | null>(null);
  const close = useCallback(() => setActive(null), []);

  useMotion(root, ({ reduce }) => {
    if (reduce) return;
    const sec = root.current!;
    gsap.utils.toArray<HTMLElement>("[data-hang]", sec).forEach((el) => {
      const frame = el.querySelector("[data-frame]");
      const label = el.querySelector("[data-label]");
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" } })
        .fromTo(frame, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power3.inOut" })
        .from(label, { opacity: 0, y: 12, duration: 0.9, ease: "power2.out" }, 0.8);
    });

    // Finale: the name gathers itself as it comes into the light.
    const mark = sec.querySelector("[data-finale-mark]");
    gsap.fromTo(mark, { letterSpacing: "0.55em", opacity: 0.15 }, {
      letterSpacing: "0.2em",
      opacity: 1,
      ease: "none",
      scrollTrigger: { trigger: mark, start: "top 95%", end: "top 45%", scrub: 1 },
    });
    gsap.from(gsap.utils.toArray<HTMLElement>("[data-finale]", sec), {
      opacity: 0,
      y: 16,
      duration: 1.2,
      stagger: 0.15,
      scrollTrigger: { trigger: mark, start: "top 60%", toggleActions: "play none none reverse" },
    });
  });

  return (
    <section
      ref={root}
      id="chapter-world"
      aria-labelledby="world-title"
      data-atmo="champagne"
      data-tone="dark"
      className="relative overflow-hidden pt-[18vh]"
    >
      <header className="mx-auto grid max-w-[1320px] gap-8 px-6 md:px-10 min-[900px]:grid-cols-12">
        <div className="min-[900px]:col-span-6">
          <ChapterMark id="world" />
          <h2 id="world-title" className="t-display mt-8">
            The Collections
          </h2>
        </div>
        <p className="t-body self-end min-[900px]:col-span-4 min-[900px]:col-start-9">
          Four pieces, four ways in. Open any piece for a closer look, or ask to see it in private.
        </p>
      </header>

      <ul className="mx-auto mt-[12vh] grid max-w-[1320px] gap-y-20 px-6 md:px-10 min-[900px]:grid-cols-12 min-[900px]:gap-x-8 min-[900px]:gap-y-[8vh]">
        {ORDER.map((slug, i) => {
          const c = collections.find((x) => x.slug === slug)!;
          const p = getPiece(c.cover)!;
          const h = HANG[slug];
          return (
            <li key={slug} data-hang className={`${h.li} ${i % 2 ? "ml-[10%] min-[900px]:ml-0" : "mr-[6%] min-[900px]:mr-0"}`}>
              <article aria-labelledby={`hang-${slug}`}>
                <Link
                  href={`/pieces/${p.slug}/`}
                  data-frame
                  data-cursor="view"
                  data-cursor-label="View"
                  className={`frame-hover block ${h.aspect}`}
                  aria-label={`${p.name}, view the piece`}
                >
                  <Photo k={p.media} alt={p.alt} sizes={h.sizes} className="h-full w-full" imgClassName="h-full w-full object-cover" />
                  <span aria-hidden="true" className="glint" />
                </Link>
                <div data-label className="wall-label mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  <div>
                    <h3 id={`hang-${slug}`} className="font-serif text-[1.85rem] font-light leading-tight">
                      {c.name}
                    </h3>
                    <p className="t-small">{p.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-6">
                    <button type="button" className="link-line" onClick={() => setActive(p)} aria-haspopup="dialog">
                      Quick view
                    </button>
                    <Link href={`/collections/${c.slug}/`} className="link-line">
                      Discover {c.name}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="relative mt-[22vh] overflow-hidden px-6 pb-[20vh] pt-[8vh] text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 60% at 50% 55%, rgb(198 164 107 / 0.14), transparent 70%)" }}
        />
        <p data-finale-mark className="wordmark relative text-[clamp(3.6rem,15vw,12.5rem)]">
          ARDEM
        </p>
        <p data-finale className="relative mt-6 font-serif text-[clamp(1.5rem,2.6vw,2.4rem)] font-light italic">
          {site.closing}
        </p>
        <div data-finale className="relative mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Link href="/collections/" className="btn">
            Explore All Collections
          </Link>
          <Link href="/appointment/" className="btn">
            Book a Private Appointment
          </Link>
        </div>
      </div>

      <QuickView piece={active} onClose={close} />
    </section>
  );
}
