"use client";
// Quick Math: 60-second arithmetic sprint. Correct answers are accepted the
// moment they are typed; a wrong answer is judged once enough digits are typed
// (or on Check/Enter). 3+ in a row starts a combo multiplier (max x3).
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { comboMultiplier, makeProblem, mathPoints, WIN_SOLVED, type Difficulty, type MathProblem } from "@/lib/math";
import { getPrefs, setSetup } from "@/lib/store";
import { useTicker } from "@/lib/hooks";
import { brainyReact } from "@/lib/signals";
import { play } from "@/lib/sound";
import { Countdown } from "@/components/game/Countdown";
import { GameShell, ResultCard, Segmented, SetupCard, StatChip } from "@/components/game/GameShell";
import { useFinish, type FinishInfo } from "@/components/game/useFinish";
import type { LinePool } from "@/i18n";

const DURATION = 60_000;
type Phase = "setup" | "countdown" | "playing" | "done";

export default function QuickMath() {
  const { t, line, randomLine, formatNumber } = useI18n();
  const finishGame = useFinish();
  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<Difficulty>("easy");
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [problem, setProblem] = useState<MathProblem>({ text: "", answer: 0 });
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [feedback, setFeedback] = useState<{ pool: LinePool; index: number; ok: boolean; seq: number } | null>(null);
  const [shake, setShake] = useState(0);
  const [result, setResult] = useState<FinishInfo | null>(null);
  const finished = useRef(false);
  // Refs mirror the live values so two presses in the same tick never read stale state.
  const live = useRef({ input: "", problem: { text: "", answer: 0 } as MathProblem, streak: 0 });
  const setIn = (v: string) => {
    live.current.input = v;
    setInput(v);
  };

  useEffect(() => {
    const saved = getPrefs().setup["quick-math.level"];
    if (saved === "easy" || saved === "medium" || saved === "hard") setLevel(saved);
  }, []);

  const begin = useCallback(() => {
    finished.current = false;
    setTimeLeft(DURATION);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSolved(0);
    setIn("");
    live.current.streak = 0;
    setFeedback(null);
    setPaused(false);
    setResult(null);
    setPhase("countdown");
  }, []);

  const start = useCallback(() => {
    const p = makeProblem(level);
    live.current.problem = p;
    setProblem(p);
    setPhase("playing");
  }, [level]);

  const running = phase === "playing" && !paused;
  useTicker(running, (dt) => setTimeLeft((v) => Math.max(0, v - dt)), 100);

  // Time's up -> finish exactly once.
  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0 || finished.current) return;
    finished.current = true;
    setPhase("done");
    setResult(
      finishGame({
        game: "quick-math",
        score,
        points: score,
        won: solved >= WIN_SOLVED[level],
        meta: { difficulty: level, maxCombo: maxStreak, solved },
      }),
    );
  }, [phase, timeLeft, score, solved, level, maxStreak, finishGame]);

  const judge = useCallback(
    (value: string, force: boolean) => {
      if (!running || !value) return;
      const cur = live.current.problem;
      const correct = Number(value) === cur.answer;
      const ready = force || value.length >= String(cur.answer).length;
      if (!correct && !ready) return;
      if (correct) {
        const s = live.current.streak + 1;
        live.current.streak = s;
        setStreak(s);
        setMaxStreak((m) => Math.max(m, s));
        setScore((v) => v + mathPoints(level, s));
        setSolved((v) => v + 1);
        play(s >= 3 ? "ding" : "pop");
        if (s % 5 === 0) brainyReact("dancing", null, 1200);
        else brainyReact("happy", null, 900);
        setFeedback({ pool: "correct", index: randomLine("correct"), ok: true, seq: Date.now() });
      } else {
        live.current.streak = 0;
        setStreak(0);
        setShake((v) => v + 1);
        play("buzz");
        brainyReact("shocked", null, 1000);
        setFeedback({ pool: "wrong", index: randomLine("wrong"), ok: false, seq: Date.now() });
      }
      setIn("");
      const next = makeProblem(level);
      live.current.problem = next;
      setProblem(next);
    },
    [running, level, randomLine],
  );

  const press = useCallback(
    (key: string) => {
      if (!running) return;
      if (key === "C") return setIn("");
      if (key === "⌫") return setIn(live.current.input.slice(0, -1));
      if (key === "=") return judge(live.current.input, true);
      if (!/^\d$/.test(key)) return;
      const next = (live.current.input + key).slice(0, 4);
      setIn(next);
      play("click");
      judge(next, false);
    },
    [running, judge],
  );

  // Physical keyboard support. The handler is read through a ref, so the
  // listener is attached once per phase instead of on every keystroke.
  const pressRef = useRef(press);
  useEffect(() => {
    pressRef.current = press;
  });
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (/^\d$/.test(k)) pressRef.current(k);
      else if (k === "Backspace") pressRef.current("⌫");
      else if (k === "Enter") pressRef.current("=");
      else if (k === "Escape" || k === "Delete") pressRef.current("C");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const secs = Math.ceil(timeLeft / 1000);
  const mult = comboMultiplier(streak);
  const levels: { value: Difficulty; label: string }[] = [
    { value: "easy", label: `😌 ${t("common.easy")}` },
    { value: "medium", label: `🤔 ${t("common.medium")}` },
    { value: "hard", label: `🔥 ${t("common.hard")}` },
  ];

  return (
    <GameShell
      game="quick-math"
      canPause={phase === "playing"}
      paused={paused}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      onRestart={() => (phase === "setup" ? setPhase("setup") : begin())}
      stats={
        phase === "playing" || phase === "done" ? (
          <>
            <StatChip label={t("common.time")} value={`${secs}s`} testId="qm-time" highlight={secs <= 10 && phase === "playing"} />
            <StatChip label={t("common.score")} value={formatNumber(score)} testId="qm-score" />
            <StatChip label={t("quickMath.correct")} value={solved} testId="qm-solved" />
            <StatChip label={t("quickMath.combo", { n: mult })} value={`🔥 ${streak}`} testId="qm-combo" highlight={mult > 1} />
          </>
        ) : null
      }
    >
      {phase === "setup" && (
        <SetupCard title={t("quickMath.pickDifficulty")}>
          <Segmented
            label={t("common.difficulty")}
            value={level}
            options={levels}
            onChange={(v) => {
              setLevel(v);
              setSetup("quick-math.level", v);
            }}
            testId="qm-level"
          />
          <button type="button" className="btn-primary px-8 text-lg" onClick={begin} data-testid="start">
            🚀 {t("common.start")}
          </button>
        </SetupCard>
      )}

      {phase === "countdown" && (
        <div className="card">
          <Countdown onDone={start} />
        </div>
      )}

      {phase === "playing" && (
        <div className="card p-4 sm:p-6" data-testid="qm-board">
          <div className="h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-linear-to-r from-teal-400 to-violet-500 transition-[width] duration-100" style={{ width: `${(timeLeft / DURATION) * 100}%` }} />
          </div>
          <div key={shake} className={`mt-5 text-center ${shake ? "animate-shake" : ""}`}>
            <div className="font-display text-5xl font-extrabold text-violet-800 tabular-nums sm:text-6xl dark:text-violet-100" data-testid="qm-problem" data-answer={problem.answer}>
              {problem.text} = ?
            </div>
            <div
              className="mx-auto mt-4 flex h-16 max-w-56 items-center justify-center rounded-2xl border-4 border-dashed border-violet-300 bg-white text-4xl font-extrabold text-teal-600 tabular-nums dark:border-violet-400/40 dark:bg-white/5 dark:text-teal-300"
              aria-label={t("quickMath.answer")}
              aria-live="polite"
              data-testid="qm-input"
            >
              {input || <span className="text-violet-200 dark:text-white/20">?</span>}
            </div>
          </div>
          <p className={`mt-3 min-h-6 text-center text-sm font-bold ${feedback?.ok ? "text-teal-600 dark:text-teal-300" : "text-rose-500"}`} key={feedback?.seq} data-testid="qm-feedback">
            {feedback ? line(feedback.pool, feedback.index) : ""}
          </p>
          <div className="mx-auto mt-3 grid max-w-xs grid-cols-3 gap-2" role="group" aria-label="Keypad">
            {["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "⌫"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => press(k)}
                data-key={k}
                className={`h-14 rounded-2xl text-2xl font-extrabold shadow-sm transition active:scale-90 ${
                  k === "C" || k === "⌫" ? "bg-violet-100 text-violet-700 dark:bg-white/10 dark:text-violet-200" : "bg-white text-slate-800 dark:bg-white/10 dark:text-white"
                }`}
              >
                {k}
              </button>
            ))}
            <button type="button" onClick={() => press("=")} className="btn-primary col-span-3 h-12" data-testid="qm-submit">
              ✅ {t("quickMath.submit")}
            </button>
          </div>
        </div>
      )}

      {phase === "done" && result && (
        <ResultCard info={result} onPlayAgain={begin}>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("quickMath.solved", { n: solved })} · {t("quickMath.bestCombo")}: {maxStreak} · {t(`common.${level}`)}
          </p>
        </ResultCard>
      )}
    </GameShell>
  );
}
