// Verifies every language has exactly the same keys as English, no empty
// strings, the same {placeholders}, and 10 funny lines per situation.
//   npm run check:i18n
import en from "../src/i18n/en.ts";
import ta from "../src/i18n/ta.ts";
import hi from "../src/i18n/hi.ts";

const LANGS: Record<string, unknown> = { ta, hi };
const LINES_PER_POOL = 10;
let problems = 0;

function walk(ref: unknown, other: unknown, path: string, lang: string) {
  if (typeof ref === "string") {
    if (typeof other !== "string" || !other.trim()) {
      console.log(`[${lang}] missing/empty: ${path}`);
      problems++;
      return;
    }
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
    if (ph(ref) !== ph(other)) {
      console.log(`[${lang}] placeholder mismatch at ${path}: "${ph(ref)}" vs "${ph(other)}"`);
      problems++;
    }
    return;
  }
  if (Array.isArray(ref)) {
    if (!Array.isArray(other) || other.length !== ref.length) {
      console.log(`[${lang}] array length mismatch at ${path}`);
      problems++;
      return;
    }
    ref.forEach((v, i) => walk(v, other[i], `${path}[${i}]`, lang));
    return;
  }
  if (ref && typeof ref === "object") {
    for (const k of Object.keys(ref)) walk((ref as Record<string, unknown>)[k], (other as Record<string, unknown>)?.[k], path ? `${path}.${k}` : k, lang);
  }
}

for (const [pool, arr] of Object.entries(en.lines)) {
  if (arr.length !== LINES_PER_POOL) {
    console.log(`[en] lines.${pool} has ${arr.length} lines (expected ${LINES_PER_POOL})`);
    problems++;
  }
  if (new Set(arr).size !== arr.length) {
    console.log(`[en] lines.${pool} has duplicates`);
    problems++;
  }
}
for (const [lang, dict] of Object.entries(LANGS)) {
  walk(en, dict, "", lang);
  for (const [pool, arr] of Object.entries((dict as typeof en).lines)) {
    if (new Set(arr).size !== arr.length) {
      console.log(`[${lang}] lines.${pool} has duplicates`);
      problems++;
    }
  }
}

if (problems) {
  console.log(`\n${problems} i18n problem(s)`);
  process.exit(1);
}
console.log(`i18n OK: en + ${Object.keys(LANGS).join(", ")}; ${Object.keys(en.lines).length} line pools x ${LINES_PER_POOL} lines each`);
