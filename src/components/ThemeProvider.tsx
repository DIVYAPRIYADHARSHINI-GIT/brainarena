"use client";
// Light/dark theme. An inline script in layout.tsx applies the saved theme
// before first paint (no flash); this hook just reads/toggles the class.
import { useCallback, useSyncExternalStore } from "react";

export const THEME_KEY = "brainarena.theme";

export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark')document.documentElement.classList.add('dark');var l=localStorage.getItem('brainarena.lang');if(l)document.documentElement.lang=l}catch(e){}})();`;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getDark = () => document.documentElement.classList.contains("dark");

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, getDark, () => false);
  const toggle = useCallback(() => {
    const next = !getDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  }, []);
  return { dark, toggle };
}
