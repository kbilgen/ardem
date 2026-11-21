import Link from "next/link";
import { Photo } from "@/components/Photo";
import { collections, getPiece, piecesIn, pieces } from "@/content/catalogue";
import { AppointmentBand, PageHeader, PieceTile } from "./parts";

export function CollectionsView() {
  return (
    <>
      <section data-atmo="obsidian" data-tone="dark" aria-labelledby="collections-title" className="pb-[12vh]">
        <PageHeader id="collections-title" title="The Collections" line="Rings, necklaces, statement pieces and bridal." />

        <ol className="mx-auto mt-[12vh] grid max-w-[1320px] gap-[14vh] px-6 md:px-10">
          {collections.map((c, i) => {
            const cover = getPiece(c.cover)!;
            const list = piecesIn(c.slug);
            const flip = i % 2 === 1;
            return (
              <li key={c.slug} className="grid items-end gap-8 min-[900px]:grid-cols-12 min-[900px]:gap-x-8">
                <Link
                  href={`/collections/${c.slug}/`}
                  className={`frame-hover block aspect-[4/3] min-[900px]:col-span-7 ${flip ? "min-[900px]:col-start-6 min-[900px]:row-start-1" : ""}`}
                  data-cursor="view"
                  aria-label={`${c.name}, discover the collection`}
                >
                  <Photo k={cover.media} alt={cover.alt} sizes="(min-width: 900px) 56vw, 92vw" className="h-full w-full" imgClassName="h-full w-full object-cover" />
                  <span aria-hidden="true" className="glint" />
                </Link>
                <div className={`wall-label min-[900px]:col-span-4 ${flip ? "min-[900px]:col-start-1 min-[900px]:row-start-1" : "min-[900px]:col-start-9"}`}>
                  <h2 className="t-title">{c.name}</h2>
                  <p className="t-body mt-3">{c.line}</p>
                  <ul className="t-small mt-5 grid gap-1">
                    {list.map((p) => (
                      <li key={p.slug}>{p.name}</li>
                    ))}
                  </ul>
                  <Link href={`/collections/${c.slug}/`} className="link-line mt-4">
                    Discover {c.name}
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section data-atmo="obsidian" data-tone="dark" aria-labelledby="all-pieces" className="mx-auto max-w-[1320px] px-6 pb-[10vh] md:px-10">
        <h2 id="all-pieces" className="t-title border-t border-[var(--rule)] pt-10">
          Every piece
        </h2>
        <ul className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 min-[1100px]:grid-cols-4">
          {pieces.map((p) => (
            <li key={p.slug}>
              <PieceTile piece={p} sizes="(min-width: 1100px) 22vw, (min-width: 640px) 45vw, 92vw" />
            </li>
          ))}
        </ul>
      </section>

      <AppointmentBand />
    </>
  );
}
