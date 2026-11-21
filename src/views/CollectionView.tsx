import Link from "next/link";
import { collections, getCollection, piecesIn, type CollectionSlug } from "@/content/catalogue";
import { AppointmentBand, PageHeader, PieceTile } from "./parts";

export function CollectionView({ slug }: { slug: CollectionSlug }) {
  const c = getCollection(slug)!;
  const list = piecesIn(slug);
  const others = collections.filter((x) => x.slug !== slug);
  const atmo = slug === "statement" ? "emerald" : slug === "necklaces" ? "ivory" : "obsidian";
  const tone = atmo === "ivory" ? "light" : "dark";

  return (
    <>
      <section data-atmo={atmo} data-tone={tone} aria-labelledby="collection-title" className={`pb-[14vh] ${tone === "light" ? "bg-ivory" : ""}`}>
        <PageHeader id="collection-title" title={c.name} line={c.line}>
          <nav aria-label="Breadcrumb" className="t-small mb-8">
            <Link href="/collections/" className="link-line text-[var(--fg-soft)]">
              The Collections
            </Link>
          </nav>
        </PageHeader>

        <ul
          className={`mx-auto mt-[12vh] grid max-w-[1320px] gap-x-8 gap-y-20 px-6 md:px-10 ${
            list.length === 1 ? "min-[900px]:grid-cols-12" : "sm:grid-cols-2 min-[1100px]:grid-cols-3"
          }`}
        >
          {list.map((p, i) => (
            <li key={p.slug} className={list.length === 1 ? "min-[900px]:col-span-6 min-[900px]:col-start-4" : i % 2 ? "sm:mt-[10vh]" : ""}>
              <PieceTile piece={p} headingLevel={2} sizes={list.length === 1 ? "(min-width: 900px) 46vw, 92vw" : "(min-width: 1100px) 30vw, (min-width: 640px) 45vw, 92vw"} />
            </li>
          ))}
        </ul>
      </section>

      <section data-atmo="obsidian" data-tone="dark" aria-labelledby="other-collections" className="mx-auto max-w-[1320px] px-6 pb-[6vh] pt-[8vh] md:px-10">
        <h2 id="other-collections" className="t-small text-[var(--fg-faint)]">
          Other collections
        </h2>
        <ul className="mt-4 grid border-t border-[var(--rule)] sm:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug} className="border-b border-[var(--rule)] sm:border-b-0 sm:border-r sm:last:border-r-0">
              <Link href={`/collections/${o.slug}/`} className="group block py-6 sm:px-6 sm:first:pl-0">
                <span className="font-serif text-[1.9rem] font-light leading-tight transition-colors duration-500 group-hover:text-gold">{o.name}</span>
                <span className="t-small mt-1 block">{o.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AppointmentBand />
    </>
  );
}
