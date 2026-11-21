import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPiece, pieces } from "@/content/catalogue";
import { PieceView } from "@/views/PieceView";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPiece(slug);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function PiecePage({ params }: Props) {
  const { slug } = await params;
  if (!getPiece(slug)) notFound();
  return <PieceView slug={slug} />;
}
