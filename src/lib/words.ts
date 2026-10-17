// Word Hunt logic: daily word, guess validation, Wordle-style scoring and the
// shareable emoji grid. Pure functions so they can be unit-tested.
import { ANSWERS, VALID_PACKED } from "./wordlist.generated.ts";
import { dayNumber } from "./daily.ts";
import { hashString, mulberry32, shuffle } from "./random.ts";

export type LetterState = "correct" | "present" | "absent";

let validSet: Set<string> | null = null;
export function isValidWord(w: string): boolean {
  if (!validSet) {
    validSet = new Set<string>();
    for (let i = 0; i < VALID_PACKED.length; i += 5) validSet.add(VALID_PACKED.slice(i, i + 5));
  }
  return validSet.has(w.toLowerCase());
}

// The answer order is a fixed seeded shuffle, so day N always maps to the same
// word for everyone and consecutive days don't go alphabetically.
const ORDER = shuffle(ANSWERS, mulberry32(hashString("brain-arena-words-v1")));

export function dailyWord(dateKey: string): { word: string; number: number } {
  const n = dayNumber(dateKey);
  const idx = ((n % ORDER.length) + ORDER.length) % ORDER.length;
  return { word: ORDER[idx], number: n + 1 };
}

export function randomWord(exclude?: string, rand: () => number = Math.random): string {
  let w = ORDER[Math.floor(rand() * ORDER.length)];
  if (w === exclude) w = ORDER[(ORDER.indexOf(w) + 1) % ORDER.length];
  return w;
}

/** Two-pass scoring that handles repeated letters correctly. */
export function scoreGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toLowerCase().split("");
  const a = answer.toLowerCase().split("");
  const res: LetterState[] = Array(5).fill("absent");
  const counts: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) res[i] = "correct";
    else counts[a[i]] = (counts[a[i]] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "correct") continue;
    if (counts[g[i]] > 0) {
      res[i] = "present";
      counts[g[i]]--;
    }
  }
  return res;
}

const RANK: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/** Best known state per letter for the on-screen keyboard. */
export function keyboardStates(guesses: string[], answer: string): Record<string, LetterState> {
  const out: Record<string, LetterState> = {};
  for (const g of guesses) {
    const s = scoreGuess(g, answer);
    g.split("").forEach((ch, i) => {
      if (out[ch] === undefined || RANK[s[i]] > RANK[out[ch]]) out[ch] = s[i];
    });
  }
  return out;
}

export function shareText(opts: { guesses: string[]; answer: string; won: boolean; label: string }): string {
  const rows = opts.guesses.map((g) =>
    scoreGuess(g, opts.answer)
      .map((s) => (s === "correct" ? "🟩" : s === "present" ? "🟨" : "⬛"))
      .join(""),
  );
  return `Brain Arena 🧠 ${opts.label} ${opts.won ? opts.guesses.length : "X"}/6\n\n${rows.join("\n")}`;
}

/** Points: 600 for solving in 1, down to 100 for solving in 6. */
export function wordPoints(guessCount: number, won: boolean): number {
  return won ? (7 - guessCount) * 100 : 0;
}
