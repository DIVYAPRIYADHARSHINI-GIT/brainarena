// Reaction Time helpers.
export const REACTION_ROUNDS = 5;

/** Random red-light wait between 1.5 and 4.5 seconds. */
export function randomDelay(rand: () => number = Math.random): number {
  return 1500 + Math.floor(rand() * 3000);
}

export function average(times: number[]): number {
  if (!times.length) return 0;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

/** Total-points contribution of a Reaction Time run (lower ms = more points). */
export function reactionPoints(avgMs: number): number {
  return Math.max(20, Math.min(500, Math.round((700 - avgMs) * 1.25)));
}

/** A run under 400 ms average counts as a "win". */
export const REACTION_WIN_MS = 400;
export const SPEEDY_MS = 300;
