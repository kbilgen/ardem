"use client";

import { useEffect, useRef } from "react";
import { isLowPower } from "@/lib/motion";

type ParticlesProps = {
  /** Relative amount; 1 ≈ 30 motes on a desktop screen. */
  density?: number;
  /** Confine motes to a vertical shaft (fractions of width), e.g. a light beam. */
  shaftX?: number;
  shaftWidth?: number;
  className?: string;
};

type Mote = { x: number; y: number; r: number; vy: number; vx: number; phase: number; speed: number; a: number };

/**
 * Sparse gold dust drifting through the light. Drawn from one pre-rendered
 * sprite, capped at 1.5× pixel density, paused off-screen and in background
 * tabs, and absent for reduced-motion visitors.
 */
export function Particles({ density = 1, shaftX, shaftWidth = 0.2, className }: ParticlesProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const small = window.matchMedia("(max-width: 899px)").matches;
    const count = Math.max(6, Math.round(30 * density * (small ? 0.5 : 1) * (isLowPower() ? 0.5 : 1)));
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext("2d")!;
    const grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,236,200,1)");
    grad.addColorStop(0.25, "rgba(222,190,130,0.75)");
    grad.addColorStop(1, "rgba(198,164,107,0)");
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 32, 32);

    let w = 0;
    let h = 0;
    const motes: Mote[] = [];
    const spawn = (m?: Mote): Mote => {
      const sx = shaftX !== undefined ? (shaftX - shaftWidth / 2 + Math.random() * shaftWidth) * w : Math.random() * w;
      const n: Mote = m ?? ({} as Mote);
      n.x = sx;
      n.y = m ? h + 10 : Math.random() * h;
      n.r = 0.6 + Math.random() * 1.9;
      n.vy = -(0.05 + Math.random() * 0.18);
      n.vx = (Math.random() - 0.5) * 0.06;
      n.phase = Math.random() * Math.PI * 2;
      n.speed = 0.4 + Math.random() * 0.9;
      n.a = 0.25 + Math.random() * 0.6;
      return n;
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!motes.length) for (let i = 0; i < count; i++) motes.push(spawn());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let running = false;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.phase += 0.0011 * dt * m.speed;
        m.y += m.vy * dt * 0.06 * 16;
        m.x += (m.vx + Math.sin(m.phase) * 0.05) * dt * 0.06 * 16;
        if (m.y < -10) spawn(m);
        const twinkle = 0.55 + 0.45 * Math.sin(m.phase * 2.3);
        ctx.globalAlpha = m.a * twinkle;
        const s = m.r * 6;
        ctx.drawImage(sprite, m.x - s / 2, m.y - s / 2, s, s);
      }
      raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? play() : pause()));
    io.observe(canvas);
    const onVis = () => (document.hidden ? pause() : canvas.getBoundingClientRect().bottom > 0 && play());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density, shaftX, shaftWidth]);

  return <canvas ref={ref} aria-hidden="true" className={className ?? "pointer-events-none absolute inset-0 h-full w-full"} />;
}
