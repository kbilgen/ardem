"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Photo, photoUrl } from "@/components/Photo";
import { ChapterMark, Grain } from "@/components/Cinema";
import { media, type FocalPoint } from "@/content/media";
import { getPiece } from "@/content/catalogue";
import { useMotion } from "@/lib/motion";

const M = media.brilliance;

/** The loupe tour: where it rests, and what the visitor is looking at. */
const STOPS: { at: FocalPoint; title: string; text: string }[] = [
  { at: M.focal.stone, title: "The crown", text: "Light enters through the table and returns from the facets beneath it." },
  { at: M.focal.claw, title: "Four claws", text: "The stone sits high in four claws, open to light from every side." },
  { at: M.focal.band, title: "The band", text: "A slender band, divided at the shoulders, carries the light around the hand." },
];

/**
 * Chapter II — The Art of Brilliance.
 * A jeweller's loupe tours the ring in near-darkness: the crown, a claw, the
 * band. Each stop lifts the light a little more, until the loupe is set down
 * and the whole ring stands in a clean composition beside the words.
 */
export function Brilliance() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const loupe = useRef<HTMLDivElement>(null);
  const loupeImg = useRef<HTMLImageElement>(null);
  const finale = useRef<HTMLDivElement>(null);
  const piece = getPiece("dawn-solitaire")!;

  useMotion(root, ({ desktop, reduce }) => {
    const sec = root.current!;
    if (reduce) return;
    sec.dataset.tour = "on";

    const K = desktop ? 2.3 : 2.6; // magnification
    const state = { x: STOPS[0].at.x, y: STOPS[0].at.y, o: 0, s: 0.86 };
    let w = 0;
    let h = 0;
    let d = 0;
    const measure = () => {
      const r = frame.current!.getBoundingClientRect();
      w = r.width;
      h = r.height;
      d = Math.round(Math.min(Math.max(h * 0.56, 132), 340));
      gsap.set(loupe.current, { width: d, height: d });
      gsap.set(loupeImg.current, { width: w * K, height: h * K });
      apply();
    };
    const apply = () => {
      const cx = state.x * w;
      const cy = state.y * h;
      gsap.set(loupe.current, { x: cx - d / 2, y: cy - d / 2, opacity: state.o, scale: state.s });
      gsap.set(loupeImg.current, { x: d / 2 - cx * K, y: d / 2 - cy * K });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame.current!);

    const captions = gsap.utils.toArray<HTMLElement>("[data-caption]", sec);
    const heading = sec.querySelector<HTMLElement>("[data-heading]")!;
    const split = SplitText.create(heading, { type: "words", mask: "words" });
    const after = gsap.utils.toArray<HTMLElement>("[data-after]", sec);

    gsap.set(captions, { autoAlpha: 0, y: 14 });
    gsap.set(finale.current, { autoAlpha: 1 });
    gsap.set(split.words, { yPercent: 110 });
    gsap.set(after, { autoAlpha: 0, y: 12 });
    gsap.set(shade.current, { opacity: 0.9 });

    const tl = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: {
        trigger: sec,
        start: "top top",
        end: desktop ? "+=280%" : "+=220%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });
    const move = (to: FocalPoint, at: number) => tl.to(state, { x: to.x, y: to.y, duration: 1, onUpdate: apply }, at);
    const showCaption = (i: number, at: number) => {
      if (i > 0) tl.to(captions[i - 1], { autoAlpha: 0, y: -12, duration: 0.4 }, at);
      tl.to(captions[i], { autoAlpha: 1, y: 0, duration: 0.5 }, at + 0.3);
    };

    // 1 — the crown, in near-darkness
    tl.to(state, { o: 1, s: 1, duration: 0.8, ease: "power2.out", onUpdate: apply }, 0);
    showCaption(0, 0.1);
    tl.to(state, { x: STOPS[0].at.x + 0.015, y: STOPS[0].at.y - 0.02, duration: 1.2, onUpdate: apply }, 0.8);
    // 2 — a claw; the setting begins to show
    move(STOPS[1].at, 2.1);
    tl.to(shade.current, { opacity: 0.72, duration: 1 }, 2.1);
    showCaption(1, 2.3);
    // 3 — the band
    move(STOPS[2].at, 3.9);
    tl.to(shade.current, { opacity: 0.5, duration: 1 }, 3.9);
    showCaption(2, 4.1);
    // 4 — the loupe is set down; the ring in full light
    tl.to(state, { o: 0, s: 1.12, duration: 0.7, ease: "power2.in", onUpdate: apply }, 5.6);
    tl.to(captions[2], { autoAlpha: 0, y: -12, duration: 0.4 }, 5.6);
    tl.to(shade.current, { opacity: 0, duration: 1.1 }, 5.8);
    tl.fromTo(frame.current, { scale: 1.04 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 5.8);
    // 5 — the words
    tl.to(split.words, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "power3.out" }, 6.4);
    tl.to(after, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.15 }, 6.9);
    tl.to({}, { duration: 0.8 }); // hold

    return () => {
      ro.disconnect();
      delete sec.dataset.tour;
    };
  });

  return (
    // Stable wrapper: holds the pin spacer, so its height is the chapter's full scroll length
    <div data-pin-wrap>
    <section
      ref={root}
      id="chapter-brilliance"
      aria-labelledby="brilliance-title"
      data-atmo="obsidian"
      data-tone="dark"
      className="relative"
    >
      <div className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pb-14 pt-24 md:px-[6vw]">
        <Grain opacity={0.7} />
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-10 min-[900px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] min-[900px]:gap-[5vw]">
          <figure className="relative m-0">
            <div ref={frame} className="relative w-full will-change-transform" style={{ aspectRatio: `${M.width} / ${M.height}` }}>
              <div className="absolute inset-0 overflow-hidden">
                <Photo k="brilliance" alt={piece.alt} sizes="(min-width: 900px) 58vw, 92vw" className="h-full w-full" imgClassName="h-full w-full object-cover" />
                <div ref={shade} aria-hidden="true" className="absolute inset-0 bg-obsidian opacity-0" />
              </div>
              <div ref={loupe} className="loupe opacity-0" aria-hidden="true">
                <img ref={loupeImg} src={photoUrl("brilliance")} alt="" loading="lazy" decoding="async" draggable={false} />
              </div>
            </div>
            <figcaption className="t-small mt-4 text-[var(--fg-faint)]">{piece.name}</figcaption>
          </figure>

          <div className="relative">
            <ChapterMark id="brilliance" />
            <div className="tour-stack mt-8">
              {STOPS.map((s) => (
                <div key={s.title} data-caption className="tour-caption">
                  <p className="font-serif text-[1.6rem] italic leading-tight text-gold">{s.title}</p>
                  <p className="t-body mt-2 max-w-[26em]">{s.text}</p>
                </div>
              ))}
              <div ref={finale} className="tour-final">
                <h2 id="brilliance-title" data-heading className="t-display">
                  Every Facet Tells a Story.
                </h2>
                <p data-after className="t-sub mt-6">
                  A celebration of light, detail, and extraordinary elegance.
                </p>
                <div data-after className="mt-9">
                  <Link href="/collections/rings/" className="btn">
                    Discover the Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
