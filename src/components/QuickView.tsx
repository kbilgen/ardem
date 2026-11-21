"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Photo } from "./Photo";
import { homeCollection, type Piece } from "@/content/catalogue";
import { useScroll } from "./SmoothScroll";

type QuickViewProps = { piece: Piece | null; onClose: () => void };

/**
 * Quick-access detail view. A modal dialog with its own focus trap; Escape,
 * the close button and the backdrop all close it, and focus returns to the
 * button that opened it.
 */
export function QuickView({ piece, onClose }: QuickViewProps) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const scroll = useScroll();

  useEffect(() => {
    if (!piece || !root.current || !panel.current) return;
    opener.current = document.activeElement as HTMLElement | null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroll.stop();
    const tl = gsap.timeline();
    tl.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.5, ease: "power2.out" });
    tl.fromTo(
      panel.current,
      { y: 40, opacity: 0, clipPath: "inset(8% 0% 0% 0%)" },
      { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: reduce ? 0 : 0.8, ease: "power3.out" },
      reduce ? 0 : 0.1,
    );
    panel.current.querySelector<HTMLElement>("[data-close]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const f = Array.from(panel.current.querySelectorAll<HTMLElement>("a[href], button"));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        f[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      tl.kill();
      scroll.start();
      opener.current?.focus({ preventScroll: true });
    };
  }, [piece, onClose, scroll]);

  if (!piece) return null;
  const collection = homeCollection(piece);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-obsidian/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-lenis-prevent
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
        data-tone={piece.atmosphere === "ivory" ? "light" : "dark"}
        className={`relative grid max-h-[100dvh] w-full max-w-[1080px] overflow-y-auto sm:max-h-[90vh] md:grid-cols-2 ${
          piece.atmosphere === "ivory" ? "bg-ivory" : piece.atmosphere === "emerald" ? "bg-emerald-night" : "bg-[#121214]"
        }`}
      >
        <div className="relative aspect-square md:aspect-auto">
          <Photo k={piece.media} alt={piece.alt} sizes="(min-width: 768px) 540px, 100vw" className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col p-7 sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <Link href={`/collections/${collection.slug}/`} className="link-line text-[var(--fg-soft)]">
              {collection.name}
            </Link>
            <button data-close type="button" onClick={onClose} className="link-line -mr-1 -mt-1 text-[var(--fg-soft)]">
              Close
            </button>
          </div>
          <h2 id="quickview-title" className="t-title mt-6">
            {piece.name}
          </h2>
          <p className="t-body mt-4">{piece.summary}</p>
          <h3 className="t-small mt-8 text-[var(--fg-faint)]">In the photograph</h3>
          <ul className="mt-3 grid gap-2 border-t border-[var(--rule)] pt-3">
            {piece.observed.map((o) => (
              <li key={o} className="t-small border-b border-[var(--rule)] pb-2">
                {o}
              </li>
            ))}
          </ul>
          <p className="t-small mt-6 max-w-[34ch] text-[var(--fg-faint)]">
            Metal, stone and price details are shared during a private appointment.
          </p>
          <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-8">
            <Link href={`/pieces/${piece.slug}/`} className="btn">
              View full details
            </Link>
            <Link href={`/appointment/#${piece.slug}`} className="link-line">
              Book a Private Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
