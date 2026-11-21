import type { ReactNode } from "react";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { homeCollection, type Piece } from "@/content/catalogue";

/** A piece hung on a wall: frame + wall label. */
export function PieceTile({ piece, sizes, aspect = "aspect-[4/5]", headingLevel = 3 }: { piece: Piece; sizes: string; aspect?: string; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const c = homeCollection(piece);
  return (
    <article>
      <Link href={`/pieces/${piece.slug}/`} className={`frame-hover block ${aspect}`} data-cursor="view" aria-label={`${piece.name}, view the piece`}>
        <Photo k={piece.media} alt={piece.alt} sizes={sizes} className="h-full w-full" imgClassName="h-full w-full object-cover" />
        <span aria-hidden="true" className="glint" />
      </Link>
      <div className="wall-label mt-5">
        <H className="font-serif text-[1.7rem] font-light leading-tight">{piece.name}</H>
        <p className="t-small mt-1">{c.name}</p>
        <p className="t-small mt-3 max-w-[38ch] text-[var(--fg-faint)]">{piece.summary}</p>
        <Link href={`/pieces/${piece.slug}/`} className="link-line mt-2">
          View the piece
        </Link>
      </div>
    </article>
  );
}

/** Closing invitation used at the foot of inner pages. */
export function AppointmentBand({ piece }: { piece?: Piece }) {
  return (
    <section data-atmo="champagne" data-tone="dark" aria-labelledby="band-title" className="px-6 py-[16vh] text-center md:px-10">
      <h2 id="band-title" className="t-title mx-auto max-w-[18ch]">
        See it in person, in private.
      </h2>
      <p className="t-body mx-auto mt-5">
        Tell us which pieces you&rsquo;d like to see and when suits you. We&rsquo;ll reply to confirm a time.
      </p>
      <div className="mt-10">
        <Link href={piece ? `/appointment/#${piece.slug}` : "/appointment/"} className="btn">
          Book a Private Appointment
        </Link>
      </div>
    </section>
  );
}

/** Page header shared by inner pages. */
export function PageHeader({ id, title, line, children }: { id?: string; title: string; line?: string; children?: ReactNode }) {
  return (
    <header className="mx-auto max-w-[1320px] px-6 pt-[22vh] md:px-10">
      {children}
      <h1 id={id} className="t-display max-w-[16ch]">
        {title}
      </h1>
      {line && <p className="t-sub mt-6 max-w-[32ch]">{line}</p>}
    </header>
  );
}
