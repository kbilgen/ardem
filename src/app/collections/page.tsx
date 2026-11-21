import type { Metadata } from "next";
import { CollectionsView } from "@/views/CollectionsView";

export const metadata: Metadata = {
  title: "The Collections",
  description: "Rings, necklaces, statement pieces and bridal jewellery by ARDEM.",
};

export default function CollectionsPage() {
  return <CollectionsView />;
}
