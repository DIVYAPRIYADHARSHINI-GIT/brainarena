"use client";
// Tiny i18n layer: typed dictionaries, {placeholder} interpolation, locale
// number/date formatting, and a stable random-line picker for funny lines.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en, { type Dict } from "./en";
import ta from "./ta";
import hi from "./hi";
import { DEFAULT_LANG, isLang, langInfo, type Lang } from "./languages";
import { pickIndex } from "@/lib/random";

// Add new languages here (and in languages.ts).
const DICTS: Record<Lang, Dict> = { en, ta, hi };

export const LANG_KEY = "brainarena.lang";

export type LinePool = keyof Dict["lines"];

type Vars = Record<string, string | number>;

function lookup(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), dict);
}

function interpolate(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  dict: Dict;
  t: (key: string, vars?: Vars) => string;
  /** Lines are addressed by index so they re-render when the language changes. */
  line: (pool: LinePool, index: number) => string;
  randomLine: (pool: LinePool) => number;
  formatNumber: (n: number) => string;
  formatDate: (iso: string | number, opts?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Read the saved language once after mount (the inline script in layout.tsx
  // already set <html lang> before paint).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (isLang(saved) && saved !== DEFAULT_LANG) setLangState(saved);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = DICTS[lang];
    const locale = langInfo(lang).locale;
    const nf = new Intl.NumberFormat(locale);
    return {
      lang,
      setLang,
      dict,
      t: (key, vars) => {
        const v = lookup(dict, key) ?? lookup(en, key);
        return typeof v === "string" ? interpolate(v, vars) : key;
      },
      line: (pool, index) => {
        const arr = dict.lines[pool] ?? en.lines[pool];
        return arr[((index % arr.length) + arr.length) % arr.length];
      },
      randomLine: (pool) => pickIndex(pool, en.lines[pool].length),
      formatNumber: (n) => nf.format(n),
      formatDate: (d, opts = { day: "numeric", month: "short", year: "numeric" }) => new Intl.DateTimeFormat(locale, opts).format(new Date(d)),
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export { DICTS };
