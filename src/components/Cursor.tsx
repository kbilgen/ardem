"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * A point of gold light and a trailing ring. Only for precise pointers that
 * can hover, never for reduced-motion visitors. Elements can ask for a
 * labelled ring with data-cursor="view" and data-cursor-label="Examine".
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !dot.current || !ring.current) return;
    const html = document.documentElement;
    const d = dot.current;
    const r = ring.current;
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });
    let shown = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        html.classList.add("has-cursor");
        shown = true;
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const view = t?.closest?.("[data-cursor='view']") as HTMLElement | null;
      const link = t?.closest?.("a, button, [role='button'], label, summary, select");
      r.classList.toggle("is-view", !!view);
      r.classList.toggle("is-link", !view && !!link);
      if (label.current) label.current.textContent = view?.dataset.cursorLabel ?? "View";
    };
    const onLeave = () => html.classList.add("cursor-hidden");
    const onEnter = () => html.classList.remove("cursor-hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      html.classList.remove("has-cursor", "cursor-hidden");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label}>View</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
