import type { Metadata } from "next";
import { GameLoader } from "@/components/game/GameLoader";

export const metadata: Metadata = { title: "Quick Math" };

export default function Page() {
  return <GameLoader game="quick-math" />;
}
