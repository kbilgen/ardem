import { forwardRef, type AnchorHTMLAttributes } from "react";
import { relativePrefix } from "@/lib/paths";

/**
 * Stand-in for next/link in the portable preview build. Turns site paths into
 * file paths relative to the current page, so the static site works from any
 * folder: on a piece page, "/collections/rings/" → "../../collections/rings/index.html".
 */
type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  prefetch?: boolean | null;
  scroll?: boolean;
  replace?: boolean;
};

export function toRelative(href: string): string {
  if (!href.startsWith("/")) return href;
  const i = href.indexOf("#");
  const path = i === -1 ? href : href.slice(0, i);
  const hash = i === -1 ? "" : href.slice(i);
  let p = path.replace(/^\//, "");
  if (p === "" || p.endsWith("/")) p += "index.html";
  return relativePrefix() + p + hash;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, prefetch: _p, scroll: _s, replace: _r, ...rest }, ref) {
  return <a ref={ref} href={toRelative(href)} {...rest} />;
});

export default Link;
