"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Photo } from "@/components/Photo";
import { Film } from "@/components/Film";
import { Particles } from "@/components/Particles";
import { Grain, Vignette } from "@/components/Cinema";
import { media } from "@/content/media";
import { site } from "@/content/site";
import { getPiece } from "@/content/catalogue";
import { coverPoint, positionFor, useMotion } from "@/lib/motion";

const M = media.brilliance;
const STONE = M.focal.stone;

/**
 * Chapter I — The Arrival.
 * Darkness; a warm light finds a single facet; the brand rises; scrolling pulls
 * the camera back until the whole ring stands in the light, then the light dims
 * into the next chapter.
 */
export function Arrival() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const glint = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const piece = getPiece("dawn-solitaire")!;

  useMotion(root, ({ desktop, reduce }) => {
    const sec = root.current!;
    // Portrait phones end the pull-back a little wider so more of the ring shows.
    const endScale = window.matchMedia("(orientation: portrait)").matches ? 0.9 : 1;
    const img = lens.current!.querySelector("img")!;

    // Keep the stone where the composition wants it on any screen, and aim the
    // spotlight and the camera at it.
    const frame = () => {
      const box = stage.current!.getBoundingClientRect();
      const portrait = box.height > box.width;
      const target = portrait ? { x: 0.5, y: 0.4 } : { x: 0.63, y: 0.5 };
      const pos = positionFor(box, M, STONE, target);
      img.style.objectPosition = `${(pos.x * 100).toFixed(2)}% ${(pos.y * 100).toFixed(2)}%`;
      const p = coverPoint(box, M, STONE, pos);
      spot.current!.style.setProperty("--sx", `${p.x}px`);
      spot.current!.style.setProperty("--sy", `${p.y}px`);
      gsap.set([cam.current, lens.current], { transformOrigin: `${p.x}px ${p.y}px` });
    };
    frame();
    const ro = new ResizeObserver(frame);
    ro.observe(stage.current!);

    if (reduce) {
      spot.current!.classList.add("is-open");
      return () => ro.disconnect();
    }

    const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", sec);
    const lines = gsap.utils.toArray<HTMLElement>("[data-line]", sec);

    // Opening: light finds the stone.
    gsap.set(spot.current, { "--ri": "0vmin", "--rs": "0vmax" });
    gsap.set(lens.current, { scale: 1.3, filter: desktop ? "blur(10px)" : "none" });
    gsap.set(dim.current, { opacity: 0.55 });
    const intro = gsap.timeline({ delay: 0.25 });
    intro
      .to(spot.current, { "--ri": desktop ? "30vmin" : "36vmin", duration: 2.8, ease: "power2.inOut" }, 0)
      .to(lens.current, { scale: 1, filter: desktop ? "blur(0px)" : "none", duration: 3.2, ease: "power3.out" }, 0.1)
      .to(dim.current, { opacity: 0, duration: 2.6, ease: "power2.out" }, 0.2)
      .set(glint.current, { opacity: 1 }, 1.1)
      .fromTo(glint.current, { backgroundPosition: "120% 0" }, { backgroundPosition: "-30% 0", duration: 2.4, ease: "power1.inOut" }, 1.1)
      .to(glint.current, { opacity: 0, duration: 0.8 }, 3.0)
      .fromTo(
        letters,
        { yPercent: 35, opacity: 0, filter: "blur(8px)" },
        { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1.7, stagger: 0.09, ease: "power3.out" },
        0.9,
      )
      .fromTo(lines, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.14, ease: "power2.out" }, 1.6);

    // Scroll: the camera pulls back to reveal the ring, holds, then the light dims.
    const scroll = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sec,
        start: "top top",
        end: desktop ? "+=140%" : "+=100%",
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => {
          // If the visitor scrolls before the opening finishes, hurry it along.
          if (self.progress > 0.02 && intro.isActive()) intro.timeScale(3);
        },
      },
    });
    scroll
      .fromTo(spot.current, { "--rs": "0vmax" }, { "--rs": "160vmax", duration: 0.62, ease: "power1.in" }, 0)
      .fromTo(cam.current, { scale: 1.55 }, { scale: endScale, duration: 0.62, ease: "power2.inOut" }, 0)
      .to(copy.current, { yPercent: -12, opacity: 0, duration: 0.26, ease: "power1.in" }, 0.18)
      .fromTo(dim.current, { opacity: 0 }, { opacity: 0.86, duration: 0.2, immediateRender: false }, 0.8);

    return () => ro.disconnect();
  });

  return (
    // Stable wrapper: holds the pin spacer, so its height is the chapter's full scroll length
    <div data-pin-wrap>
    <section
      ref={root}
      id="chapter-arrival"
      aria-label="The Arrival"
      data-atmo="obsidian"
      data-tone="dark"
      className="relative h-[100svh] min-h-[560px] overflow-hidden"
    >
      {/* On portrait screens the stage extends above the frame so the stone sits higher, clear of the name */}
      <div ref={stage} className="absolute inset-x-0 bottom-0 top-0 portrait:-top-[18vh]">
        <div ref={spot} className="spot absolute inset-0">
          <div ref={cam} className="absolute inset-0 will-change-transform">
            <div ref={lens} className="absolute inset-0 will-change-transform">
              <Photo
                k="brilliance"
                alt={piece.alt}
                sizes="100vw"
                priority
                className="absolute inset-0 h-full w-full"
                imgClassName="h-full w-full object-cover"
                imgStyle={{ objectPosition: "69% 50%" }}
              />
              <Film slot="arrival" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
          <div ref={glint} className="glint" />
        </div>
        <div ref={dim} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-obsidian opacity-0" />
        <Particles density={0.7} />
        <Vignette />
        <Grain />
      </div>

      <div ref={copy} className="relative z-40 mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-[11vh] md:px-[6vw]">
        <h1 className="wordmark text-[clamp(4.2rem,15.5vw,13rem)] min-[900px]:text-[clamp(5rem,8.4vw,10rem)]" aria-label="ARDEM">
          {"ARDEM".split("").map((l, i) => (
            <span key={i} data-letter data-intro aria-hidden="true" className="inline-block">
              {l}
            </span>
          ))}
        </h1>
        <p data-line data-intro className="mt-5 font-serif text-[clamp(1.5rem,2.5vw,2.25rem)] font-light italic leading-tight text-ivory">
          {site.tagline}
        </p>
        <p data-line data-intro className="t-body mt-2">
          {site.subline}
        </p>
        <div data-line data-intro className="mt-9 flex flex-wrap items-center justify-between gap-8">
          <Link href="/collections/" className="btn">
            Explore the Collections
          </Link>
          <a href="#chapter-brilliance" className="hidden items-center gap-4 text-xs tracking-[0.08em] text-[var(--fg-soft)] sm:inline-flex">
            Scroll to begin
            <span className="scroll-cue" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
    </div>
  );
}
