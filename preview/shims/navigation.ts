/** Stand-in for next/navigation in the portable preview build. */
let current = "/";

export function __setPathname(path: string) {
  current = path;
}

export function usePathname(): string {
  return current;
}

export function notFound(): never {
  throw new Error("notFound");
}
