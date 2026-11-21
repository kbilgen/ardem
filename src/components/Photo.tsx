import type { CSSProperties } from "react";
import { media, type MediaKey } from "@/content/media";
import { asset } from "@/lib/paths";

type PhotoProps = {
  k: MediaKey;
  alt: string;
  /** Same syntax as the HTML sizes attribute. */
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  /** Hide from assistive tech when the image is decorative or duplicated. */
  decorative?: boolean;
};

/**
 * Responsive photograph: AVIF first, WebP fallback, intrinsic size set so the
 * layout never shifts, and a tone colour while it loads.
 */
export function Photo({ k, alt, sizes, priority, className, imgClassName, style, imgStyle, decorative }: PhotoProps) {
  const m = media[k];
  const set = (ext: string) => m.widths.map((w) => `${asset(`/images/${k}-${w}.${ext}`)} ${w}w`).join(", ");
  const largest = m.widths[m.widths.length - 1];
  return (
    <picture className={className} style={{ display: "block", ...style }}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={asset(`/images/${k}-${largest}.webp`)}
        width={m.width}
        height={m.height}
        alt={decorative ? "" : alt}
        aria-hidden={decorative || undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        className={imgClassName}
        style={{ backgroundColor: m.tone, ...imgStyle }}
      />
    </picture>
  );
}

/** Plain URL for a media key at a given width (used by the loupe). */
export function photoUrl(k: MediaKey, ext: "avif" | "webp" = "webp", width?: number) {
  const m = media[k];
  const w = width && m.widths.includes(width) ? width : m.widths[m.widths.length - 1];
  return asset(`/images/${k}-${w}.${ext}`);
}
