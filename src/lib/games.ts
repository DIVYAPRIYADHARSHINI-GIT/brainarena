// Game registry: one place that knows every mini game, its route, how its
// score is compared, and which brain stat it trains.

export const GAME_IDS = ["quick-math", "memory-match", "word-hunt", "reaction-time", "quiz-blitz"] as const;
export type GameId = (typeof GAME_IDS)[number];

export type BrainStat = "speed" | "memory" | "logic" | "knowledge";

export interface GameMeta {
  id: GameId;
  href: string;
  /** Reaction Time stores average milliseconds: lower is better. */
  lowerIsBetter: boolean;
  /** Score unit shown next to numbers. */
  unit: "pts" | "ms";
  stats: BrainStat[];
  /** Tailwind gradient classes for the card / header. */
  gradient: string;
  accent: string;
}

export const GAMES: Record<GameId, GameMeta> = {
  "quick-math": {
    id: "quick-math",
    href: "/games/quick-math",
    lowerIsBetter: false,
    unit: "pts",
    stats: ["logic", "speed"],
    gradient: "from-amber-400 via-orange-400 to-pink-500",
    accent: "#f97316",
  },
  "memory-match": {
    id: "memory-match",
    href: "/games/memory-match",
    lowerIsBetter: false,
    unit: "pts",
    stats: ["memory"],
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-500",
    accent: "#a855f7",
  },
  "word-hunt": {
    id: "word-hunt",
    href: "/games/word-hunt",
    lowerIsBetter: false,
    unit: "pts",
    stats: ["logic"],
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    accent: "#14b8a6",
  },
  "reaction-time": {
    id: "reaction-time",
    href: "/games/reaction-time",
    lowerIsBetter: true,
    unit: "ms",
    stats: ["speed"],
    gradient: "from-rose-500 via-red-500 to-orange-400",
    accent: "#ef4444",
  },
  "quiz-blitz": {
    id: "quiz-blitz",
    href: "/games/quiz-blitz",
    lowerIsBetter: false,
    unit: "pts",
    stats: ["knowledge"],
    gradient: "from-sky-400 via-blue-500 to-violet-500",
    accent: "#3b82f6",
  },
};

export function isBetter(game: GameId, score: number, than: number | undefined): boolean {
  if (than === undefined || than === null) return true;
  return GAMES[game].lowerIsBetter ? score < than : score > than;
}

export function isGameId(v: unknown): v is GameId {
  return typeof v === "string" && (GAME_IDS as readonly string[]).includes(v);
}
