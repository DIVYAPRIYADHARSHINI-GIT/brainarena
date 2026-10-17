// Memory Match deck + scoring. Card faces are custom SVG icons (see
// components/MemoryIcons.tsx), keyed by "<theme>:<index>".
import { shuffle } from "./random.ts";

export type MemoryTheme = "animals" | "flags" | "space";
export type BoardSize = 4 | 6;

/** Each theme ships 18 distinct icons, enough for a 6x6 board. */
export const ICONS_PER_THEME = 18;

export interface MemoryCard {
  id: number;
  face: number;
}

export function makeDeck(size: BoardSize, rand: () => number = Math.random): MemoryCard[] {
  const pairs = (size * size) / 2;
  const faces = shuffle(Array.from({ length: ICONS_PER_THEME }, (_, i) => i), rand).slice(0, pairs);
  return shuffle([...faces, ...faces], rand).map((face, id) => ({ id, face }));
}

/**
 * Points: 1000 per board (4x4) or 2500 (6x6) minus penalties for extra moves
 * and time, never below a participation floor.
 */
export function memoryPoints(size: BoardSize, moves: number, seconds: number): number {
  const pairs = (size * size) / 2;
  const base = size === 4 ? 1000 : 2500;
  const extraMoves = Math.max(0, moves - pairs);
  const score = base - extraMoves * (size === 4 ? 25 : 20) - seconds * (size === 4 ? 5 : 3);
  return Math.max(Math.round(base * 0.1), Math.round(score));
}

/** "Elephant Memory" badge threshold (moves). */
export function elephantMoves(size: BoardSize): number {
  return size === 4 ? 12 : 28;
}
