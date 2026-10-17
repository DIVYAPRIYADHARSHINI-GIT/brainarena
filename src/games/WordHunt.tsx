"use client";
// Word Hunt: Wordle-style 5-letter word game (English for every UI language).
// - One daily word per local date (progress saved, so it can't be replayed),
//   plus unlimited practice words.
// - Easter egg: type L-O-L to get a joke from Brainy.
// - Pause hides the board and stops the clock; Restart starts a practice word.
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { localDateKey } from "@/lib/daily";
import { dailyWord, isValidWord, keyboardStates, randomWord, scoreGuess, shareText, wordPoints, type LetterState } from "@/lib/words";
import { useTicker } from "@/lib/hooks";
import { brainyReact, toast } from "@/lib/signals";
import { play } from "@/lib/sound";
import { GameShell, ResultCard, StatChip } from "@/components/game/GameShell";
import { useFinish, type FinishInfo } from "@/components/game/useFinish";
import { Modal } from "@/components/Modal";
import { BrainySvg } from "@/components/Brainy";

const DAILY_KEY = "brainarena.word.daily.v1";
const ROWS = 6;
const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

interface DailySave {
  date: string;
  guesses: string[];
  done: boolean;
}

function loadDaily(date: string): DailySave {
  try {
    const raw = JSON.parse(localStorage.getItem(DAILY_KEY) ?? "null") as DailySave | null;
    if (raw && raw.date === date && Array.isArray(raw.guesses)) return raw;
  } catch {
    /* ignore */
  }
  return { date, guesses: [], done: false };
}

function saveDaily(s: DailySave) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

const TILE: Record<LetterState, string> = {
  correct: "bg-emerald-500 border-emerald-500 text-white",
  present: "bg-amber-400 border-amber-400 text-white",
  absent: "bg-slate-400 border-slate-400 text-white dark:bg-slate-600 dark:border-slate-600",
};
const KEY_STYLE: Record<LetterState, string> = {
  correct: "bg-emerald-500 text-white",
  present: "bg-amber-400 text-white",
  absent: "bg-slate-400 text-white/90 dark:bg-slate-700",
};

