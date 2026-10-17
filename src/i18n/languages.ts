// Language registry. To add a language:
//   1. copy src/i18n/en.ts to src/i18n/<code>.ts and translate it (typed as Dict),
//   2. add one entry here and one import line in src/i18n/index.ts,
//   3. run `npm run check:i18n`.
export const LANGUAGES = [
  { code: "en", label: "English", native: "English", locale: "en-IN" },
  { code: "ta", label: "Tamil", native: "தமிழ்", locale: "ta-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", locale: "hi-IN" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];
export const DEFAULT_LANG: Lang = "en";

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && LANGUAGES.some((l) => l.code === v);
}

export function langInfo(code: Lang) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
