"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsap } from "@/lib/motion";

/** The four atmospheres the story moves through. */
export const ATMOSPHERES = {
  obsidian: "#0b0b0d",
  champagne: "#17130d", // black warmed by gold light
  emerald: "#062820",
  ivory: "#f7f3eb",
} as const;

export type AtmosphereName = keyof typeof ATMOSPHERES;

/**
 * One fixed colour field behind the whole page. Sections declare
 * data-atmo="emerald" (etc.) and data-tone="light|dark"; the field cross-fades
 * between the dark atmospheres as each section scrolls in, scrubbed so it can
 * never lag behind the content, and the navigation picks up the tone under it.
 * Light (ivory) rooms paint their own background with soft gradient edges, so
 * the page never washes through grey between ivory and black.
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    const field = ref.current;
    if (!field) return;
    const html = document.documentElement;
    const sections = gsap.utils.toArray<HTMLElement>("[data-atmo]");
    // A pinned chapter scrolls for longer than its own height: measure its wrapper.
    const span = (s: HTMLElement) => (s.closest("[data-pin-wrap]") as HTMLElement | null) ?? s;
    const color = (s: HTMLElement) => ATMOSPHERES[(s.dataset.atmo as AtmosphereName) ?? "obsidian"] ?? ATMOSPHERES.obsidian;

    const ctx = gsap.context(() => {
      if (!sections.length) {
        gsap.set(field, { backgroundColor: ATMOSPHERES.obsidian });
        html.dataset.tone = "dark";
        return;
      }
      const dark = sections.filter((s) => s.dataset.tone !== "light");
      gsap.set(field, { backgroundColor: dark[0] ? color(dark[0]) : ATMOSPHERES.obsidian });
      html.dataset.tone = sections[0].dataset.tone ?? "dark";

      dark.forEach((s, i) => {
        if (i === 0 || color(dark[i - 1]) === color(s)) return;
        // After a light room, change the field while that room covers the screen.
        const before = sections[sections.indexOf(s) - 1];
        const behindLight = before?.dataset.tone === "light";
        gsap.fromTo(
          field,
          { backgroundColor: color(dark[i - 1]) },
          {
            backgroundColor: color(s),
            ease: "none",
            immediateRender: false,
            scrollTrigger: behindLight
              ? { trigger: span(before), start: "top top", end: "bottom bottom", scrub: true }
              : { trigger: span(s), start: "top 80%", end: "top 15%", scrub: true },
          },
        );
      });
      sections.forEach((s) => {
        ScrollTrigger.create({
          trigger: span(s),
          start: "top 72px",
          end: "bottom 72px",
          onToggle: (self) => {
            if (self.isActive) html.dataset.tone = s.dataset.tone ?? "dark";
          },
        });
      });
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, [pathname]);

  return <div ref={ref} aria-hidden="true" className="fixed inset-0 -z-10" style={{ backgroundColor: ATMOSPHERES.obsidian }} />;
}
