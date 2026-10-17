"use client";
import { useEffect, useRef } from "react";

/**
 * Calls cb(dtMs) every `interval` ms while `running`. The callback lives in a
 * ref, so changing it never restarts the interval (no effect loops), and
 * stopping `running` (pause) clears the interval immediately.
 */
export function useTicker(running: boolean, cb: (dt: number) => void, interval = 100) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - last, 1000);
      last = now;
      cbRef.current(dt);
    }, interval);
    return () => window.clearInterval(id);
  }, [running, interval]);
}

/** Latest-value ref, updated after every render (safe to read in callbacks). */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
