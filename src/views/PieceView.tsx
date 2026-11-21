import Link from "next/link";
import { LoupeImage } from "@/components/LoupeImage";
import { getCollection, getPiece, homeCollection, piecesIn } from "@/content/catalogue";
import { AppointmentBand, PieceTile } from "./parts";

export function PieceView({ slug }: { slug: string }) {
  const piece = getPiece(slug)!;
  const c = homeCollection(piece);
  const more = piecesIn(c.slug).filter((p) => p.slug !== slug);
  const also = piece.collections.slice(1).map((s) => getCollection(s)!);
  const tone = piece.atmosphere === "ivory" ? "light" : "dark";

  return (
    <>
      <section data-atmo={piece.atmosphere} data-tone={tone} aria-labelledby="piece-title" className={`px-6 pb-[14vh] pt-[16vh] md:px-10 ${tone === "light" ? "bg-ivory" : ""}`}>
        <div className="mx-auto grid max-w-[1320px] gap-12 min-[900px]:grid-cols-12 min-[900px]:gap-x-10">
          <div className="min-[900px]:col-span-7">
            <LoupeImage piece={piece} priority />
          </div>

          <div className="min-[900px]:sticky min-[900px]:top-28 min-[900px]:col-span-5 min-[900px]:self-start">
            <nav aria-label="Breadcrumb" className="t-small">
              <Link href={`/collections/${c.slug}/`} className="link-line text-[var(--fg-soft)]">
                {c.name}
              </Link>
            </nav>
            <h1 id="piece-title" className="t-display mt-6">
              {piece.name}
            </h1>
            <p className="t-body mt-6">{piece.summary}</p>

            <h2 className="t-small mt-10 text-[var(--fg-faint)]">In the photograph</h2>
            <ul className="mt-3 border-t border-[var(--rule)]">
              {piece.observed.map((o) => (
                <li key={o} className="border-b border-[var(--rule)] py-3 text-[0.9375rem]">
                  {o}
                </li>
              ))}
            </ul>

            {piece.details.length > 0 ? (
              <>
                <h2 className="t-small mt-10 text-[var(--fg-faint)]">Details</h2>
                <dl className="mt-3 border-t border-[var(--rule)]">
                  {piece.details.map((d) => (
                    <div key={d.label} className="grid grid-cols-[10em_1fr] gap-4 border-b border-[var(--rule)] py-3 text-[0.9375rem]">
                      <dt className="text-[var(--fg-soft)]">{d.label}</dt>
                      <dd>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="t-small mt-8 max-w-[36ch] text-[var(--fg-faint)]">
                Metal, stone and price details are shared during a private appointment.
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link href={`/appointment/#${piece.slug}`} className="btn">
                Book a Private Appointment
              </Link>
              {also.map((a) => (
                <Link key={a.slug} href={`/collections/${a.slug}/`} className="link-line">
                  Also in {a.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section data-atmo="obsidian" data-tone="dark" aria-labelledby="more-title" className="mx-auto max-w-[1320px] px-6 pb-[8vh] pt-[12vh] md:px-10">
          <h2 id="more-title" className="t-title border-t border-[var(--rule)] pt-10">
            Also in {c.name}
          </h2>
          <ul className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 min-[1100px]:grid-cols-3">
            {more.map((p) => (
              <li key={p.slug}>
                <PieceTile piece={p} sizes="(min-width: 1100px) 30vw, (min-width: 640px) 45vw, 92vw" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <AppointmentBand piece={piece} />
    </>
  );
}