export default function WordHunt() {
  const { t, line, randomLine } = useI18n();
  const finishGame = useFinish();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"daily" | "practice">("daily");
  const [dailyNo, setDailyNo] = useState(0);
  const [dateKey, setDateKey] = useState("");
  const [answer, setAnswer] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrentState] = useState("");
  // Live mirror so fast typing (two keys before a re-render) never drops letters.
  const currentRef = useRef("");
  const setCurrent = useCallback((v: string) => {
    currentRef.current = v;
    setCurrentState(v);
  }, []);
  const [done, setDone] = useState(false);
  const [shakeRow, setShakeRow] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [joke, setJoke] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<FinishInfo | null>(null);
  const [finishing, setFinishing] = useState(false);
  const msgTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);

  // Load today's word + saved progress after mount (localStorage is client-only).
  useEffect(() => {
    const key = localDateKey();
    const { word, number } = dailyWord(key);
    const saved = loadDaily(key);
    setDateKey(key);
    setDailyNo(number);
    setAnswer(word);
    setGuesses(saved.guesses);
    setDone(saved.done);
    setReady(true);
    return () => {
      if (msgTimer.current) window.clearTimeout(msgTimer.current);
      if (finishTimer.current) window.clearTimeout(finishTimer.current);
    };
  }, []);

  const flash = (text: string) => {
    setMsg(text);
    if (msgTimer.current) window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMsg(null), 2200);
  };

  const won = guesses.length > 0 && guesses[guesses.length - 1] === answer;
  const playing = ready && !done && !paused;
  useTicker(playing && guesses.length + current.length > 0, (dt) => setElapsed((v) => v + dt), 250);

  const newPractice = useCallback(() => {
    if (finishTimer.current) window.clearTimeout(finishTimer.current);
    setMode("practice");
    setAnswer((prev) => randomWord(prev));
    setGuesses([]);
    setCurrent("");
    setDone(false);
    setResult(null);
    setFinishing(false);
    setElapsed(0);
    setPaused(false);
    play("slide");
  }, []);

  const backToDaily = () => {
    if (finishTimer.current) window.clearTimeout(finishTimer.current);
    const saved = loadDaily(dateKey);
    setMode("daily");
    setAnswer(dailyWord(dateKey).word);
    setGuesses(saved.guesses);
    setDone(saved.done);
    setCurrent("");
    setResult(null);
    setFinishing(false);
    setElapsed(0);
    setPaused(false);
  };

  const submit = useCallback(() => {
    const current = currentRef.current;
    if (current.length < 5) {
      setShakeRow((v) => v + 1);
      play("buzz");
      flash(t("word.tooShort"));
      return;
    }
    if (!isValidWord(current)) {
      setShakeRow((v) => v + 1);
      play("boing");
      brainyReact("thinking", null, 1200);
      flash(t("word.notInList"));
      return;
    }
    const next = [...guesses, current];
    const isWin = current === answer;
    const isOver = isWin || next.length >= ROWS;
    setGuesses(next);
    setCurrent("");
    const states = scoreGuess(current, answer);
    const greens = states.filter((s) => s === "correct").length;
    if (!isOver) {
      play(greens >= 3 ? "ding" : "flip");
      brainyReact(greens >= 3 ? "happy" : "thinking", null, 1000);
    }
    if (mode === "daily") saveDaily({ date: dateKey, guesses: next, done: isOver });
    if (isOver) {
      setDone(true);
      setFinishing(true);
      // Small delay so the last row's flip animation plays first.
      finishTimer.current = window.setTimeout(() => {
        finishTimer.current = null;
        setResult(
          finishGame({
            game: "word-hunt",
            score: wordPoints(next.length, isWin),
            points: wordPoints(next.length, isWin),
            won: isWin,
            meta: { guesses: next.length, mode },
          }),
        );
      }, 650);
    }
  }, [guesses, answer, mode, dateKey, t, finishGame, setCurrent]);

  const press = useCallback(
    (k: string) => {
      if (!playing) return;
      if (k === "enter") return submit();
      const cur = currentRef.current;
      if (k === "back") {
        setCurrent(cur.slice(0, -1));
        return;
      }
      if (!/^[a-z]$/.test(k) || cur.length >= 5) return;
      const next = cur + k;
      play("click");
      if (next === "lol") {
        // Easter egg!
        play("boing");
        setJoke(randomLine("jokes"));
        brainyReact("dancing", null, 2500);
        setCurrent("");
        return;
      }
      setCurrent(next);
    },
    [playing, submit, setCurrent, randomLine],
  );

  const pressRef = useRef(press);
  useEffect(() => {
    pressRef.current = press;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.("input,textarea,select,[role=dialog]")) return;
      const k = e.key.toLowerCase();
      if (k === "enter") pressRef.current("enter");
      else if (k === "backspace") pressRef.current("back");
      else if (/^[a-z]$/.test(k)) pressRef.current(k);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const share = async () => {
    const text = shareText({ guesses, answer, won, label: mode === "daily" ? `#${dailyNo}` : "practice" });
    try {
      if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      ta.remove();
    }
    play("pop");
    toast(t("word.copied"), "📋", "success");
  };

  const kb = keyboardStates(guesses, answer);
  const rows = Array.from({ length: ROWS }, (_, r) => (r < guesses.length ? guesses[r] : r === guesses.length ? current : ""));

  return (
    <GameShell
      game="word-hunt"
      canPause={ready && !done && guesses.length + current.length > 0}
      paused={paused}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      onRestart={newPractice}
      stats={
        ready ? (
          <>
            <StatChip label={mode === "daily" ? "📅" : "🎯"} value={mode === "daily" ? t("word.daily", { n: dailyNo }) : t("word.practice")} testId="wh-mode" />
            <StatChip label={t("common.time")} value={`${Math.floor(elapsed / 1000)}s`} testId="wh-time" />
          </>
        ) : null
      }
    >
      {!ready ? (
        <div className="card skeleton h-96" />
      ) : (
        <div className="card relative flex flex-col items-center gap-2 p-2.5 sm:gap-3 sm:p-5" data-testid="wh-board" data-answer={answer}>
          <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center px-2 text-center text-sm font-bold">
            {msg && (
              <span className="animate-pop-in rounded-xl bg-violet-700 px-3 py-1.5 text-white shadow-lg" data-testid="wh-msg">
                {msg}
              </span>
            )}
          </div>
          <div className="grid gap-1 sm:gap-1.5" style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` }}>
            {rows.map((word, r) => {
              const submitted = r < guesses.length;
              const states = submitted ? scoreGuess(word, answer) : null;
              const isWinRow = submitted && word === answer;
              return (
                <div key={`${r}-${r === guesses.length ? shakeRow : 0}`} className={`grid grid-cols-5 gap-1 sm:gap-1.5 ${r === guesses.length && shakeRow ? "row-shake" : ""}`} data-testid="wh-row">
                  {Array.from({ length: 5 }, (_, c) => {
                    const ch = word[c] ?? "";
                    const st = states?.[c];
                    return (
                      <div
                        key={c}
                        data-state={st ?? (ch ? "typed" : "empty")}
                        className={`grid h-10 w-10 place-items-center rounded-xl border-2 text-xl min-[400px]:h-12 min-[400px]:w-12 min-[400px]:text-2xl font-extrabold uppercase select-none sm:h-14 sm:w-14 ${
                          st ? `${TILE[st]} tile-reveal ${isWinRow ? "tile-win" : ""}` : ch ? "tile-pop border-violet-400 bg-white text-violet-900 dark:bg-white/10 dark:text-white" : "border-violet-200 bg-white/60 dark:border-white/10 dark:bg-white/5"
                        }`}
                        style={st ? { animationDelay: `${c * 90}ms` } : undefined}
                      >
                        {ch}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {finishing && !result && <p className="text-sm font-bold text-violet-700 dark:text-violet-200">…</p>}

          {!done && (
            <div className="mt-1 flex w-full max-w-lg flex-col gap-1.5" role="group" aria-label={t("word.keyboard")} data-testid="wh-keyboard">
              {KEYS.map((row, ri) => (
                <div key={ri} className="flex justify-center gap-1">
                  {ri === 2 && (
                    <button type="button" onClick={() => press("enter")} data-key="enter" className="h-11 rounded-lg bg-violet-600 px-2 sm:h-12 text-xs font-extrabold text-white uppercase active:scale-95 sm:px-3">
                      {t("word.enter")}
                    </button>
                  )}
                  {row.split("").map((k) => (
                    <button
                      key={k}
                      type="button"
                      data-key={k}
                      onClick={() => press(k)}
                      className={`h-11 min-w-0 flex-1 rounded-lg text-base sm:h-12 font-extrabold uppercase active:scale-95 sm:max-w-11 ${kb[k] ? KEY_STYLE[kb[k]] : "bg-violet-100 text-violet-900 dark:bg-white/10 dark:text-white"}`}
                    >
                      {k}
                    </button>
                  ))}
                  {ri === 2 && (
                    <button type="button" onClick={() => press("back")} data-key="back" aria-label="Backspace" className="h-11 rounded-lg sm:h-12 bg-violet-100 px-3 text-lg font-extrabold text-violet-900 active:scale-95 dark:bg-white/10 dark:text-white">
                      ⌫
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {done && !finishing && result === null && guesses.length > 0 && (
            <DoneToday guesses={guesses} answer={answer} onShare={share} onPractice={newPractice} />
          )}
        </div>
      )}

      {result && (
        <div className="mt-3">
          <ResultCard
            info={result}
            onPlayAgain={newPractice}
            extra={
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" className="btn-ghost" onClick={share} data-testid="wh-share">
                  📤 {t("word.share")}
                </button>
                {mode === "practice" && (
                  <button type="button" className="btn-ghost" onClick={backToDaily}>
                    📅 {t("word.backToDaily")}
                  </button>
                )}
              </div>
            }
          >
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300" data-testid="wh-answer">
              {won ? t("word.solvedIn", { n: guesses.length }) : t("word.answerWas", { word: answer.toUpperCase() })}
            </p>
          </ResultCard>
        </div>
      )}

      <Modal open={joke !== null} onClose={() => setJoke(null)} title={t("word.lolTitle")} testId="joke-modal">
        <div className="flex items-center gap-3">
          <BrainySvg mood="dancing" className="h-20 w-20 shrink-0" />
          <p className="text-lg font-bold text-violet-800 dark:text-violet-100" data-testid="joke-text">
            {joke !== null ? line("jokes", joke) : ""}
          </p>
        </div>
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => setJoke(null)}>
          😂 {t("common.gotIt")}
        </button>
      </Modal>
    </GameShell>
  );
}

/** Shown when the player comes back after finishing today's word. */
function DoneToday({ guesses, answer, onShare, onPractice }: { guesses: string[]; answer: string; onShare: () => void; onPractice: () => void }) {
  const { t } = useI18n();
  const won = guesses[guesses.length - 1] === answer;
  return (
    <div className="mt-2 flex flex-col items-center gap-2 text-center" data-testid="wh-done-today">
      <p className="font-bold text-violet-800 dark:text-violet-100">{t("word.doneToday")}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{won ? t("word.solvedIn", { n: guesses.length }) : t("word.answerWas", { word: answer.toUpperCase() })}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-ghost" onClick={onShare} data-testid="wh-share">
          📤 {t("word.share")}
        </button>
        <button type="button" className="btn-primary" onClick={onPractice} data-testid="wh-practice">
          🎯 {t("word.newPractice")}
        </button>
      </div>
    </div>
  );
}
