import { Arrival } from "@/chapters/Arrival";
import { Brilliance } from "@/chapters/Brilliance";
import { Emerald } from "@/chapters/Emerald";
import { PoetryOfGold } from "@/chapters/PoetryOfGold";
import { EternalPromise } from "@/chapters/EternalPromise";
import { ArdemWorld } from "@/chapters/ArdemWorld";
import { ChapterIndex } from "@/components/ChapterIndex";

/** The six-chapter film. Order matters: pinned chapters are measured top to bottom. */
export function HomeView() {
  return (
    <>
      <Arrival />
      <Brilliance />
      <Emerald />
      <PoetryOfGold />
      <EternalPromise />
      <ArdemWorld />
      <ChapterIndex />
    </>
  );
}
