// Unit tests for the pure game logic (node --test, no extra packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreGuess, isValidWord, dailyWord, shareText, wordPoints, keyboardStates } from "../../src/lib/words.ts";
import { makeProblem, comboMultiplier, mathPoints } from "../../src/lib/math.ts";
import { makeDeck, memoryPoints } from "../../src/lib/memory.ts";
import { average, reactionPoints } from "../../src/lib/reaction.ts";
import { buildQuizRound, QUESTIONS, QUIZ_CATEGORIES } from "../../src/lib/quiz.ts";
import { addDays, dailyGameFor, liveDailyStreak, nextDailyStreak } from "../../src/lib/daily.ts";
import { rankFor } from "../../src/lib/ranks.ts";
import { defaultProgress, recordGame, sanitizeProgress, brainStats } from "../../src/lib/progress.ts";
import { GAME_IDS } from "../../src/lib/games.ts";
import { mulberry32, pickIndex } from "../../src/lib/random.ts";
import { ANSWERS } from "../../src/lib/wordlist.generated.ts";

test("scoreGuess handles exact, present, absent and repeated letters", () => {
  assert.deepEqual(scoreGuess("crane", "crane"), ["correct", "correct", "correct", "correct", "correct"]);
  assert.deepEqual(scoreGuess("trace", "crane"), ["absent", "correct", "correct", "present", "correct"]);
  // Repeated letter in guess, single in answer: only one gets a colour.
  assert.deepEqual(scoreGuess("geese", "those"), ["absent", "absent", "absent", "correct", "correct"]);
  assert.deepEqual(scoreGuess("allee", "apple"), ["correct", "present", "absent", "absent", "correct"]);
  assert.deepEqual(scoreGuess("speed", "abide"), ["absent", "absent", "present", "absent", "present"]);
});

test("keyboard keeps the best state per letter", () => {
  const kb = keyboardStates(["trace", "crane"], "crane");
  assert.equal(kb.c, "correct");
  assert.equal(kb.t, "absent");
});

test("every answer is a valid guess and the daily word is stable", () => {
  for (const w of ANSWERS) assert.ok(isValidWord(w), w);
  assert.ok(!isValidWord("zzzzz"));
  assert.equal(dailyWord("2026-10-17").word, dailyWord("2026-10-17").word);
  assert.notEqual(dailyWord("2026-10-17").word, dailyWord("2026-10-18").word);
  assert.equal(dailyWord("2026-10-18").number, dailyWord("2026-10-17").number + 1);
});

test("share text is an emoji grid without letters", () => {
  const s = shareText({ guesses: ["trace", "crane"], answer: "crane", won: true, label: "#1" });
  assert.match(s, /2\/6/);
  assert.ok(s.includes("🟩🟩🟩🟩🟩"));
  assert.ok(!/crane|trace/i.test(s));
  assert.equal(wordPoints(1, true), 600);
  assert.equal(wordPoints(6, true), 100);
  assert.equal(wordPoints(6, false), 0);
});

test("math problems always have whole, non-negative answers", () => {
  const rand = mulberry32(42);
  for (const level of ["easy", "medium", "hard"] as const) {
    for (let i = 0; i < 2000; i++) {
      const p = makeProblem(level, rand);
      assert.ok(Number.isInteger(p.answer) && p.answer >= 0, `${level} ${p.text} = ${p.answer}`);
      const expr = p.text.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
      assert.equal(Function(`return (${expr})`)(), p.answer, p.text);
    }
  }
  assert.equal(comboMultiplier(0), 1);
  assert.equal(comboMultiplier(3), 1.5);
  assert.equal(comboMultiplier(30), 3);
  assert.equal(mathPoints("hard", 6), 70);
});

test("memory deck has exact pairs", () => {
  for (const size of [4, 6] as const) {
    const deck = makeDeck(size, mulberry32(7));
    assert.equal(deck.length, size * size);
    const counts = new Map<number, number>();
    deck.forEach((c) => counts.set(c.face, (counts.get(c.face) ?? 0) + 1));
    for (const n of counts.values()) assert.equal(n, 2);
  }
  assert.ok(memoryPoints(4, 8, 20) > memoryPoints(4, 20, 60));
  assert.ok(memoryPoints(4, 500, 5000) > 0);
});

test("reaction helpers", () => {
  assert.equal(average([200, 300, 400]), 300);
  assert.ok(reactionPoints(200) > reactionPoints(400));
  assert.ok(reactionPoints(5000) >= 20);
});

test("quiz round: 10 unique questions, 2 per category, all languages complete", () => {
  const r = buildQuizRound(mulberry32(1));
  assert.equal(r.length, 10);
  assert.equal(new Set(r.map((x) => x.question.id)).size, 10);
  for (const c of QUIZ_CATEGORIES) assert.equal(r.filter((x) => x.question.cat === c).length, 2);
  for (const q of QUESTIONS) {
    for (const l of ["en", "ta", "hi"] as const) {
      assert.ok(q.q[l].length > 3, `${q.id} ${l}`);
      assert.equal(q.options[l].length, 4);
      assert.equal(new Set(q.options[l]).size, 4, `${q.id} ${l} duplicate options`);
    }
  }
});

