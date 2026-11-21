"use client";

import { useEffect, useRef, useState } from "react";
import { films } from "@/content/films";
import { asset } from "@/lib/paths";

type FilmProps = {
  slot: keyof typeof films;
  className?: string;
};

/**
 * Optional film layer. Renders nothing until the slot is marked ready in
 * content/films.ts. Plays only while on screen, never for reduced-motion
 * visitors, and fades in over the photograph only once it can play — so a
 * slow or failed load simply leaves the still in place.
 */
export function Film({ slot, className }: FilmProps) {
  const film = films[slot];
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!film.ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    setEnabled(true);
  }, [film.ready]);

  useEffect(() => {
    const v = ref.current;
    if (!enabled || !v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          v.play().catch(() => undefined);
        } else {
          v.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [enabled]);

  if (!film.ready || !enabled) return null;
  const base = `/films/${film.name}`;
  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      poster={asset(`${base}-poster.jpg`)}
      onCanPlay={() => setVisible(true)}
      onError={() => setVisible(false)}
      style={{ opacity: visible ? 1 : 0, transition: "opacity 1.2s ease" }}
    >
      <source src={asset(`${base}-mobile.mp4`)} type="video/mp4" media="(max-width: 899px) and (orientation: portrait)" />
      <source src={asset(`${base}-desktop.webm`)} type="video/webm" />
      <source src={asset(`${base}-desktop.mp4`)} type="video/mp4" />
    </video>
  );
}
