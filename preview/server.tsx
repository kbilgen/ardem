import { renderToString } from "react-dom/server";
import { App, type Route } from "./App";
import { collections, pieces, getCollection, getPiece } from "@/content/catalogue";
import { site } from "@/content/site";

export type Page = { file: string; route: Route; title: string; description: string };

export function pages(): Page[] {
  const t = (s: string) => `${s} — ${site.name}`;
  return [
    { file: "index.html", route: { kind: "home", path: "/" }, title: `${site.name} — ${site.tagline}`, description: site.description },
    { file: "collections/index.html", route: { kind: "collections", path: "/collections/" }, title: t("The Collections"), description: "Rings, necklaces, statement pieces and bridal jewellery by ARDEM." },
    ...collections.map((c) => ({
      file: `collections/${c.slug}/index.html`,
      route: { kind: "collection" as const, path: `/collections/${c.slug}/`, slug: c.slug },
      title: t(getCollection(c.slug)!.name),
      description: c.line,
    })),
    ...pieces.map((p) => ({
      file: `pieces/${p.slug}/index.html`,
      route: { kind: "piece" as const, path: `/pieces/${p.slug}/`, slug: p.slug },
      title: t(getPiece(p.slug)!.name),
      description: p.summary,
    })),
    { file: "appointment/index.html", route: { kind: "appointment", path: "/appointment/" }, title: t("Book a Private Appointment"), description: "Arrange a private viewing of ARDEM pieces." },
    { file: "404.html", route: { kind: "notfound", path: "/404" }, title: t("Page not found"), description: site.description },
  ];
}

export function render(route: Route, prefix: string): string {
  return renderToString(<App route={route} prefix={prefix} />);
}
