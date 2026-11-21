import { SiteShell } from "@/components/SiteShell";
import { HomeView } from "@/views/HomeView";
import { CollectionsView } from "@/views/CollectionsView";
import { CollectionView } from "@/views/CollectionView";
import { PieceView } from "@/views/PieceView";
import { AppointmentView } from "@/views/AppointmentView";
import { NotFoundView } from "@/views/NotFoundView";
import type { CollectionSlug } from "@/content/catalogue";
import { __setPathname } from "./shims/navigation";
import { setRelativePrefix } from "@/lib/paths";

export type Route =
  | { kind: "home"; path: "/" }
  | { kind: "collections"; path: string }
  | { kind: "collection"; path: string; slug: CollectionSlug }
  | { kind: "piece"; path: string; slug: string }
  | { kind: "appointment"; path: string }
  | { kind: "notfound"; path: string };

/** Mirrors src/app: the same views inside the same shell. */
export function App({ route, prefix }: { route: Route; prefix: string }) {
  __setPathname(route.path);
  setRelativePrefix(prefix);
  let view;
  switch (route.kind) {
    case "home":
      view = <HomeView />;
      break;
    case "collections":
      view = <CollectionsView />;
      break;
    case "collection":
      view = <CollectionView slug={route.slug} />;
      break;
    case "piece":
      view = <PieceView slug={route.slug} />;
      break;
    case "appointment":
      view = <AppointmentView />;
      break;
    default:
      view = <NotFoundView />;
  }
  return <SiteShell>{view}</SiteShell>;
}
