"use client";
// Quiz Blitz: 10 multiple-choice questions (2 each from science, sports,
// geography, tech and "just for fun"), 15 s per question, instant feedback.
// Correct = 100 pts + up to 50 speed bonus. 6/10 or better counts as a win.
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, type LinePool } from "@/i18n";
import { buildQuizRound, quizPoints, type QuizRoundQuestion } from "@/lib/quiz";
import { useTicker } from "@/lib/hooks";
import { brainyReact } from "@/lib/signals";
import { play } from "@/lib/sound";
import { Countdown } from "@/components/game/Countdown";
import { GameShell, ResultCard, SetupCard, StatChip } from "@/components/game/GameShell";
import { useFinish, type FinishInfo } from "@/components/game/useFinish";

const LIMIT = 15_000;
const TOTAL = 10;
const CAT_ICON = { science: "🔬", sports: "🏏", geography: "🌍", tech: "💻", funny: "🤪" } as const;

type Phase = "setup" | "countdown" | "question" | "feedback" | "done";

export default function QuizBlitz() {
  const { t, line, randomLine, lang, formatNumber } = useI18n();
  const finishGame = useFinish();
  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<QuizRoundQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [left, setLeft] = useState(LIMIT);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [fb, setFb] = useState<{ pool: LinePool; index: number; kind: "correct" | "wrong" | "timeout" } | null>(null);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<FinishInfo | null>(null);
  const answered = useRef(false);

  const begin = useCallback(() => {
    setRound(buildQuizRound());
    setQi(0);
    setScore(0);
    setCorrect(0);
    setPicked(null);
    setFb(null);
    setPaused(false);
    setResult(null);
    setPhase("countdown");
  }, []);

  const startQuestion = useCallback(() => {
    answered.current = false;
    setLeft(LIMIT);
    setPicked(null);
    setFb(null);
    setPhase("question");
  }, []);

  useTicker(phase === "question" && !paused, (dt) => setLeft((v) => Math.max(0, v - dt)), 100);

  const answer = useCallback(
    (pos: number | null) => {
      if (answered.current || phase !== "question") return;
      answered.current = true;
      const q = round[qi];
      const orig = pos === null ? -1 : q.order[pos];
      const ok = orig === 0;
      setPicked(pos);
      if (ok) {
        setScore((s) => s + quizPoints(left / 1000, LIMIT / 1000));
        setCorrect((c) => c + 1);
        play("ding");
        const idx = randomLine("correct");
        setFb({ pool: "correct", index: idx, kind: "correct" });
        brainyReact("happy", { pool: "correct", index: idx }, 1500);
      } else {
        play(pos === null ? "slideDown" : "buzz");
        const idx = randomLine("wrong");
        setFb({ pool: "wrong", index: idx, kind: pos === null ? "timeout" : "wrong" });
        brainyReact(pos === null ? "sleepy" : "shocked", { pool: "wrong", index: idx }, 1500);
      }
      setPhase("feedback");
    },
    [phase, round, qi, left, randomLine],
  );

  // Time ran out on this question.
  useEffect(() => {
    if (phase === "question" && left <= 0) answer(null);
  }, [phase, left, answer]);

  const next = () => {
    if (qi + 1 >= TOTAL) {
      setPhase("done");
      setResult(
        finishGame({
          game: "quiz-blitz",
          score,
          points: score,
          won: correct >= 6,
          meta: { correct },
        }),
      );
      return;
    }
    play("click");
    setQi((v) => v + 1);
    startQuestion();
  };

  // Keyboard: 1-4 / A-D to answer, Enter for next.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyRef.current = (e: KeyboardEvent) => {
      if (paused || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.("[role=dialog]")) return;
      if (phase === "question") {
        const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
        const pos = map[e.key.toLowerCase()];
        if (pos !== undefined) answer(pos);
      } else if (phase === "feedback" && e.key === "Enter") next();
    };
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const q = round[qi];
  const secs = Math.ceil(left / 1000);

  return (
    <GameShell
      game="quiz-blitz"
      canPause={phase === "question"}
      paused={paused}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      onRestart={() => (phase === "setup" ? undefined : begin())}
      stats={
        phase === "question" || phase === "feedback" ? (
          <>
            <StatChip label={t("common.question")} value={`${qi + 1}/${TOTAL}`} testId="qb-index" />
            <StatChip label={t("common.time")} value={t("quiz.secondsLeft", { n: secs })} testId="qb-time" highlight={secs <= 5 && phase === "question"} />
            <StatChip label={t("common.score")} value={formatNumber(score)} testId="qb-score" />
          </>
        ) : null
      }
    >
      {phase === "setup" && (
        <SetupCard title={t("games.quiz-blitz.short")}>
          <div className="flex flex-wrap justify-center gap-2">
            {(["science", "sports", "geography", "tech", "funny"] as const).map((c) => (
              <span key={c} className="chip">
                {CAT_ICON[c]} {t(`quiz.${c}`)}
              </span>
            ))}
          </div>
          <button type="button" className="btn-primary px-8 text-lg" onClick={begin} data-testid="start">
            ⚡ {t("common.start")}
          </button>
        </SetupCard>
      )}

      {phase === "countdown" && (
        <div className="card">
          <Countdown onDone={startQuestion} />
        </div>
      )}

      {(phase === "question" || phase === "feedback") && q && (
        <div className="card p-4 sm:p-6" data-testid="qb-card" data-qid={q.question.id}>
          <div className="h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-100 ${secs <= 5 ? "bg-rose-500" : "bg-linear-to-r from-teal-400 to-violet-500"}`}
              style={{ width: `${(left / LIMIT) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="chip">
              {CAT_ICON[q.question.cat]} {t(`quiz.${q.question.cat}`)}
            </span>
          </div>
          <h2 className="font-display mt-3 text-2xl leading-snug font-extrabold text-violet-900 sm:text-3xl dark:text-violet-50" data-testid="qb-question">
            {q.question.q[lang]}
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {q.order.map((orig, pos) => {
              const isCorrect = orig === 0;
              const reveal = phase === "feedback";
              const chosen = picked === pos;
              const cls = !reveal
                ? "border-violet-200 bg-white hover:border-violet-400 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                : isCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100"
                  : chosen
                    ? "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100 animate-shake"
                    : "border-transparent bg-slate-100 opacity-60 dark:bg-white/5";
              return (
                <button
                  key={pos}
                  type="button"
                  disabled={reveal}
                  onClick={() => answer(pos)}
                  data-testid="qb-option"
                  data-correct={isCorrect ? "1" : "0"}
                  className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start text-base font-bold transition active:scale-[0.98] disabled:cursor-default ${cls}`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-600 text-sm text-white">{reveal && isCorrect ? "✓" : reveal && chosen ? "✗" : "ABCD"[pos]}</span>
                  <span>{q.question.options[lang][orig]}</span>
                </button>
              );
            })}
          </div>
          {phase === "feedback" && fb && (
            <div className="animate-slide-up mt-4 flex flex-col items-center gap-2 text-center" data-testid="qb-feedback" data-kind={fb.kind}>
              <p className={`font-display text-2xl font-extrabold ${fb.kind === "correct" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500"}`}>
                {fb.kind === "correct" ? `🎉 ${t("quiz.correct")}` : fb.kind === "timeout" ? `⏰ ${t("quiz.timeout")}` : `🙈 ${t("quiz.wrong")}`}
              </p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{line(fb.pool, fb.index)}</p>
              {fb.kind !== "correct" && <p className="text-sm text-slate-500 dark:text-slate-400">{t("quiz.answerWas", { a: q.question.options[lang][0] })}</p>}
              <button type="button" className="btn-primary mt-1 px-8" onClick={next} data-testid="qb-next">
                {qi + 1 >= TOTAL ? `🏁 ${t("quiz.finish")}` : `➡️ ${t("quiz.next")}`}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "done" && result && (
        <ResultCard info={result} onPlayAgain={begin}>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200" data-testid="qb-correct">
            {t("quiz.correctOf", { n: correct })}
          </p>
        </ResultCard>
      )}
    </GameShell>
  );
}
