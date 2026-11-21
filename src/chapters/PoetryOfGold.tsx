"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Photo } from "@/components/Photo";
import { Film } from "@/components/Film";
import { ChapterMark } from "@/components/Cinema";
import { getPiece } from "@/content/catalogue";
import { useMotion } from "@/lib/motion";

/**
 * Where the close-up sits inside the portrait crop, in fractions of the frame.
 * Both are cut from the same photograph by scripts/prepare-images.py:
 * portrait = source x 148–916, y 0–1024; close-up = x 321–751, y 389–962.
 */
const MACRO = { x: 173 / 768, y: 389 / 1024, w: 430 / 768, h: 573 / 1024 };

/**
 * Chapter IV — The Poetry of Gold.
 * An ivory room, lit from above. The pendant floats a little, the photograph drifts slower than
 * the page, and the camera pushes in until the pearl fills the frame.
 */
export function PoetryOfGold() {
  const root = useRef<HTMLElement>(null);
  const drift = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDivElement>(null);
  const macro = useRef<HTMLDivElement>(null);
  const piece = getPiece("pearl-drop-pendant")!;

  useMotion(root, ({ desktop, reduce }) => {
    if (reduce) return;
    const sec = root.current!;

    gsap.fromTo(drift.current, { y: desktop ? 70 : 30 }, {
      y: desktop ? -70 : -30,
      ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.to(float.current, { y: -9, duration: 3.8, ease: "sine.inOut", yoyo: true, repeat: -1 });

    // Push in toward the pearl; the close-up (cut from the same photograph and
    // laid exactly over its own region) dissolves in as the camera arrives.
    const push = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: drift.current, start: "top 35%", end: "bottom 30%", scrub: 1 },
    });
    push
      .to(zoom.current, { scale: 1 / MACRO.w, duration: 1, ease: "power1.inOut" }, 0)
      .fromTo(macro.current, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.45);

    const heading = sec.querySelector<HTMLElement>("[data-heading]")!;
    const split = SplitText.create(heading, { type: "words", mask: "words" });
    gsap.from(split.words, {
      yPercent: 110,
      duration: 1.4,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: { trigger: heading, start: "top 82%", toggleActions: "play none none reverse" },
    });
    gsap.from(gsap.utils.toArray<HTMLElement>("[data-fade]", sec), {
      opacity: 0,
      y: 14,
      duration: 1.2,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: { trigger: heading, start: "top 72%", toggleActions: "play none none reverse" },
    });
  });

  return (
    <section
      ref={root}
      id="chapter-gold"
      aria-labelledby="gold-title"
      data-atmo="ivory"
      data-tone="light"
      className="relative overflow-hidden pb-[34vh] pt-[28vh]"
    >
      {/* The ivory room: light rises in from the emerald above and dims into the black below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgb(247 243 235 / 0) 0, #f7f3eb 22vh, #f7f3eb calc(100% - 30vh), #0b0b0d 100%)" }}
      />

      {/* Optional transition veil (Higgsfield T2): the silk dims into the velvet below */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[34vh] [mask-image:linear-gradient(to_top,#000_35%,transparent)]">
        <Film slot="veilBlack" className="h-full w-full object-cover" />
      </div>

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-6 md:px-[6vw] min-[900px]:grid-cols-12 min-[900px]:gap-x-8">
        <figure className="m-0 min-[900px]:col-span-5 min-[900px]:col-start-2">
          <div ref={drift} className="will-change-transform">
            <div ref={float} className="relative aspect-[3/4] overflow-hidden shadow-[0_50px_90px_-50px_rgb(80_60_30/0.45)]">
              <div
                ref={zoom}
                className="absolute inset-0 will-change-transform"
                style={{ transformOrigin: `${(MACRO.x + MACRO.w / 2) * 100}% ${(MACRO.y + MACRO.h / 2) * 100}%` }}
              >
                <Photo k="pearl-portrait" alt={piece.alt} sizes="(min-width: 900px) 36vw, 92vw" className="h-full w-full" imgClassName="h-full w-full object-cover" />
                <div
                  ref={macro}
                  className="absolute opacity-0"
                  style={{ left: `${MACRO.x * 100}%`, top: `${MACRO.y * 100}%`, width: `${MACRO.w * 100}%`, height: `${MACRO.h * 100}%` }}
                >
                  <Photo k="pearl-macro" alt="" decorative sizes="(min-width: 900px) 36vw, 92vw" className="h-full w-full" imgClassName="h-full w-full object-cover" />
                </div>
              </div>
              <Film slot="gold" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
          <figcaption className="t-small mt-5 text-[var(--fg-faint)]">{piece.name}</figcaption>
        </figure>

        <div className="min-[900px]:col-span-5 min-[900px]:col-start-8">
          <ChapterMark id="gold" />
          <h2 id="gold-title" data-heading className="t-display mt-8">
            Beauty in Its Purest Form.
          </h2>
          <p data-fade className="t-sub mt-6">
            Gracefully created for life&rsquo;s unforgettable moments.
          </p>
          <p data-fade className="t-body mt-8">
            {piece.summary}
          </p>
          <div data-fade className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href={`/pieces/${piece.slug}/`} className="btn">
              View the {piece.name}
            </Link>
            <Link href="/collections/necklaces/" className="link-line">
              Necklaces
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
