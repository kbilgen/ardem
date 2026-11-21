"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { site, chapters } from "@/content/site";
import { collections } from "@/content/catalogue";
import { useScroll } from "./SmoothScroll";

/**
 * Fixed navigation. Transparent over the opening frame, smoked glass once the
 * page moves, out of the way while scrolling down through a scene and back as
 * soon as the visitor scrolls up. Below 900px it becomes a full-screen menu.
 */
export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const scroll = useScroll();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 4) {
        setHidden(y > 160 && y > last);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Menu open/close choreography, scroll lock, focus trap.
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = menu.querySelectorAll<HTMLElement>("[data-menu-item]");
    if (open) {
      scroll.stop();
      gsap.set(menu, { visibility: "visible" });
      gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.9, ease: "power3.inOut" });
      gsap.fromTo(items, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.8, stagger: 0.05, delay: reduce ? 0 : 0.35, ease: "power3.out" });
      const first = menu.querySelector<HTMLElement>("a, button");
      first?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          toggleRef.current?.focus();
        }
        if (e.key !== "Tab") return;
        const focusables = Array.from(menu.querySelectorAll<HTMLElement>("a, button"));
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    } else {
      scroll.start();
      gsap.to(menu, {
        clipPath: "inset(0 0 100% 0)",
        duration: reduce ? 0 : 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(menu, { visibility: "hidden" });
        },
      });
    }
  }, [open, scroll]);

  useEffect(() => close(), [pathname, close]);

  const showGlass = scrolled && !open;

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[90] -translate-y-24 bg-ivory px-4 py-3 text-sm text-obsidian focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-[transform,background-color,border-color] duration-700 ease-[var(--ease-silk)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${showGlass ? "glass" : "border-b border-transparent"}`}
      >
        <nav aria-label="Main" className="mx-auto grid h-[72px] grid-cols-[1fr_auto_1fr] items-center px-5 md:h-[80px] md:px-10">
          <ul className="hidden items-center gap-10 min-[900px]:flex">
            {site.nav.left.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="t-nav link-line">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <span className="min-[900px]:hidden" />
          <Link href="/" aria-label="ARDEM, home" className="wordmark text-[1.3rem] md:text-[1.45rem]">
            ARDEM
          </Link>
          <div className="flex justify-end">
            <Link href={site.nav.right.href} className="t-nav link-line hidden min-[900px]:inline-flex">
              {site.nav.right.label}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="t-nav inline-flex min-h-11 items-center gap-3 min-[900px]:hidden"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span aria-hidden="true" className="relative block h-[9px] w-6">
                <span className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ${open ? "translate-y-[4px] rotate-[20deg]" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "-translate-y-[4px] -rotate-[20deg]" : ""}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        ref={menuRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-tone="dark"
        className="fixed inset-0 z-[55] overflow-y-auto bg-obsidian px-6 pb-10 pt-28"
        style={{ visibility: "hidden", clipPath: "inset(0 0 100% 0)" }}
        data-lenis-prevent
      >
        <ul className="grid gap-1">
          {collections.map((c) => (
            <li key={c.slug} data-menu-item>
              <Link href={`/collections/${c.slug}/`} className="font-serif text-[2.4rem] font-light leading-[1.2]" onClick={close}>
                {c.name}
              </Link>
            </li>
          ))}
          <li data-menu-item>
            <Link href="/collections/" className="font-serif text-[2.4rem] font-light italic leading-[1.2] text-[var(--fg-soft)]" onClick={close}>
              All collections
            </Link>
          </li>
        </ul>
        <div data-menu-item className="mt-10 border-t border-[var(--rule)] pt-8">
          <Link href={site.nav.right.href} className="btn w-full" onClick={close}>
            Book a Private Appointment
          </Link>
        </div>
        {isHome && (
          <ol data-menu-item className="mt-10 grid gap-2 text-sm text-[var(--fg-soft)]">
            {chapters.map((c) => (
              <li key={c.id}>
                <a href={`#chapter-${c.id}`} onClick={close} className="inline-flex min-h-11 items-baseline gap-4">
                  <span className="w-6 font-serif italic text-gold">{c.numeral}</span>
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
