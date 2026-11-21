"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Photo, photoUrl } from "./Photo";
import { media } from "@/content/media";
import type { Piece } from "@/content/catalogue";

/**
 * The piece photograph with a jeweller's loupe.
 * Mouse: hover to examine. Touch and keyboard: "Examine with the loupe" turns it
 * on; drag, or use the arrow keys, to move it; the same button turns it off.
 */
export function LoupeImage({ piece, priority }: { piece: Piece; priority?: boolean }) {
  const m = media[piece.media];
  const frame = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const lensImg = useRef<HTMLImageElement>(null);
  const point = useRef(m.focal[piece.loupeAt] ?? { x: 0.5, y: 0.5 });
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const active = hovering || pinned;
  const K = 2.4;

  const apply = useCallback(() => {
    const f = frame.current;
    const l = lens.current;
    const li = lensImg.current;
    if (!f || !l || !li) return;
    const w = f.clientWidth;
    const h = f.clientHeight;
    const d = Math.round(Math.min(Math.max(Math.min(w, h) * 0.36, 120), 280));
    const cx = point.current.x * w;
    const cy = point.current.y * h;
    l.style.width = l.style.height = `${d}px`;
    l.style.transform = `translate3d(${cx - d / 2}px, ${cy - d / 2}px, 0)`;
    li.style.width = `${w * K}px`;
    li.style.height = `${h * K}px`;
    li.style.transform = `translate3d(${d / 2 - cx * K}px, ${d / 2 - cy * K}px, 0)`;
  }, []);

  useEffect(() => {
    apply();
    const ro = new ResizeObserver(apply);
    if (frame.current) ro.observe(frame.current);
    return () => ro.disconnect();
  }, [apply]);

  const moveTo = (clientX: number, clientY: number) => {
    const r = frame.current!.getBoundingClientRect();
    point.current = {
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    };
    apply();
  };

  return (
    <figure className="m-0">
      <div
        ref={frame}
        className={`relative w-full select-none overflow-hidden ${pinned ? "touch-none" : ""}`}
        style={{ aspectRatio: `${m.width} / ${m.height}`, backgroundColor: m.tone }}
        data-cursor={pinned ? undefined : "view"}
        data-cursor-label="Examine"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" || pinned) moveTo(e.clientX, e.clientY);
        }}
        onPointerDown={(e) => {
          if (pinned) moveTo(e.clientX, e.clientY);
        }}
      >
        <Photo k={piece.media} alt={piece.alt} priority={priority} sizes="(min-width: 900px) 56vw, 100vw" className="h-full w-full" imgClassName="h-full w-full object-cover" />
        <div
          ref={lens}
          aria-hidden="true"
          className="loupe transition-opacity duration-500"
          style={{ opacity: active ? 1 : 0 }}
        >
          <img ref={lensImg} src={photoUrl(piece.media)} alt="" loading="lazy" decoding="async" draggable={false} />
        </div>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <span className="t-small text-[var(--fg-faint)]">
          <span className="hidden [@media(hover:hover)]:inline">Hover to examine. </span>
          {pinned ? "Drag or use the arrow keys to move the loupe." : ""}
        </span>
        <button
          type="button"
          className="link-line"
          aria-pressed={pinned}
          onClick={() => {
            setPinned((p) => !p);
            requestAnimationFrame(apply);
          }}
          onKeyDown={(e) => {
            if (!pinned) return;
            const step = e.shiftKey ? 0.08 : 0.025;
            const dirs: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
            const d = dirs[e.key];
            if (!d) return;
            e.preventDefault();
            point.current = {
              x: Math.min(1, Math.max(0, point.current.x + d[0])),
              y: Math.min(1, Math.max(0, point.current.y + d[1])),
            };
            apply();
          }}
        >
          {pinned ? "Put the loupe away" : "Examine with the loupe"}
        </button>
      </figcaption>
    </figure>
  );
}
