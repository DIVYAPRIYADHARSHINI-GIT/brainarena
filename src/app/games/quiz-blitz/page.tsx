import type { Metadata } from "next";
import { GameLoader } from "@/components/game/GameLoader";

export const metadata: Metadata = { title: "Quiz Blitz" };

export default function Page() {
  return <GameLoader game="quiz-blitz" />;
}
