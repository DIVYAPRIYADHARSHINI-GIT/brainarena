// Small random helpers. Kept dependency-free and pure so unit tests can import them.

/** Deterministic 32-bit PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash -> unsigned 32-bit int. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randInt(min: number, max: number, rand: () => number = Math.random): number {
  return min + Math.floor(rand() * (max - min + 1));
}

export function pick<T>(arr: readonly T[], rand: () => number = Math.random): T {
  return arr[Math.floor(rand() * arr.length)];
}

// Shuffle-bag picker: every line in a pool is used once before any repeats,
// and a refilled bag never starts with the line that was just shown.
// We return an INDEX (not the text) so the line re-renders in the new language
// if the player switches language while it is on screen.
const bags = new Map<string, { size: number; order: number[]; last: number }>();

export function pickIndex(poolKey: string, size: number): number {
  if (size <= 0) return 0;
  let bag = bags.get(poolKey);
  if (!bag || bag.size !== size || bag.order.length === 0) {
    const order = shuffle(Array.from({ length: size }, (_, i) => i));
    const last = bag?.last ?? -1;
    if (order.length > 1 && order[order.length - 1] === last) {
      [order[0], order[order.length - 1]] = [order[order.length - 1], order[0]];
    }
    bag = { size, order, last };
    bags.set(poolKey, bag);
  }
  const i = bag.order.pop()!;
  bag.last = i;
  return i;
}
