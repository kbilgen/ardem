"use client";

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { FocalPoint } from "@/content/media";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power2.out" });
  registered = true;
}

/** Media-query conditions shared by every timeline. */
export const MQ = {
  desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 899.98px) and (prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

export type MQState = { desktop?: boolean; mobile?: boolean; reduce?: boolean };

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Scoped GSAP setup. Everything created inside `setup` (tweens, ScrollTriggers,
 * SplitText) is reverted on unmount or when the media query changes.
 */
export function useMotion(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: MQState, mm: gsap.MatchMedia) => void | (() => void),
  deps: DependencyList = [],
) {
  useIsoLayoutEffect(() => {
    registerGsap();
    if (!scope.current) return;
    const mm = gsap.matchMedia(scope.current);
    mm.add(MQ, (c) => setup(c.conditions as MQState, mm));
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Devices where we thin out decorative work (particles, grain animation). */
export function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}

/**
 * Where a focal point of an object-fit: cover image lands inside its box.
 * `pos` is the CSS object-position in fractions (0.5, 0.5 = centred).
 */
export function coverPoint(
  box: { width: number; height: number },
  img: { width: number; height: number },
  focal: FocalPoint,
  pos: FocalPoint = { x: 0.5, y: 0.5 },
) {
  const s = Math.max(box.width / img.width, box.height / img.height);
  const w = img.width * s;
  const h = img.height * s;
  const ox = (box.width - w) * pos.x;
  const oy = (box.height - h) * pos.y;
  return { x: ox + focal.x * w, y: oy + focal.y * h, scale: s };
}

/**
 * object-position that brings a focal point as close as possible to a target
 * spot of the box (e.g. keep the stone centred on a portrait phone).
 */
export function positionFor(
  box: { width: number; height: number },
  img: { width: number; height: number },
  focal: FocalPoint,
  target: FocalPoint,
): FocalPoint {
  const s = Math.max(box.width / img.width, box.height / img.height);
  const w = img.width * s;
  const h = img.height * s;
  const solve = (boxLen: number, len: number, f: number, t: number) => {
    const spare = boxLen - len; // <= 0
    if (Math.abs(spare) < 0.5) return 0.5;
    const p = (t * boxLen - f * len) / spare;
    return Math.min(1, Math.max(0, p));
  };
  return { x: solve(box.width, w, focal.x, target.x), y: solve(box.height, h, focal.y, target.y) };
}
