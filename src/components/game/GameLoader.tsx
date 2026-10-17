"use client";
// Loads each game client-side only (they use localStorage, timers and audio),
// showing Brainy's funny loading messages while the chunk downloads.
import dynamic from "next/dynamic";
import { LoadingBrain } from "../LoadingBrain";

const loading = () => <LoadingBrain />;

const GAMES = {
  "quick-math": dynamic(() => import("@/games/QuickMath"), { ssr: false, loading }),
  "memory-match": dynamic(() => import("@/games/MemoryMatch"), { ssr: false, loading }),
  "word-hunt": dynamic(() => import("@/games/WordHunt"), { ssr: false, loading }),
  "reaction-time": dynamic(() => import("@/games/ReactionTime"), { ssr: false, loading }),
  "quiz-blitz": dynamic(() => import("@/games/QuizBlitz"), { ssr: false, loading }),
};

export function GameLoader({ game }: { game: keyof typeof GAMES }) {
  const Game = GAMES[game];
  return <Game />;
}
