"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isLowPower, registerGsap } from "@/lib/motion";

type ScrollApi = {
  scrollTo: (target: HTMLElement | number, opts?: { immediate?: boolean; offset?: number }) => void;
  stop: () => void;
  start: () => void;
};

const ScrollCtx = createContext<ScrollApi>({ scrollTo: () => undefined, stop: () => undefined, start: () => undefined });
export const useScroll = () => useContext(ScrollCtx);

/**
 * Lenis drives the native scroll position (no transformed wrapper), GSAP's
 * ticker drives Lenis, and every Lenis frame updates ScrollTrigger — so pinned
 * timelines, scrubs and the browser's own scrollbar all agree.
 * Reduced-motion visitors get native scrolling with no smoothing.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const firstPath = useRef(true);

  useEffect(() => {
    registerGsap();
    const html = document.documentElement;
    if (isLowPower()) html.classList.add("low-power");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tick: ((time: number) => void) | null = null;
    if (!reduce) {
      const lenis = new Lenis({
        duration: 1.3,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 0.85,
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
    }

    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(refresh).catch(() => undefined);
    window.addEventListener("load", refresh);
    html.classList.add("motion-ready");

    // Arriving with a hash (e.g. /#chapter-world): land there once layout is final.
    const goToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (el) jump(el, true);
    };
    const t = window.setTimeout(goToHash, 350);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      if (tick) gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jump = useCallback((target: HTMLElement | number, immediate = false, offset = 0) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { immediate, offset, duration: 1.6, force: true });
    } else {
      const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
    }
  }, []);

  // New page: start at the top and re-measure.
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    jump(0, true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname, jump]);

  // Same-page anchor links glide instead of jumping, and move focus for keyboard users.
  useEffect(() => {
    const norm = (p: string) => p.replace(/index\.html$/, "");
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || norm(url.pathname) !== norm(window.location.pathname) || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      jump(el);
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [jump]);

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo: (target, opts) => jump(target, opts?.immediate, opts?.offset),
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [jump],
  );

  return <ScrollCtx.Provider value={api}>{children}</ScrollCtx.Provider>;
}
