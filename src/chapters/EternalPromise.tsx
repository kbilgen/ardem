"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Photo } from "@/components/Photo";
import { Film } from "@/components/Film";
import { Particles } from "@/components/Particles";
import { ChapterMark, Grain, Vignette } from "@/components/Cinema";
import { media } from "@/content/media";
import { getPiece } from "@/content/catalogue";
import { coverPoint, positionFor, useMotion } from "@/lib/motion";

const M = media.solitaire;
const STONE = M.focal.stone;

/**
 * Chapter V — The Eternal Promise. The emotional climax.
 * Darkness on black velvet. A narrow beam finds the stone; the camera dollies
 * slowly toward it; the light widens across the pedestal; the promise is spoken.
 */
export function EternalPromise() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const piece = getPiece("eternal-solitaire")!;

  useMotion(root, ({ desktop, reduce }) => {
    const sec = root.current!;
    const img = cam.current!.querySelector("img")!;
    const frame = () => {
      const box = stage.current!.getBoundingClientRect();
      const pos = positionFor(box, M, STONE, { x: 0.5, y: box.height > box.width ? 0.36 : 0.38 });
      img.style.objectPosition = `${(pos.x * 100).toFixed(2)}% ${(pos.y * 100).toFixed(2)}%`;
      const p = coverPoint(box, M, STONE, pos);
      spot.current!.style.setProperty("--sx", `${p.x}px`);
      spot.current!.style.setProperty("--sy", `${p.y}px`);
      gsap.set(cam.current, { transformOrigin: `${p.x}px ${p.y}px` });
      // A narrow shaft from above-left, widening onto the stone.
      const r = 0.1 * M.width * p.scale;
      const top = p.x - box.width * 0.07;
      beam.current!.style.clipPath = `polygon(${top - 30}px -40px, ${top + 30}px -40px, ${p.x + r * 1.5}px ${p.y + r * 0.5}px, ${p.x - r * 1.5}px ${p.y + r * 0.5}px)`;
    };
    frame();
    const ro = new ResizeObserver(frame);
    ro.observe(stage.current!);

    if (reduce) {
      spot.current!.classList.add("is-open");
      gsap.set(beam.current, { opacity: 0 });
      return () => ro.disconnect();
    }

    const heading = sec.querySelector<HTMLElement>("[data-heading]")!;
    const split = SplitText.create(heading, { type: "words", mask: "words" });
    const after = gsap.utils.toArray<HTMLElement>("[data-after]", sec);

    gsap.set(spot.current, { "--ri": "6vmin", "--rs": "0vmax" });
    gsap.set(beam.current, { opacity: 0 });
    gsap.set(split.words, { yPercent: 115 });
    gsap.set(after, { autoAlpha: 0, y: 14 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sec,
        start: "top top",
        end: desktop ? "+=220%" : "+=170%",
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      },
    });
    tl.to(beam.current, { opacity: 1, duration: 0.18, ease: "power1.out" }, 0)
      .fromTo(cam.current, { scale: 1 }, { scale: desktop ? 1.18 : 1.12, duration: 0.7, ease: "power1.inOut" }, 0)
      .to(spot.current, { "--ri": "24vmin", duration: 0.45, ease: "power1.inOut" }, 0.05)
      .to(spot.current, { "--rs": "150vmax", duration: 0.3, ease: "power2.in" }, 0.45)
      .to(beam.current, { opacity: 0.35, duration: 0.25 }, 0.5)
      .to(split.words, { yPercent: 0, duration: 0.22, stagger: 0.025, ease: "power3.out" }, 0.62)
      .to(after, { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.05, ease: "power2.out" }, 0.76)
      .to({}, { duration: 0.12 });

    return () => ro.disconnect();
  });

  return (
    // Stable wrapper: holds the pin spacer, so its height is the chapter's full scroll length
    <div data-pin-wrap>
    <section
      ref={root}
      id="chapter-promise"
      aria-labelledby="promise-title"
      data-atmo="obsidian"
      data-tone="dark"
      className="relative h-[100svh] min-h-[560px] overflow-hidden"
    >
      {/* On portrait screens the stage extends above the frame so the stone can sit higher, clear of the words */}
      <div ref={stage} className="absolute inset-x-0 bottom-0 top-0 portrait:-top-[26vh]">
        <div ref={spot} className="spot absolute inset-0">
          <div ref={cam} className="absolute inset-0 will-change-transform">
            <Photo
              k="solitaire"
              alt={piece.alt}
              sizes="100vw"
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
              imgStyle={{ objectPosition: "61% 69%" }}
            />
            <Film slot="promise" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
        {/* Blur sits outside the clip so the shaft has soft, atmospheric edges */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ filter: "blur(28px)" }}>
          <div
            ref={beam}
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgb(255 238 210 / 0.0), rgb(255 238 210 / 0.12) 55%, rgb(255 238 210 / 0.2) 85%, rgb(255 238 210 / 0.04))" }}
          />
        </div>
        <Particles density={0.55} shaftX={0.5} shaftWidth={0.22} />
        <Vignette />
        <Grain />
      </div>

      <div ref={copy} className="relative z-40 mx-auto flex h-full max-w-[1100px] flex-col items-center justify-end px-6 pb-[9vh] text-center">
        <ChapterMark id="promise" className="justify-center" />
        <h2 id="promise-title" data-heading className="t-display mt-6">
          Some Moments Are Forever.
        </h2>
        <p data-after className="t-sub mt-5">
          An eternal symbol of love and commitment.
        </p>
        <div data-after className="mt-9">
          <Link href="/collections/bridal/" className="btn">
            Explore Bridal Jewelry
          </Link>
        </div>
      </div>
    </section>
    </div>
  );
}
