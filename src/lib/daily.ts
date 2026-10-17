// Date helpers for the Daily Challenge and the daily Word Hunt word.
// Everything uses the player's LOCAL calendar date ("YYYY-MM-DD") so the
// challenge flips at the player's midnight, not UTC midnight.
import { GAME_IDS, type GameId } from "./games.ts";
import { hashString, mulberry32, shuffle } from "./random.ts";

const EPOCH = Date.UTC(2024, 0, 1);

export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole days since 2024-01-01 for a "YYYY-MM-DD" key (timezone independent). */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / 86400000);
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}

/**
 * The daily game. Each block of 5 days is a seeded shuffle of all 5 games, so
 * every game shows up once per block and the order still feels random.
 */
export function dailyGameFor(key: string): GameId {
  const n = dayNumber(key);
  const block = Math.floor(n / GAME_IDS.length);
  const order = shuffle(GAME_IDS, mulberry32(hashString(`brain-arena-${block}`)));
  return order[((n % GAME_IDS.length) + GAME_IDS.length) % GAME_IDS.length];
}

export function msUntilMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Streak after completing today's challenge, given the last completed date. */
export function nextDailyStreak(lastDone: string | null, streak: number, today: string): number {
  if (lastDone === today) return streak;
  if (lastDone && addDays(lastDone, 1) === today) return streak + 1;
  return 1;
}

/** Streak to DISPLAY today: it is still alive if the last completion was today or yesterday. */
export function liveDailyStreak(lastDone: string | null, streak: number, today: string): number {
  if (!lastDone) return 0;
  if (lastDone === today || addDays(lastDone, 1) === today) return streak;
  return 0;
}
