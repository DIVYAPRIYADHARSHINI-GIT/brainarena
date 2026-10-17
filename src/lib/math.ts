// Quick Math problem generator + scoring. Every answer is a whole number.
import { pick, randInt } from "./random.ts";

export type Difficulty = "easy" | "medium" | "hard";

export interface MathProblem {
  text: string;
  answer: number;
}

export function makeProblem(level: Difficulty, rand: () => number = Math.random): MathProblem {
  const r = (a: number, b: number) => randInt(a, b, rand);
  if (level === "easy") {
    const op = pick(["+", "-"] as const, rand);
    const a = r(1, 20);
    const b = r(1, 20);
    if (op === "+") return { text: `${a} + ${b}`, answer: a + b };
    const [x, y] = a >= b ? [a, b] : [b, a];
    return { text: `${x} − ${y}`, answer: x - y };
  }
  if (level === "medium") {
    const op = pick(["+", "-", "×", "÷"] as const, rand);
    if (op === "+") {
      const a = r(10, 99);
      const b = r(10, 99);
      return { text: `${a} + ${b}`, answer: a + b };
    }
    if (op === "-") {
      const a = r(20, 99);
      const b = r(1, a);
      return { text: `${a} − ${b}`, answer: a - b };
    }
    if (op === "×") {
      const a = r(2, 12);
      const b = r(2, 12);
      return { text: `${a} × ${b}`, answer: a * b };
    }
    const b = r(2, 12);
    const q = r(2, 12);
    return { text: `${b * q} ÷ ${b}`, answer: q };
  }
  // hard: bigger numbers and two-step expressions
  const kind = pick(["mul", "div", "mix", "sub"] as const, rand);
  if (kind === "mul") {
    const a = r(11, 25);
    const b = r(3, 12);
    return { text: `${a} × ${b}`, answer: a * b };
  }
  if (kind === "div") {
    const b = r(3, 15);
    const q = r(5, 25);
    return { text: `${b * q} ÷ ${b}`, answer: q };
  }
  if (kind === "mix") {
    const a = r(2, 12);
    const b = r(2, 12);
    const c = r(5, 60);
    return { text: `${a} × ${b} + ${c}`, answer: a * b + c };
  }
  const a = r(100, 500);
  const b = r(10, 99);
  const c = r(10, 99);
  return { text: `${a} − ${b} + ${c}`, answer: a - b + c };
}

export const BASE_POINTS: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 35 };

/** Combo multiplier: x1 for the first 2 in a row, then +0.5 every 3 correct, max x3. */
export function comboMultiplier(streak: number): number {
  if (streak < 3) return 1;
  return Math.min(3, 1 + Math.floor(streak / 3) * 0.5);
}

export function mathPoints(level: Difficulty, streak: number): number {
  return Math.round(BASE_POINTS[level] * comboMultiplier(streak));
}

/** A Quick Math run counts as a "win" if you solved at least this many. */
export const WIN_SOLVED: Record<Difficulty, number> = { easy: 15, medium: 10, hard: 7 };
