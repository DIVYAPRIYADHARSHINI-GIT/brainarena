// Progress model + pure reducer. Everything a finished game changes (points,
// bests, leaderboard, history, streaks, daily challenge, badges, rank) happens
// in recordGame() so it is easy to unit-test. store.ts persists it.
import { GAME_IDS, GAMES, isBetter, type BrainStat, type GameId } from "./games.ts";
import { rankFor, type RankId } from "./ranks.ts";
import { dailyGameFor, localDateKey, nextDailyStreak } from "./daily.ts";
import { elephantMoves, type BoardSize } from "./memory.ts";
import { SPEEDY_MS } from "./reaction.ts";

export const BADGE_IDS = [
  "first",
  "potato",
  "speedy",
  "fire",
  "owl",
  "comeback",
  "combo",
  "elephant",
  "mind",
  "genius",
  "habit",
  "explorer",
  "dancer",
  "rebel",
] as const;
export type BadgeId = (typeof BADGE_IDS)[number];

export const BADGE_ICONS: Record<BadgeId, string> = {
  first: "👋",
  potato: "🥔",
  speedy: "⚡",
  fire: "🔥",
  owl: "🦉",
  comeback: "💪",
  combo: "🍳",
  elephant: "🐘",
  mind: "🔮",
  genius: "🤓",
  habit: "📅",
  explorer: "🧭",
  dancer: "💃",
  rebel: "🔴",
};

export interface GameMetaInfo {
  difficulty?: "easy" | "medium" | "hard";
  maxCombo?: number;
  solved?: number;
  moves?: number;
  seconds?: number;
  size?: BoardSize;
  theme?: string;
  guesses?: number;
  mode?: "daily" | "practice";
  correct?: number;
  fastest?: number;
}

export interface GameResult {
  game: GameId;
  /** Displayed score: points, or average ms for Reaction Time. */
  score: number;
  /** Points added to the total. */
  points: number;
  won: boolean;
  meta?: GameMetaInfo;
}

export interface PlayRecord {
  id: string;
  game: GameId;
  score: number;
  points: number;
  won: boolean;
  at: number;
  meta?: GameMetaInfo;
}

export interface LeaderEntry {
  id: string;
  name: string;
  score: number;
  at: number;
  meta?: GameMetaInfo;
}

export interface Progress {
  version: 1;
  nickname: string;
  totalPoints: number;
  gamesPlayed: number;
  wins: number;
  bests: Partial<Record<GameId, number>>;
  plays: Partial<Record<GameId, number>>;
  history: PlayRecord[];
  leaderboard: Record<GameId, LeaderEntry[]>;
  badges: Partial<Record<BadgeId, number>>;
  winStreak: number;
  lossStreak: number;
  daily: { lastDone: string | null; streak: number; best: number };
}

export const HISTORY_LIMIT = 50;
export const LEADERBOARD_LIMIT = 10;
export const DAILY_BONUS = 50;
export const DEFAULT_NICKNAME = "Brainiac";

export function emptyLeaderboard(): Record<GameId, LeaderEntry[]> {
  return Object.fromEntries(GAME_IDS.map((g) => [g, []])) as unknown as Record<GameId, LeaderEntry[]>;
}

export function defaultProgress(): Progress {
  return {
    version: 1,
    nickname: DEFAULT_NICKNAME,
    totalPoints: 0,
    gamesPlayed: 0,
    wins: 0,
    bests: {},
    plays: {},
    history: [],
    leaderboard: emptyLeaderboard(),
    badges: {},
    winStreak: 0,
    lossStreak: 0,
    daily: { lastDone: null, streak: 0, best: 0 },
  };
}

const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);

/** Defensive parse: unknown/old/corrupted data never crashes the app. */
export function sanitizeProgress(raw: unknown): Progress {
  const base = defaultProgress();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Progress>;
  const lb = emptyLeaderboard();
  for (const g of GAME_IDS) {
    const arr = r.leaderboard?.[g];
    if (Array.isArray(arr)) lb[g] = arr.filter((e) => e && typeof e.score === "number").slice(0, LEADERBOARD_LIMIT);
  }
  return {
    version: 1,
    nickname: typeof r.nickname === "string" && r.nickname.trim() ? r.nickname.slice(0, 16) : base.nickname,
    totalPoints: num(r.totalPoints),
    gamesPlayed: num(r.gamesPlayed),
    wins: num(r.wins),
    bests: r.bests && typeof r.bests === "object" ? r.bests : {},
    plays: r.plays && typeof r.plays === "object" ? r.plays : {},
    history: Array.isArray(r.history) ? r.history.filter((h) => h && GAME_IDS.includes(h.game)).slice(0, HISTORY_LIMIT) : [],
    leaderboard: lb,
    badges: r.badges && typeof r.badges === "object" ? r.badges : {},
    winStreak: num(r.winStreak),
    lossStreak: num(r.lossStreak),
    daily: {
      lastDone: typeof r.daily?.lastDone === "string" ? r.daily.lastDone : null,
      streak: num(r.daily?.streak),
      best: num(r.daily?.best),
    },
  };
}

export interface RecordOutcome {
  newBest: boolean;
  previousBest: number | undefined;
  badges: BadgeId[];
  rankUp: RankId | null;
  /** New daily streak when this play completed today's challenge. */
  dailyCompleted: number | null;
  pointsAdded: number;
  leaderboardPos: number | null;
  entryId: string;
}

