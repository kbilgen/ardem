/**
 * Public asset paths. In the normal Next.js build they are root-absolute.
 * The portable preview build (preview/build.mjs) sets NEXT_PUBLIC_RELATIVE_PATHS=1
 * and a per-page prefix ("", "../", "../../"), so every page works from any
 * folder or static host without relying on a <base> tag.
 */
const RELATIVE = process.env.NEXT_PUBLIC_RELATIVE_PATHS === "1";
let prefix = "";

/** Preview build only: how many folders up the site root is from this page. */
export function setRelativePrefix(p: string) {
  prefix = p;
}

export function relativePrefix() {
  return prefix;
}

export function asset(path: string): string {
  return RELATIVE ? prefix + path.replace(/^\//, "") : path;
}
