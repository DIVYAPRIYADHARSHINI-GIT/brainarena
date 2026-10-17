// Funny rank titles based on total points (names live in the i18n files: ranks.<id>).
export const RANKS = [
  { id: "potato", min: 0, emoji: "🥔" },
  { id: "cat", min: 300, emoji: "🐱" },
  { id: "fox", min: 1000, emoji: "🦊" },
  { id: "wizard", min: 2500, emoji: "🧙" },
  { id: "galaxy", min: 5000, emoji: "🌌" },
] as const;

export type RankId = (typeof RANKS)[number]["id"];

export function rankFor(points: number) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (points >= RANKS[i].min) idx = i;
  const rank = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const progress = next ? (points - rank.min) / (next.min - rank.min) : 1;
  return { rank, index: idx, next, progress: Math.max(0, Math.min(1, progress)), toNext: next ? next.min - points : 0 };
}
