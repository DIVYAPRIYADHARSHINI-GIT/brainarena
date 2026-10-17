// End-to-end smoke test with the locally installed headless Chrome (no npm deps).
//
//   npm run build && npx next start -p 3200 &
//   BASE_URL=http://localhost:3200 node tests/e2e/smoke.mjs
//
// Plays all 5 games, checks every page on desktop + mobile + dark mode in
// English, Tamil and Hindi, the easter eggs, the 404 page, and that no page
// freezes (a main-thread heartbeat must keep ticking). Short timeouts + a
// global watchdog so a stuck page fails fast instead of hanging.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch, sleep } from "./cdp.mjs";

const BASE = (process.env.BASE_URL ?? "http://localhost:3200").replace(/\/$/, "");
const OUT = join(dirname(fileURLToPath(import.meta.url)), "output", process.env.OUT_NAME ?? "local");
mkdirSync(OUT, { recursive: true });
const SHOTS = process.env.SHOTS !== "0";

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const { newPage, close } = await launch({ port: Number(process.env.CDP_PORT ?? 9344) });
const WATCHDOG_MS = Number(process.env.E2E_TIMEOUT_MS ?? 6 * 60_000);
const watchdog = setTimeout(async () => {
  console.error(`E2E watchdog: aborting after ${WATCHDOG_MS / 1000}s`);
  await close().catch(() => {});
  process.exit(2);
}, WATCHDOG_MS);
watchdog.unref();

let seq = 0;
/** Fresh page with clean storage, given theme/lang, a freeze heartbeat and muted audio. */
async function freshPage({ width = 1366, height = 900, mobile = false, dark = false, lang = "en", clear = true, extra = "" } = {}) {
  const p = await newPage();
  await p.viewport(width, height, mobile);
  const key = `ba-init-${++seq}`;
  await p.addInitScript(`
    try {
      if (!localStorage.getItem('${key}')) {
        ${clear ? "localStorage.clear();" : ""}
        localStorage.setItem('${key}', '1');
        localStorage.setItem('brainarena.theme', '${dark ? "dark" : "light"}');
        localStorage.setItem('brainarena.lang', '${lang}');
        localStorage.setItem('brainarena.prefs.v1', JSON.stringify({ muted: true, setup: {} }));
      }
    } catch (e) {}
    window.__beat = 0; setInterval(() => { window.__beat++; }, 50);
    ${extra}
  `);
  return p;
}

/** The main thread must stay responsive: heartbeat advances during a 500 ms window. */
async function notFrozen(p, label) {
  const a = await p.eval("window.__beat");
  await sleep(500);
  const b = await p.eval("window.__beat");
  check(`${label}: page responsive (no freeze)`, b - a >= 5, `${b - a} beats/500ms`);
}

async function shot(p, name) {
  if (SHOTS) await p.screenshot(join(OUT, `${name}.png`)).catch(() => {});
}

async function clickText(p, selector, text) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(e => e.innerText.includes(${JSON.stringify(text)})); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`clickText: ${selector} "${text}" not found`);
  await sleep(200);
}

async function closeHow(p) {
  if (await p.count("[data-testid=how-modal]")) await p.click("[data-testid=how-close]");
}

async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(name, false, String(e?.message ?? e).split("\n")[0]);
  }
}

