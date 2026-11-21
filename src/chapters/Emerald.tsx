"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Photo } from "@/components/Photo";
import { Film } from "@/components/Film";
import { ChapterMark, Grain } from "@/components/Cinema";
import { media } from "@/content/media";
import { getPiece } from "@/content/catalogue";
import { asset } from "@/lib/paths";
import { useMotion } from "@/lib/motion";

const STONE = media.emerald.focal.stone;

const DETAILS = [
  { k: "emerald-halo" as const, text: "Round and pear-shaped stones gathered around the green in yellow gold." },
  { k: "emerald-shoulder" as const, text: "A green baguette set into the shoulder." },
];

/**
 * Chapter III — The Emerald Experience.
 * The black warms into deep emerald under champagne light. The ring opens out
 * of the silk, the camera eases toward the stone, and two close-ups follow.
 */
export function Emerald() {
  const root = useRef<HTMLElement>(null);
  const silk = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const piece = getPiece("emerald-halo-ring")!;

  useMotion(root, ({ desktop, reduce }) => {
    if (reduce) return;
    const sec = root.current!;

    // Layered silk drifts slower than the page.
    gsap.fromTo(silk.current, { yPercent: -8, scale: 1.15 }, {
      yPercent: 8,
      scale: 1.05,
      ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true },
    });

    // The ring opens from the silk, then the camera eases toward the stone.
    gsap.set(inner.current, { transformOrigin: `${STONE.x * 100}% ${STONE.y * 100}%` });
    const ring = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: reveal.current, start: "top 92%", end: "bottom 8%", scrub: 1 },
    });
    ring
      .fromTo(reveal.current, { clipPath: "inset(16% 12% 16% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.38, ease: "power2.out" }, 0)
      .fromTo(inner.current, { scale: 1.28 }, { scale: 1, duration: 0.38, ease: "power2.out" }, 0)
      .to(inner.current, { scale: desktop ? 1.14 : 1.08, duration: 0.62 }, 0.38);

    // Words.
    const heading = sec.querySelector<HTMLElement>("[data-heading]")!;
    const split = SplitText.create(heading, { type: "words", mask: "words" });
    gsap.from(split.words, {
      yPercent: 110,
      duration: 1.3,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: { trigger: heading, start: "top 82%", toggleActions: "play none none reverse" },
    });
    gsap.from(gsap.utils.toArray<HTMLElement>("[data-fade]", sec), {
      opacity: 0,
      y: 16,
      duration: 1.1,
      stagger: 0.14,
      ease: "power2.out",
      scrollTrigger: { trigger: heading, start: "top 72%", toggleActions: "play none none reverse" },
    });

    // Close-ups arrive one after the other.
    gsap.utils.toArray<HTMLElement>("[data-detail]", sec).forEach((el, i) => {
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          delay: i * 0.18,
          ease: "power3.inOut",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
        },
      );
    });
  });

  return (
    <section
      ref={root}
      id="chapter-emerald"
      aria-labelledby="emerald-title"
      data-atmo="emerald"
      data-tone="dark"
      className="relative overflow-hidden py-[16vh]"
    >
      {/* Layered silk: the photograph's own satin, blurred, as the room's walls */}
      <div ref={silk} aria-hidden="true" className="absolute inset-[-12%] opacity-45 will-change-transform">
        <picture>
          <source type="image/avif" srcSet={asset("/images/emerald-silk.avif")} />
          <img src={asset("/images/emerald-silk.webp")} alt="" className="h-full w-full object-cover" />
        </picture>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 70% 46%, rgb(198 164 107 / 0.2), transparent 62%), linear-gradient(to bottom, #0b0b0d 0%, rgb(6 40 32 / 0.4) 22%, rgb(6 40 32 / 0.55) 78%, rgb(6 40 32 / 0.9) 100%)",
        }}
      />
      {/* Optional transition veil (Higgsfield T1), faded in over the top of the room */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[45vh] [mask-image:linear-gradient(to_bottom,#000_40%,transparent)]">
        <Film slot="veilEmerald" className="h-full w-full object-cover opacity-60" />
      </div>
      <Grain opacity={0.6} />

      <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-14 px-6 md:px-[6vw] min-[900px]:grid-cols-12 min-[900px]:gap-x-8">
        <div className="min-[900px]:col-span-5 min-[900px]:row-start-1">
          <ChapterMark id="emerald" />
          <h2 id="emerald-title" data-heading className="t-display mt-8">
            A Touch of the Extraordinary.
          </h2>
          <p data-fade className="t-sub mt-6">
            Captivating color. Enduring elegance.
          </p>

          <ul className="mt-12 grid max-w-[30rem] grid-cols-2 gap-5">
            {DETAILS.map((d) => (
              <li key={d.k}>
                <div data-detail className="relative aspect-square overflow-hidden">
                  <Photo k={d.k} alt="" decorative sizes="(min-width: 900px) 15vw, 44vw" className="h-full w-full" imgClassName="h-full w-full object-cover" />
                </div>
                <p data-fade className="t-small mt-3">
                  {d.text}
                </p>
              </li>
            ))}
          </ul>

          <div data-fade className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href={`/pieces/${piece.slug}/`} className="btn">
              View the {piece.name}
            </Link>
            <Link href="/collections/statement/" className="link-line">
              Statement Pieces
            </Link>
          </div>
        </div>

        <figure className="m-0 min-[900px]:col-span-7 min-[900px]:col-start-6 min-[900px]:row-start-1">
          <div ref={reveal} className="relative aspect-square overflow-hidden shadow-[0_60px_120px_-40px_rgb(0_0_0/0.7)]">
            <div ref={inner} className="absolute inset-0 will-change-transform">
              <Photo k="emerald" alt={piece.alt} sizes="(min-width: 900px) 52vw, 92vw" className="h-full w-full" imgClassName="h-full w-full object-cover" />
              <Film slot="emerald" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
          <figcaption className="t-small mt-4 flex justify-between gap-6 text-[var(--fg-faint)]">
            <span>{piece.name}</span>
            <span className="hidden sm:inline">Statement Pieces</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
