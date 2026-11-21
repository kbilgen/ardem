import type { ReactNode } from "react";
import { SmoothScroll } from "./SmoothScroll";
import { Atmosphere } from "./Atmosphere";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Cursor } from "./Cursor";

/** Everything around a page: smooth scroll, navigation, atmosphere, footer, cursor. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      {/* After the page so its scroll triggers measure the final, pinned layout */}
      <Atmosphere />
      <Cursor />
    </SmoothScroll>
  );
}
