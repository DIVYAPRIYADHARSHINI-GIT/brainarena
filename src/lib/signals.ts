"use client";
// Tiny global signals for things that many components react to:
// Brainy's live mood + speech bubble, toast notifications, and confetti bursts.
// Each one is a cached-snapshot external store (no render loops).
import { useSyncExternalStore } from "react";
import type { LinePool } from "@/i18n";

function createSignal<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next: T) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    initial: () => initial,
  };
}

function useSignal<T>(s: ReturnType<typeof createSignal<T>>): T {
  return useSyncExternalStore(s.subscribe, s.get, s.initial);
}

// ---------------- Brainy ----------------
export type Mood = "happy" | "shocked" | "sleepy" | "crying" | "dancing" | "thinking";

/** A speech-bubble message: a funny line (pool+index) or an i18n key. */
export type BrainyMsg = { pool: LinePool; index: number } | { key: string; vars?: Record<string, string | number> } | null;

export interface BrainyState {
  mood: Mood;
  msg: BrainyMsg;
  /** Increments on every reaction so the bubble re-animates. */
  seq: number;
}

const brainySig = createSignal<BrainyState>({ mood: "happy", msg: null, seq: 0 });
let brainyTimer: ReturnType<typeof setTimeout> | null = null;
let baseMood: Mood = "happy";

/** Make Brainy react for `ms` milliseconds, then return to the base mood. */
export function brainyReact(mood: Mood, msg: BrainyMsg = null, ms = 2600) {
  if (brainyTimer) clearTimeout(brainyTimer);
  const cur = brainySig.get();
  brainySig.set({ mood, msg: msg ?? cur.msg, seq: cur.seq + 1 });
  if (ms > 0) {
    brainyTimer = setTimeout(() => {
      brainyTimer = null;
      brainySig.set({ mood: baseMood, msg: brainySig.get().msg, seq: brainySig.get().seq });
    }, ms);
  }
}

/** Mood Brainy falls back to (e.g. "thinking" during a game). */
export function brainyBase(mood: Mood) {
  baseMood = mood;
  if (!brainyTimer && brainySig.get().mood !== mood) brainySig.set({ ...brainySig.get(), mood });
}

export function brainySay(msg: BrainyMsg) {
  const cur = brainySig.get();
  brainySig.set({ ...cur, msg, seq: cur.seq + 1 });
}

export function useBrainy(): BrainyState {
  return useSignal(brainySig);
}

// ---------------- Toasts ----------------
export interface Toast {
  id: number;
  icon: string;
  text: string;
  tone: "info" | "success" | "warn";
}
const toastSig = createSignal<Toast[]>([]);
let toastId = 0;

export function toast(text: string, icon = "🧠", tone: Toast["tone"] = "info", ms = 3200) {
  const id = ++toastId;
  toastSig.set([...toastSig.get(), { id, icon, text, tone }].slice(-4));
  setTimeout(() => toastSig.set(toastSig.get().filter((t) => t.id !== id)), ms);
}

export function useToasts(): Toast[] {
  return useSignal(toastSig);
}

// ---------------- Confetti ----------------
export interface ConfettiBurst {
  id: number;
  /** Optional emoji confetti (e.g. potatoes for the "Do not press" button). */
  emoji?: string[];
  count: number;
}
const confettiSig = createSignal<ConfettiBurst | null>(null);
let confettiId = 0;

export function confetti(opts: { emoji?: string[]; count?: number } = {}) {
  confettiSig.set({ id: ++confettiId, emoji: opts.emoji, count: opts.count ?? 160 });
}

export function useConfetti(): ConfettiBurst | null {
  return useSignal(confettiSig);
}
