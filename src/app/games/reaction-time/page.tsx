import type { Metadata } from "next";
import { GameLoader } from "@/components/game/GameLoader";

export const metadata: Metadata = { title: "Reaction Time" };

export default function Page() {
  return <GameLoader game="reaction-time" />;
}