test("daily challenge rotates through every game and streaks work", () => {
  // Every aligned block of 5 days (counted from 2024-01-01) plays all 5 games.
  for (let block = 0; block < 60; block++) {
    const seen = new Set<string>();
    for (let i = 0; i < 5; i++) seen.add(dailyGameFor(addDays("2024-01-01", block * 5 + i)));
    assert.equal(seen.size, 5, `block ${block}`);
  }
  assert.equal(nextDailyStreak(null, 0, "2026-10-17"), 1);
  assert.equal(nextDailyStreak("2026-10-16", 4, "2026-10-17"), 5);
  assert.equal(nextDailyStreak("2026-10-14", 4, "2026-10-17"), 1);
  assert.equal(liveDailyStreak("2026-10-16", 4, "2026-10-17"), 4);
  assert.equal(liveDailyStreak("2026-10-14", 4, "2026-10-17"), 0);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("ranks", () => {
  assert.equal(rankFor(0).rank.id, "potato");
  assert.equal(rankFor(300).rank.id, "cat");
  assert.equal(rankFor(1000).rank.id, "fox");
  assert.equal(rankFor(2500).rank.id, "wizard");
  assert.equal(rankFor(99999).rank.id, "galaxy");
  assert.equal(rankFor(99999).next, null);
});

test("recordGame: bests, leaderboard, badges, streaks, daily", () => {
  let p = defaultProgress();
  const noon = new Date(2026, 9, 17, 12, 0, 0);
  // First loss -> first + potato badges.
  let r = recordGame(p, { game: "quiz-blitz", score: 300, points: 300, won: false, meta: { correct: 3 } }, noon);
  assert.ok(r.outcome.badges.includes("first"));
  assert.ok(r.outcome.badges.includes("potato"));
  p = r.next;
  r = recordGame(p, { game: "quiz-blitz", score: 200, points: 200, won: false }, noon);
  assert.equal(r.outcome.newBest, false);
  p = r.next;
  // Win after 2 losses -> comeback.
  r = recordGame(p, { game: "quick-math", score: 500, points: 500, won: true, meta: { maxCombo: 12 } }, noon);
  assert.ok(r.outcome.badges.includes("comeback"));
  assert.ok(r.outcome.badges.includes("combo"));
  p = r.next;
  // Reaction: lower is better.
  r = recordGame(p, { game: "reaction-time", score: 280, points: 400, won: true }, noon);
  assert.ok(r.outcome.badges.includes("speedy"));
  p = r.next;
  r = recordGame(p, { game: "reaction-time", score: 350, points: 300, won: true }, noon);
  assert.equal(r.outcome.newBest, false);
  assert.equal(r.next.bests["reaction-time"], 280);
  assert.equal(r.next.leaderboard["reaction-time"][0].score, 280);
  p = r.next;
  // Night owl.
  r = recordGame(p, { game: "word-hunt", score: 400, points: 400, won: true, meta: { guesses: 3 } }, new Date(2026, 9, 18, 1, 30));
  assert.ok(r.outcome.badges.includes("owl"));
  assert.ok(r.outcome.badges.includes("mind"));
  p = r.next;
  // 5 wins in a row -> fire.
  r = recordGame(p, { game: "memory-match", score: 900, points: 900, won: true, meta: { size: 4, moves: 10 } }, noon);
  assert.ok(r.outcome.badges.includes("fire"));
  assert.ok(r.outcome.badges.includes("elephant"));
  assert.ok(r.outcome.badges.includes("explorer"));
  p = r.next;
  // Leaderboard caps at 10.
  for (let i = 0; i < 15; i++) p = recordGame(p, { game: "quiz-blitz", score: i * 10, points: 1, won: true }, noon).next;
  assert.equal(p.leaderboard["quiz-blitz"].length, 10);
  assert.equal(p.leaderboard["quiz-blitz"][0].score, 300);
  // Daily: playing today's game gives the bonus once per day.
  const today = new Date(2026, 9, 20, 10);
  const dg = dailyGameFor("2026-10-20");
  const a = recordGame(defaultProgress(), { game: dg, score: 10, points: 10, won: true }, today);
  assert.equal(a.outcome.dailyCompleted, 1);
  assert.equal(a.outcome.pointsAdded, 60);
  const b = recordGame(a.next, { game: dg, score: 10, points: 10, won: true }, today);
  assert.equal(b.outcome.dailyCompleted, null);
  const stats = brainStats(p);
  for (const v of Object.values(stats)) assert.ok(v >= 0 && v <= 100);
});

test("sanitizeProgress survives garbage", () => {
  const p = sanitizeProgress({ totalPoints: "lots", leaderboard: { "quick-math": [null, { score: 5 }] }, history: [{ game: "nope" }] });
  assert.equal(p.totalPoints, 0);
  assert.equal(p.leaderboard["quick-math"].length, 1);
  assert.equal(p.history.length, 0);
  for (const g of GAME_IDS) assert.ok(Array.isArray(p.leaderboard[g]));
  assert.deepEqual(sanitizeProgress(null), defaultProgress());
});

test("pickIndex uses every line before repeating", () => {
  const seen = new Set<number>();
  for (let i = 0; i < 10; i++) seen.add(pickIndex("test-pool", 10));
  assert.equal(seen.size, 10);
  // No immediate repeat across bag refills.
  let prev = -1;
  for (let i = 0; i < 200; i++) {
    const v = pickIndex("test-pool-2", 10);
    assert.notEqual(v, prev);
    prev = v;
  }
});
