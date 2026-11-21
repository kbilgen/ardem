import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, getCollection, type CollectionSlug } from "@/content/catalogue";
import { CollectionView } from "@/views/CollectionView";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  return c ? { title: c.name, description: c.line } : {};
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  if (!getCollection(slug)) notFound();
  return <CollectionView slug={slug as CollectionSlug} />;
}
