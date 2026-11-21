import { chapter, type ChapterId } from "@/content/site";

/** Roman numeral + chapter name. The home page is a sequence, so it is numbered. */
export function ChapterMark({ id, className }: { id: ChapterId; className?: string }) {
  const c = chapter(id);
  return (
    <p className={`chapter-mark ${className ?? ""}`}>
      <b>{c.numeral}</b>
      <span>{c.title}</span>
    </p>
  );
}

/** Animated film grain, clipped to its parent. */
export function Grain({ opacity }: { opacity?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden" style={{ opacity }}>
      <div className="grain" />
    </div>
  );
}

/** Soft edge shading for hero compositions. */
export function Vignette() {
  return <div aria-hidden="true" className="vignette" />;
}
