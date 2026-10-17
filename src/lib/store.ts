"use client";
// localStorage-backed progress + preferences store.
//
// Render-loop safety: useSyncExternalStore requires getSnapshot() to return the
// SAME object until data changes. We cache the parsed object and only replace
// it on write (or on a cross-tab "storage" event), so components never loop.
import { useSyncExternalStore } from "react";
import { defaultProgress, recordGame, sanitizeProgress, unlockBadge, type BadgeId, type GameResult, type Progress, type RecordOutcome } from "./progress";

const PROGRESS_KEY = "brainarena.progress.v1";
const PREFS_KEY = "brainarena.prefs.v1";

export interface Prefs {
  muted: boolean;
  /** Per-game remembered setup (difficulty, theme, size). */
  setup: Record<string, string>;
}
const DEFAULT_PREFS: Prefs = { muted: false, setup: {} };

const SERVER_PROGRESS = defaultProgress();

function read<T>(key: string, parse: (raw: unknown) => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parse(JSON.parse(raw)) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode: keep in-memory state */
  }
}

function makeStore<T>(key: string, parse: (raw: unknown) => T, server: T) {
  let cache: T | null = null;
  const listeners = new Set<() => void>();
  const get = (): T => {
    if (cache === null) cache = read(key, parse, server);
    return cache;
  };
  const set = (next: T) => {
    cache = next;
    write(key, next);
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) {
        cache = null;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };
  return { get, set, subscribe, server: () => server };
}

const progressStore = makeStore<Progress>(PROGRESS_KEY, sanitizeProgress, SERVER_PROGRESS);
const prefsStore = makeStore<Prefs>(
  PREFS_KEY,
  (raw) => {
    const r = (raw ?? {}) as Partial<Prefs>;
    return { muted: !!r.muted, setup: r.setup && typeof r.setup === "object" ? r.setup : {} };
  },
  DEFAULT_PREFS,
);

export function useProgress(): Progress {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.server);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(prefsStore.subscribe, prefsStore.get, prefsStore.server);
}

/** True after hydration; lets pages show a loading state instead of SSR zeros. */
const noop = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function getProgress(): Progress {
  return progressStore.get();
}

export function saveResult(result: GameResult): RecordOutcome {
  const { next, outcome } = recordGame(progressStore.get(), result);
  progressStore.set(next);
  return outcome;
}

export function awardBadge(badge: BadgeId): boolean {
  const { next, unlocked } = unlockBadge(progressStore.get(), badge);
  if (unlocked) progressStore.set(next);
  return unlocked;
}

export function setNickname(name: string) {
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 16);
  if (!clean) return;
  progressStore.set({ ...progressStore.get(), nickname: clean });
}

export function resetProgress() {
  const nickname = progressStore.get().nickname;
  progressStore.set({ ...defaultProgress(), nickname });
}

export function getPrefs(): Prefs {
  return prefsStore.get();
}

export function setMuted(muted: boolean) {
  prefsStore.set({ ...prefsStore.get(), muted });
}

export function setSetup(key: string, value: string) {
  const p = prefsStore.get();
  if (p.setup[key] === value) return;
  prefsStore.set({ ...p, setup: { ...p.setup, [key]: value } });
}