let seq = 0;
const makeId = (now: number) => `${now.toString(36)}-${(seq++).toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

export function recordGame(prev: Progress, result: GameResult, now: Date = new Date()): { next: Progress; outcome: RecordOutcome } {
  const at = now.getTime();
  const id = makeId(at);
  const game = result.game;
  const today = localDateKey(now);

  const previousBest = prev.bests[game];
  const newBest = isBetter(game, result.score, previousBest);

  // Daily challenge: playing today's game (once per day) extends the streak.
  let dailyCompleted: number | null = null;
  let daily = prev.daily;
  let bonus = 0;
  if (dailyGameFor(today) === game && prev.daily.lastDone !== today) {
    const streak = nextDailyStreak(prev.daily.lastDone, prev.daily.streak, today);
    daily = { lastDone: today, streak, best: Math.max(prev.daily.best, streak) };
    dailyCompleted = streak;
    bonus = DAILY_BONUS;
  }

  const pointsAdded = Math.max(0, Math.round(result.points)) + bonus;

  // Leaderboard: insert, sort best-first, keep top 10.
  const board = [...(prev.leaderboard[game] ?? []), { id, name: prev.nickname, score: result.score, at, meta: result.meta }];
  board.sort((a, b) => (GAMES[game].lowerIsBetter ? a.score - b.score : b.score - a.score) || a.at - b.at);
  const top = board.slice(0, LEADERBOARD_LIMIT);
  const pos = top.findIndex((e) => e.id === id);

  const winStreak = result.won ? prev.winStreak + 1 : 0;
  const lossStreak = result.won ? 0 : prev.lossStreak + 1;
  const plays = { ...prev.plays, [game]: (prev.plays[game] ?? 0) + 1 };

  const next: Progress = {
    ...prev,
    totalPoints: prev.totalPoints + pointsAdded,
    gamesPlayed: prev.gamesPlayed + 1,
    wins: prev.wins + (result.won ? 1 : 0),
    bests: newBest ? { ...prev.bests, [game]: result.score } : prev.bests,
    plays,
    history: [{ id, game, score: result.score, points: pointsAdded, won: result.won, at, meta: result.meta }, ...prev.history].slice(0, HISTORY_LIMIT),
    leaderboard: { ...prev.leaderboard, [game]: top },
    winStreak,
    lossStreak,
    daily,
  };

  // Badges.
  const m = result.meta ?? {};
  const earned: BadgeId[] = [];
  const check = (b: BadgeId, cond: boolean) => {
    if (cond && !prev.badges[b]) earned.push(b);
  };
  const hour = now.getHours();
  check("first", true);
  check("potato", !result.won);
  check("speedy", game === "reaction-time" && result.score > 0 && result.score < SPEEDY_MS);
  check("fire", winStreak >= 5);
  check("owl", hour >= 0 && hour < 5);
  check("comeback", result.won && prev.lossStreak >= 2);
  check("combo", (m.maxCombo ?? 0) >= 10);
  check("elephant", game === "memory-match" && !!m.size && (m.moves ?? Infinity) <= elephantMoves(m.size));
  check("mind", game === "word-hunt" && result.won && (m.guesses ?? 9) <= 3);
  check("genius", game === "quiz-blitz" && m.correct === 10);
  check("habit", daily.streak >= 3);
  check("explorer", GAME_IDS.every((g) => (plays[g] ?? 0) > 0));
  if (earned.length) next.badges = { ...prev.badges, ...Object.fromEntries(earned.map((b) => [b, at])) };

  const before = rankFor(prev.totalPoints).index;
  const after = rankFor(next.totalPoints);
  const rankUp = after.index > before ? after.rank.id : null;

  return {
    next,
    outcome: { newBest, previousBest, badges: earned, rankUp, dailyCompleted, pointsAdded, leaderboardPos: pos >= 0 ? pos : null, entryId: id },
  };
}

export function unlockBadge(prev: Progress, badge: BadgeId, now = Date.now()): { next: Progress; unlocked: boolean } {
  if (prev.badges[badge]) return { next: prev, unlocked: false };
  return { next: { ...prev, badges: { ...prev.badges, [badge]: now } }, unlocked: true };
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** 0-100 brain stats derived from personal bests (rough, for fun). */
export function brainStats(p: Progress): Record<BrainStat, number> {
  const b = p.bests;
  const speed: number[] = [];
  const memory: number[] = [];
  const logic: number[] = [];
  const knowledge: number[] = [];
  if (b["reaction-time"] !== undefined) speed.push(((650 - b["reaction-time"]) / 450) * 100);
  if (b["quick-math"] !== undefined) {
    speed.push((b["quick-math"] / 900) * 100);
    logic.push((b["quick-math"] / 700) * 100);
  }
  if (b["memory-match"] !== undefined) memory.push((b["memory-match"] / 1600) * 100);
  if (b["word-hunt"] !== undefined) logic.push((b["word-hunt"] / 500) * 100);
  if (b["quiz-blitz"] !== undefined) knowledge.push((b["quiz-blitz"] / 1300) * 100);
  return {
    speed: clamp(avg(speed.map(clamp))),
    memory: clamp(avg(memory.map(clamp))),
    logic: clamp(avg(logic.map(clamp))),
    knowledge: clamp(avg(knowledge.map(clamp))),
  };
}
