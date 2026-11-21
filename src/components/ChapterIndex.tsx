"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { chapters } from "@/content/site";
import { registerGsap } from "@/lib/motion";

/** Fixed chapter index (wide screens): where you are in the film, and a way to jump. */
export function ChapterIndex() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    registerGsap();
    const triggers = chapters.map((c, i) =>
      ScrollTrigger.create({
        trigger: document.getElementById(`chapter-${c.id}`)?.closest("[data-pin-wrap]") ?? `#chapter-${c.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setActive(i),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <nav aria-label="Chapters" className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 min-[1440px]:block">
      <ol className="grid gap-1">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a
              href={`#chapter-${c.id}`}
              aria-current={i === active ? "step" : undefined}
              className="group flex min-h-9 items-center justify-end gap-3"
            >
              <span className="t-small translate-x-2 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                {c.title}
              </span>
              <span
                className={`w-6 text-right font-serif text-[1.05rem] italic transition-colors duration-700 ${
                  i === active ? "text-[var(--accent)]" : "text-[var(--fg-faint)]"
                }`}
              >
                {c.numeral}
              </span>
              <span
                aria-hidden="true"
                className={`h-px bg-[var(--accent)] transition-all duration-700 ${i === active ? "w-5 opacity-100" : "w-2 opacity-30"}`}
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