// ------------------------------------------------------------------ Home
await step("home", async () => {
  const p = await freshPage();
  await p.goto(`${BASE}/`);
  check("home: brand + tagline in nav", (await p.text("[data-testid=brand]"))?.includes("Brain Arena") && (await p.text("[data-testid=tagline]"))?.includes("sudden intelligence"));
  check("home: 5 game cards", (await p.count("[data-testid^=game-card-]")) === 5);
  check("home: empty best state", (await p.text("[data-testid=best-quick-math]"))?.includes("No score yet"));
  check("home: daily challenge card", (await p.count("[data-testid=daily-card]")) === 1, await p.eval("document.querySelector('[data-testid=daily-card]')?.dataset.game"));
  check("home: rank shows Sleepy Potato", (await p.text("[data-testid=rank-title]"))?.includes("Sleepy Potato"));
  check("home: Brainy says hello", (await p.text("[data-testid=brainy-bubble]"))?.includes("Brainy"));
  await notFrozen(p, "home");
  await shot(p, "01-home-desktop");
  // Easter egg: poke Brainy 10 times -> dances + badge.
  for (let i = 0; i < 10; i++) await p.eval("document.querySelector('[data-testid=brainy]').click()");
  await sleep(150);
  check("easter egg: 10 pokes make Brainy dance", (await p.eval("document.querySelector('[data-testid=brainy]').dataset.mood")) === "dancing");
  check("easter egg: Dance Machine badge", await p.eval("!!JSON.parse(localStorage.getItem('brainarena.progress.v1')).badges.dancer"));
  await shot(p, "02-brainy-dance");
  // Do-not-press button.
  await p.click("[data-testid=do-not-press]");
  await sleep(150);
  check("easter egg: Do not press flips the page", await p.eval("document.documentElement.classList.contains('upside-down')"));
  check("easter egg: Do not press shows a funny toast", (await p.count("[data-testid=toast]")) > 0);
  await shot(p, "03-do-not-press");
  await sleep(2400);
  check("easter egg: page flips back", !(await p.eval("document.documentElement.classList.contains('upside-down')")));
  // Theme + mute toggles.
  await p.click("[data-testid=theme-toggle]");
  check("theme toggle -> dark", await p.eval("document.documentElement.classList.contains('dark') && localStorage.getItem('brainarena.theme') === 'dark'"));
  await p.click("[data-testid=theme-toggle]");
  const mutedBefore = await p.eval("JSON.parse(localStorage.getItem('brainarena.prefs.v1')).muted");
  await p.click("[data-testid=mute-toggle]");
  check("mute toggle persists", (await p.eval("JSON.parse(localStorage.getItem('brainarena.prefs.v1')).muted")) === !mutedBefore);
  await p.click("[data-testid=mute-toggle]");
  check("home: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Quick Math
await step("quick-math", async () => {
  const p = await freshPage();
  await p.goto(`${BASE}/games/quick-math`);
  await p.waitFor("document.querySelector('[data-testid=how-modal]')", 6000);
  check("quick math: How to play opens on first visit", true);
  await p.click("[data-testid=how-close]");
  await p.click("[data-testid=qm-level] [data-value=medium]");
  await p.click("[data-testid=start]");
  await p.waitFor("document.querySelector('[data-testid=qm-problem]')", 5000);
  // Solve 12 problems via the on-screen keypad.
  for (let i = 0; i < 12; i++) {
    const ans = await p.eval("document.querySelector('[data-testid=qm-problem]').dataset.answer");
    for (const d of String(ans)) await p.eval(`document.querySelector('[data-key="${d}"]').click()`);
    await sleep(40);
  }
  const solved = Number(await p.text("[data-testid=qm-solved]"));
  check("quick math: keypad answers accepted", solved === 12, `solved=${solved}`);
  check("quick math: combo active", (await p.text("[data-testid=qm-combo]"))?.includes("12"));
  // Keyboard input + wrong answer.
  await p.eval("(() => { for (let i = 0; i < 4; i++) window.dispatchEvent(new KeyboardEvent('keydown', { key: '9' })); })()");
  await p.eval("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))");
  await sleep(100);
  check("quick math: wrong answer resets combo", (await p.text("[data-testid=qm-combo]"))?.includes("🔥 0"));
  // Pause freezes the timer.
  await p.click("[data-testid=pause]");
  const t1 = await p.text("[data-testid=qm-time]");
  await sleep(1300);
  const t2 = await p.text("[data-testid=qm-time]");
  check("quick math: pause stops timer", t1 === t2 && (await p.count("[data-testid=paused-overlay]")) === 1, `${t1} -> ${t2}`);
  await shot(p, "10-quickmath-paused");
  await p.click("[data-testid=resume]");
  // Fast-forward: shrink remaining time by faking performance.now.
  await p.eval("(() => { const real = performance.now.bind(performance); let off = 0; performance.now = () => real() + off; window.__ff = (ms) => { off += ms; }; })()");
  // The ticker caps each step at 1 s, so advance 1 s per tick (100 ms).
  for (let i = 0; i < 90; i++) {
    await p.eval("window.__ff(1000)");
    await sleep(110);
    if (await p.count("[data-testid=result]")) break;
  }
  await p.waitFor("document.querySelector('[data-testid=result]')", 5000);
  check("quick math: result card after 60 s", true, await p.text("[data-testid=result-score]"));
  check("quick math: funny result line", ((await p.text("[data-testid=result-line]")) ?? "").length > 5, await p.text("[data-testid=result-line]"));
  await shot(p, "11-quickmath-result");
  const best = await p.eval("JSON.parse(localStorage.getItem('brainarena.progress.v1')).bests['quick-math']");
  check("quick math: best saved", best > 0, `best=${best}`);
  // Restart from the result screen.
  await p.click("[data-testid=restart]");
  check("quick math: restart -> countdown", (await p.count("[data-testid=countdown]")) === 1);
  await notFrozen(p, "quick math");
  check("quick math: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Memory Match
await step("memory-match", async () => {
  const p = await freshPage();
  await p.goto(`${BASE}/games/memory-match`);
  await p.waitFor("document.querySelector('[data-testid=how-modal]')", 6000);
  await closeHow(p);
  for (const theme of ["flags", "space", "animals"]) {
    await p.click(`[data-testid=mm-theme] [data-value=${theme}]`);
    await p.click("[data-testid=mm-size] [data-value='4']");
    await p.click("[data-testid=start]");
    await p.waitFor("document.querySelectorAll('[data-testid=mm-card]').length === 16", 4000);
    // One mismatch first (if possible), then solve perfectly.
    const faces = await p.eval("[...document.querySelectorAll('[data-testid=mm-card]')].map(c => Number(c.dataset.face))");
    const a = 0;
    const b = faces.findIndex((f, i) => i > 0 && f !== faces[0]);
    await p.eval(`document.querySelectorAll('[data-testid=mm-card]')[${a}].click()`);
    await p.eval(`document.querySelectorAll('[data-testid=mm-card]')[${b}].click()`);
    await sleep(80);
    if (theme === "flags") await shot(p, "20-memory-mismatch");
    await sleep(900);
    const openAfter = await p.count("[data-testid=mm-card][data-open=true]");
    if (theme === "flags") check("memory: mismatched pair flips back", openAfter === 0, `open=${openAfter}`);
    const byFace = {};
    faces.forEach((f, i) => (byFace[f] ??= []).push(i));
    for (const [, [x, y]] of Object.entries(byFace)) {
      await p.eval(`document.querySelectorAll('[data-testid=mm-card]')[${x}].click()`);
      await p.eval(`document.querySelectorAll('[data-testid=mm-card]')[${y}].click()`);
      await sleep(30);
    }
    await p.waitFor("document.querySelector('[data-testid=result]')", 4000);
    check(`memory (${theme}): solved 4x4, result shown`, true, `${await p.text("[data-testid=mm-moves]")} moves, ${await p.text("[data-testid=result-score]")}`);
    if (theme === "space") await shot(p, "21-memory-result");
    await p.click("[data-testid=restart]");
    await sleep(200);
    // Restart goes straight into a new board; go back to setup for the next theme.
    await p.goto(`${BASE}/games/memory-match`);
  }
  // 6x6 board renders 36 cards.
  await p.click("[data-testid=mm-size] [data-value='6']");
  await p.click("[data-testid=start]");
  check("memory: 6x6 board has 36 cards", (await p.count("[data-testid=mm-card]")) === 36);
  await p.eval("document.querySelectorAll('[data-testid=mm-card]')[0].click()");
  await sleep(1200);
  check("memory: timer runs after first flip", (await p.text("[data-testid=mm-time]")) !== "0:00");
  await p.click("[data-testid=pause]");
  check("memory: pause overlay", (await p.count("[data-testid=paused-overlay]")) === 1);
  await shot(p, "22-memory-6x6-paused");
  await p.click("[data-testid=resume]");
  await notFrozen(p, "memory 6x6");
  check("memory: elephant badge for a perfect 4x4", await p.eval("!!JSON.parse(localStorage.getItem('brainarena.progress.v1')).badges.elephant"));
  check("memory: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Word Hunt
await step("word-hunt", async () => {
  const p = await freshPage();
  await p.goto(`${BASE}/games/word-hunt`);
  await p.waitFor("document.querySelector('[data-testid=wh-board]')", 6000);
  await closeHow(p);
  const answer = await p.eval("document.querySelector('[data-testid=wh-board]').dataset.answer");
  const type = async (w) => {
    for (const ch of w) await p.eval(`document.querySelector('[data-testid=wh-keyboard] [data-key="${ch}"]').click()`);
  };
  // LOL easter egg.
  await type("lol");
  await sleep(150);
  check("easter egg: typing LOL shows a joke", (await p.count("[data-testid=joke-modal]")) === 1, await p.text("[data-testid=joke-text]"));
  await shot(p, "30-word-lol-joke");
  await p.eval("document.querySelector('[data-testid=joke-modal] button.btn-primary').click()");
  await sleep(150);
  // Invalid word.
  await type("qzxvw");
  await p.click("[data-key=enter]");
  check("word hunt: rejects unknown words", (await p.text("[data-testid=wh-msg]"))?.includes("never heard"));
  for (let i = 0; i < 5; i++) await p.click("[data-key=back]");
  // Physical keyboard + a wrong valid guess (pick one that is not the answer).
  const guess = answer === "crane" ? "slate" : "crane";
  for (const ch of guess) await p.eval(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '${ch}' }))`);
  await p.eval("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))");
  await sleep(200);
  const states = await p.eval("[...document.querySelectorAll('[data-testid=wh-row]')[0].children].map(c => c.dataset.state)");
  check("word hunt: guess scored with colours", states.every((s) => ["correct", "present", "absent"].includes(s)), states.join(","));
  check("word hunt: keyboard keys coloured", await p.eval(`[...document.querySelectorAll('[data-testid=wh-keyboard] [data-key]')].some(k => /emerald|amber|slate-400|slate-700/.test(k.className))`));
  // Pause.
  await p.click("[data-testid=pause]");
  check("word hunt: pause overlay", (await p.count("[data-testid=paused-overlay]")) === 1);
  await p.click("[data-testid=resume]");
  // Solve.
  await type(answer);
  await p.click("[data-key=enter]");
  await p.waitFor("document.querySelector('[data-testid=result]')", 4000);
  check("word hunt: solved in 2", (await p.text("[data-testid=wh-answer]"))?.includes("2/6"));
  await shot(p, "31-word-result");
  // Share -> clipboard (grant permission through CDP is not needed: we stub it).
  await p.eval("navigator.clipboard.writeText = async (t) => { window.__shared = t; }");
  await p.click("[data-testid=wh-share]");
  await sleep(200);
  const shared = await p.eval("window.__shared ?? ''");
  check("word hunt: share text is emoji grid", shared.includes("🟩🟩🟩🟩🟩") && shared.includes("2/6") && !shared.toLowerCase().includes(answer), shared.replace(/\n/g, " "));
  // Reload: daily word is finished, practice available.
  await p.goto(`${BASE}/games/word-hunt`);
  await p.waitFor("document.querySelector('[data-testid=wh-done-today]')", 5000);
  check("word hunt: daily word can't be replayed after reload", true);
  await p.click("[data-testid=wh-practice]");
  const practiceAns = await p.eval("document.querySelector('[data-testid=wh-board]').dataset.answer");
  check("word hunt: practice word available", practiceAns && practiceAns.length === 5 && (await p.text("[data-testid=wh-mode]"))?.includes("Practice"));
  // Lose a practice round with 6 wrong guesses.
  const wrongs = ["crane", "slate", "pious", "dough", "nymph", "jumbo", "fizzy", "glyph"].filter((w) => w !== practiceAns).slice(0, 6);
  for (const w of wrongs) {
    await type(w);
    await p.click("[data-key=enter]");
    await sleep(40);
  }
  await p.waitFor("document.querySelector('[data-testid=result]')", 4000);
  check("word hunt: loss shows the answer", (await p.text("[data-testid=wh-answer]"))?.toLowerCase().includes(practiceAns));
  check("word hunt: Potato Brain badge on first loss", await p.eval("!!JSON.parse(localStorage.getItem('brainarena.progress.v1')).badges.potato"));
  await notFrozen(p, "word hunt");
  check("word hunt: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Reaction Time
await step("reaction-time", async () => {
  const p = await freshPage();
  await p.goto(`${BASE}/games/reaction-time`);
  await p.waitFor("document.querySelector('[data-testid=rt-panel]')", 6000);
  await closeHow(p);
  const down = "document.querySelector('[data-testid=rt-panel]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))";
  const state = () => p.eval("document.querySelector('[data-testid=rt-panel]')?.dataset.state ?? 'done'");
  // Too early.
  await p.eval(down);
  await sleep(100);
  check("reaction: red waiting state", (await state()) === "waiting");
  await p.eval(down);
  await sleep(100);
  check("reaction: early click -> Too soon!", (await state()) === "early" && (await p.text("[data-testid=rt-title]"))?.includes("Too soon"), await p.text("[data-testid=rt-early-line]"));
  await shot(p, "40-reaction-too-soon");
  // 5 real rounds.
  for (let r = 0; r < 5; r++) {
    await p.eval(down); // start round
    await p.waitFor("document.querySelector('[data-testid=rt-panel]')?.dataset.state === 'go'", 6000);
    if (r === 0) await shot(p, "41-reaction-go");
    await sleep(60);
    await p.eval(down);
    await sleep(80);
  }
  await p.waitFor("document.querySelector('[data-testid=result]')", 3000);
  const avg = await p.text("[data-testid=result-score]");
  check("reaction: 5 rounds -> average in ms", /\d+\s*ms/.test(avg ?? ""), avg);
  check("reaction: 5 round times listed", (await p.count("[data-testid=rt-times] .chip")) === 5);
  await shot(p, "42-reaction-result");
  // Pause during waiting cancels the pending green.
  await p.click("[data-testid=restart]");
  await p.eval(down);
  await p.eval(down);
  await sleep(50);
  await p.eval(down);
  await sleep(50);
  check("reaction: restarted and waiting", (await state()) === "waiting");
  await p.click("[data-testid=pause]");
  await sleep(4800);
  check("reaction: pause cancels the green light", (await state()) !== "go" && (await p.count("[data-testid=paused-overlay]")) === 1, await state());
  await p.click("[data-testid=resume]");
  await notFrozen(p, "reaction");
  check("reaction: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Quiz Blitz
await step("quiz-blitz", async () => {
  const p = await freshPage();
  await p.goto(`${BASE}/games/quiz-blitz`);
  await p.waitFor("document.querySelector('[data-testid=start]')", 6000);
  await closeHow(p);
  await p.click("[data-testid=start]");
  await p.waitFor("document.querySelector('[data-testid=qb-card]')", 5000);
  const ids = new Set();
  for (let i = 0; i < 10; i++) {
    await p.waitFor("document.querySelector('[data-testid=qb-option]:not([disabled])')", 3000);
    ids.add(await p.eval("document.querySelector('[data-testid=qb-card]').dataset.qid"));
    if (i === 3) {
      // Pause freezes the question timer.
      await p.click("[data-testid=pause]");
      const a = await p.text("[data-testid=qb-time]");
      await sleep(1200);
      check("quiz: pause stops question timer", a === (await p.text("[data-testid=qb-time]")));
      await p.click("[data-testid=resume]");
    }
    // Answer 8 right, 1 wrong, 1 via keyboard.
    if (i === 4) await p.eval("document.querySelector('[data-testid=qb-option][data-correct=\"0\"]').click()");
    else if (i === 6) {
      const pos = await p.eval("[...document.querySelectorAll('[data-testid=qb-option]')].findIndex(o => o.dataset.correct === '1')");
      await p.eval(`window.dispatchEvent(new KeyboardEvent('keydown', { key: '${pos + 1}' }))`);
    } else await p.eval("document.querySelector('[data-testid=qb-option][data-correct=\"1\"]').click()");
    await sleep(100);
    const kind = await p.eval("document.querySelector('[data-testid=qb-feedback]')?.dataset.kind");
    if (i === 0) {
      check("quiz: instant feedback (correct)", kind === "correct");
      await shot(p, "50-quiz-correct");
    }
    if (i === 4) {
      check("quiz: instant feedback (wrong) shows answer", kind === "wrong" && (await p.text("[data-testid=qb-feedback]"))?.includes("Answer:"));
      await shot(p, "51-quiz-wrong");
    }
    if (i === 6) check("quiz: keyboard answer works", kind === "correct");
    await p.click("[data-testid=qb-next]");
  }
  check("quiz: 10 different questions", ids.size === 10, [...ids].join(","));
  await p.waitFor("document.querySelector('[data-testid=result]')", 3000);
  check("quiz: 9/10 correct", (await p.text("[data-testid=qb-correct]"))?.includes("9"), await p.text("[data-testid=qb-correct]"));
  await shot(p, "52-quiz-result");
  // Timeout path: start again and let a question expire (fast-forward clock).
  await p.click("[data-testid=play-again]");
  await p.waitFor("document.querySelector('[data-testid=qb-card]')", 5000);
  await p.eval("(() => { const real = performance.now.bind(performance); let off = 0; performance.now = () => real() + off; window.__ff = (ms) => { off += ms; }; })()");
  for (let i = 0; i < 20 && !(await p.count("[data-testid=qb-feedback]")); i++) {
    await p.eval("window.__ff(1000)");
    await sleep(120);
  }
  check("quiz: question times out", (await p.eval("document.querySelector('[data-testid=qb-feedback]')?.dataset.kind")) === "timeout");
  await notFrozen(p, "quiz");
  check("quiz: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Leaderboard + Profile (with data)
await step("leaderboard-profile", async () => {
  // Re-use the storage from a seeded run: play results are injected directly.
  const seed = `
    localStorage.setItem('brainarena.progress.v1', JSON.stringify({ version: 1, nickname: 'Brainiac', totalPoints: 1234, gamesPlayed: 3, wins: 2,
      bests: { 'quick-math': 420, 'reaction-time': 280, 'quiz-blitz': 900 }, plays: { 'quick-math': 1, 'reaction-time': 1, 'quiz-blitz': 1 },
      history: [{ id: 'a', game: 'quick-math', score: 420, points: 420, won: true, at: Date.now() - 60000 }, { id: 'b', game: 'reaction-time', score: 280, points: 400, won: true, at: Date.now() - 30000 }, { id: 'c', game: 'quiz-blitz', score: 900, points: 900, won: false, at: Date.now() }],
      leaderboard: { 'quick-math': [{ id: 'a', name: 'Brainiac', score: 420, at: Date.now() }], 'memory-match': [], 'word-hunt': [], 'reaction-time': [{ id: 'b', name: 'Brainiac', score: 280, at: Date.now() }], 'quiz-blitz': [{ id: 'c', name: 'Brainiac', score: 900, at: Date.now() }] },
      badges: { first: Date.now(), speedy: Date.now() }, winStreak: 0, lossStreak: 1, daily: { lastDone: null, streak: 0, best: 0 } }));`;
  const p = await freshPage({ extra: `if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); ${seed} }` });
  await p.goto(`${BASE}/leaderboard?game=reaction-time`);
  await p.waitFor("document.querySelector('[data-testid=lb-row]')", 5000);
  check("leaderboard: deep link selects game tab", await p.eval("document.querySelector('[data-testid=lb-tab-reaction-time]').getAttribute('aria-selected') === 'true'"));
  check("leaderboard: shows ms score", (await p.text("[data-testid=lb-table]"))?.includes("280 ms"));
  await p.click("[data-testid=lb-tab-memory-match]");
  check("leaderboard: empty state", (await p.count("[data-testid=lb-empty]")) === 1);
  await shot(p, "60-leaderboard-empty");
  await p.click("[data-testid=lb-tab-quiz-blitz]");
  await shot(p, "61-leaderboard");
  await p.goto(`${BASE}/profile`);
  await p.waitFor("document.querySelector('[data-testid=brain-chart] svg')", 5000);
  check("profile: brain stats radar chart renders", (await p.count("[data-testid=brain-chart] .recharts-polygon")) > 0);
  check("profile: rank Curious Cat at 1234 pts", (await p.text("[data-testid=profile-rank]"))?.includes("Clever Fox") || (await p.text("[data-testid=profile-rank]"))?.includes("Curious Cat"), await p.text("[data-testid=profile-rank]"));
  check("profile: badges grid (14)", (await p.count("[data-testid^=badge-]")) === 14);
  check("profile: unlocked badges marked", (await p.count("[data-unlocked='1']")) === 2);
  check("profile: history list", (await p.count("[data-testid=history] li")) === 3);
  // Nickname change.
  await p.fill("[data-testid=nickname-input]", "Galaxy Gran");
  await p.click("[data-testid=nickname-save]");
  check("profile: nickname saved", (await p.eval("JSON.parse(localStorage.getItem('brainarena.progress.v1')).nickname")) === "Galaxy Gran");
  await notFrozen(p, "profile");
  // Resize several times: the chart must not loop or freeze.
  for (const w of [900, 420, 1200, 700]) {
    await p.viewport(w, 900);
    await sleep(250);
  }
  await notFrozen(p, "profile after resizes");
  await p.viewport(1366, 900);
  await sleep(300);
  await shot(p, "62-profile");
  // Reset.
  await p.click("[data-testid=reset]");
  await p.click("[data-testid=reset-confirm]");
  await sleep(200);
  check("profile: reset clears progress, keeps nickname", (await p.count("[data-testid=history-empty]")) === 1 && (await p.eval("JSON.parse(localStorage.getItem('brainarena.progress.v1')).nickname")) === "Galaxy Gran");
  check("profile: empty stats state", (await p.count("[data-testid=stats-empty]")) === 1);
  check("leaderboard/profile: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Daily challenge
await step("daily", async () => {
  const p = await freshPage();
  await p.goto(`${BASE}/`);
  const game = await p.eval("document.querySelector('[data-testid=daily-card]').dataset.game");
  // Pretend yesterday was done (streak 2) so today extends it to 3.
  await p.eval(`(() => { const d = new Date(Date.now() - 86400000); const k = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); const pr = JSON.parse(localStorage.getItem('brainarena.progress.v1') ?? 'null') ?? {}; pr.daily = { lastDone: k, streak: 2, best: 2 }; localStorage.setItem('brainarena.progress.v1', JSON.stringify(pr)); })()`);
  await p.goto(`${BASE}/`);
  check("daily: streak alive from yesterday", (await p.text("[data-testid=daily-streak]"))?.includes("2"));
  await p.click("[data-testid=daily-play]");
  await p.waitFor(`location.pathname === '/games/${game}'`, 5000);
  check("daily: play button opens today's game", true, game);
  // Finish the daily game the quickest way per game.
  await p.waitFor("document.querySelector('[data-testid=game-title]')", 6000);
  await closeHow(p);
  if (game === "reaction-time") {
    const down = "document.querySelector('[data-testid=rt-panel]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))";
    for (let r = 0; r < 5; r++) {
      await p.eval(down);
      await p.waitFor("document.querySelector('[data-testid=rt-panel]')?.dataset.state === 'go'", 6000);
      await p.eval(down);
      await sleep(60);
    }
  } else if (game === "word-hunt") {
    await p.waitFor("document.querySelector('[data-testid=wh-board]')", 4000);
    const ans = await p.eval("document.querySelector('[data-testid=wh-board]').dataset.answer");
    for (const ch of ans) await p.eval(`document.querySelector('[data-testid=wh-keyboard] [data-key="${ch}"]').click()`);
    await p.click("[data-key=enter]");
  } else if (game === "memory-match") {
    await p.click("[data-testid=start]");
    const faces = await p.eval("[...document.querySelectorAll('[data-testid=mm-card]')].map(c => Number(c.dataset.face))");
    const byFace = {};
    faces.forEach((f, i) => (byFace[f] ??= []).push(i));
    for (const [, [x, y]] of Object.entries(byFace)) {
      await p.eval(`document.querySelectorAll('[data-testid=mm-card]')[${x}].click()`);
      await p.eval(`document.querySelectorAll('[data-testid=mm-card]')[${y}].click()`);
      await sleep(20);
    }
  } else if (game === "quiz-blitz") {
    await p.click("[data-testid=start]");
    for (let i = 0; i < 10; i++) {
      await p.waitFor("document.querySelector('[data-testid=qb-option]:not([disabled])')", 3000);
      await p.eval("document.querySelector('[data-testid=qb-option][data-correct=\"1\"]').click()");
      await p.click("[data-testid=qb-next]");
    }
  } else {
    await p.click("[data-testid=start]");
    await p.waitFor("document.querySelector('[data-testid=qm-problem]')", 4000);
    await p.eval("(() => { const real = performance.now.bind(performance); let off = 0; performance.now = () => real() + off; window.__ff = (ms) => { off += ms; }; })()");
    for (let i = 0; i < 90 && !(await p.count("[data-testid=result]")); i++) {
      await p.eval("window.__ff(1000)");
      await sleep(110);
    }
  }
  await p.waitFor("document.querySelector('[data-testid=result]')", 5000);
  check("daily: completion toast", await p.waitFor("[...document.querySelectorAll('[data-testid=toast]')].some(t => t.innerText.includes('Daily challenge complete'))", 3000).catch(() => false));
  await p.goto(`${BASE}/`);
  check("daily: card shows done + countdown", (await p.eval("document.querySelector('[data-testid=daily-card]').dataset.done")) === "1" && (await p.text("[data-testid=daily-card]"))?.includes("Next challenge in"));
  check("daily: streak extended to 3", (await p.text("[data-testid=daily-streak]"))?.includes("3"));
  check("daily: Habit Hero badge at 3-day streak", await p.eval("!!JSON.parse(localStorage.getItem('brainarena.progress.v1')).badges.habit"));
  await shot(p, "70-daily-done");
  check("daily: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

// ------------------------------------------------------------------ Languages x pages, mobile, dark
const PAGES = ["/", "/games/quick-math", "/games/memory-match", "/games/word-hunt", "/games/reaction-time", "/games/quiz-blitz", "/leaderboard", "/profile", "/this-page-does-not-exist"];
const EXPECT = {
  en: { tagline: "sudden intelligence", home: "Welcome to the Brain Arena", nf: "Brainy lost this page" },
  ta: { tagline: "புத்திசாலித்தனம்", home: "வரவேற்கிறோம்", nf: "தொலைச்சுடுச்சு" },
  hi: { tagline: "समझदारी", home: "स्वागत", nf: "खो दिया" },
};
for (const lang of ["en", "ta", "hi"]) {
  for (const variant of [
    { name: "desktop", width: 1366, height: 900, mobile: false, dark: false },
    { name: "mobile-dark", width: 390, height: 844, mobile: true, dark: true },
  ]) {
    await step(`${lang} ${variant.name}`, async () => {
      const p = await freshPage({ ...variant, lang });
      let overflow = [];
      for (const path of PAGES) {
        await p.goto(`${BASE}${path}`, { wait: 350 });
        await closeHow(p);
        const ok = (await p.text("[data-testid=tagline]"))?.includes(EXPECT[lang].tagline);
        if (!ok) check(`${lang} ${variant.name} ${path}: translated tagline`, false, await p.text("[data-testid=tagline]"));
        const ow = await p.eval("document.documentElement.scrollWidth - window.innerWidth");
        if (ow > 1) overflow.push(`${path}:${ow}px`);
        if (path === "/") check(`${lang} ${variant.name}: home translated`, (await p.text("[data-testid=hero-title]"))?.includes(EXPECT[lang].home));
        if (path.startsWith("/this-page")) check(`${lang} ${variant.name}: funny 404`, (await p.text("[data-testid=not-found]"))?.includes(EXPECT[lang].nf));
        if (SHOTS && (path === "/" || path === "/games/word-hunt" || path === "/profile" || path.startsWith("/this-page") || (lang === "ta" && path.includes("quiz")))) await shot(p, `80-${lang}-${variant.name}-${path.replace(/\//g, "_") || "home"}`);
      }
      check(`${lang} ${variant.name}: html lang attribute`, (await p.eval("document.documentElement.lang")) === lang);
      check(`${lang} ${variant.name}: dark mode class`, (await p.eval("document.documentElement.classList.contains('dark')")) === variant.dark);
      check(`${lang} ${variant.name}: no horizontal overflow on ${PAGES.length} pages`, overflow.length === 0, overflow.join(" "));
      // Quiz in this language: question text is translated.
      await p.goto(`${BASE}/games/quiz-blitz`, { wait: 300 });
      await closeHow(p);
      await p.click("[data-testid=start]");
      await p.waitFor("document.querySelector('[data-testid=qb-question]')", 5000);
      const q = await p.text("[data-testid=qb-question]");
      const script = { en: /[A-Za-z]/, ta: /[\u0B80-\u0BFF]/, hi: /[\u0900-\u097F]/ }[lang];
      check(`${lang} ${variant.name}: quiz question in language`, script.test(q ?? ""), q);
      await p.eval("document.querySelector('[data-testid=qb-option][data-correct=\"0\"]').click()");
      await sleep(100);
      const fb = await p.text("[data-testid=qb-feedback]");
      check(`${lang} ${variant.name}: funny wrong-answer line translated`, script.test(fb ?? "") && (fb ?? "").length > 10);
      if (variant.mobile) await shot(p, `81-${lang}-mobile-quiz-feedback`);
      // Language switcher works live.
      const other = lang === "en" ? "hi" : "en";
      await p.fill("[data-testid=lang-select]", other);
      await sleep(150);
      check(`${lang} ${variant.name}: switcher changes language live`, (await p.text("[data-testid=tagline]"))?.includes(EXPECT[other].tagline) && (await p.eval("localStorage.getItem('brainarena.lang')")) === other);
      await notFrozen(p, `${lang} ${variant.name}`);
      check(`${lang} ${variant.name}: no console errors`, p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
      await p.close();
    });
  }
}

// ------------------------------------------------------------------ Mobile touch play (word + memory)
await step("mobile touch", async () => {
  const p = await freshPage({ width: 375, height: 740, mobile: true });
  await p.goto(`${BASE}/games/memory-match`);
  await closeHow(p);
  await p.click("[data-testid=mm-size] [data-value='6']");
  await p.click("[data-testid=start]");
  const box = await p.eval("(() => { const r = document.querySelector('[data-testid=mm-card]').getBoundingClientRect(); return { w: r.width, h: r.height }; })()");
  check("mobile: 6x6 cards are touch-sized (>= 44px)", box.w >= 44, `${Math.round(box.w)}px`);
  check("mobile: 6x6 board fits the screen", (await p.eval("document.documentElement.scrollWidth - window.innerWidth")) <= 1);
  await shot(p, "90-mobile-memory-6x6");
  await p.goto(`${BASE}/games/word-hunt`);
  await closeHow(p);
  const kw = await p.eval("document.querySelector('[data-testid=wh-keyboard] [data-key=q]').getBoundingClientRect().width");
  check("mobile: word keyboard keys usable", kw >= 26, `${Math.round(kw)}px`);
  const kbBottom = await p.eval("Math.round(document.querySelector('[data-testid=wh-keyboard] [data-key=enter]').getBoundingClientRect().bottom - window.innerHeight)");
  check("mobile: whole word keyboard visible without scrolling (375x740)", kbBottom <= 0, `${kbBottom}px past fold`);
  await shot(p, "91-mobile-word");
  await p.goto(`${BASE}/games/reaction-time`);
  await closeHow(p);
  await shot(p, "92-mobile-reaction");
  check("mobile: no console errors", p.errors.length === 0, p.errors.slice(0, 2).join(" | "));
  await p.close();
});

await close();
clearTimeout(watchdog);
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("Failures:");
  failed.forEach((f) => console.log(` - ${f.name} ${f.detail}`));
  process.exit(1);
}
process.exit(0);
