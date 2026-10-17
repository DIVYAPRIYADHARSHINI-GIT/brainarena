import type { Metadata } from "next";
import { GameLoader } from "@/components/game/GameLoader";

export const metadata: Metadata = { title: "Word Hunt" };

export default function Page() {
  return <GameLoader game="word-hunt" />;
}
