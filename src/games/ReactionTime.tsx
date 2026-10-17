"use client";
// Reaction Time: tap when the panel turns green. 5 rounds, average in ms.
// Uses pointerdown (fires immediately on touch, no 300 ms click delay) and
// performance.now() for timing. A tap during red = "Too soon!" + retry round.
// Pausing cancels the pending red->green timer; resuming restarts the round.
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { average, randomDelay, reactionPoints, REACTION_ROUNDS, REACTION_WIN_MS } from "@/lib/reaction";
import { brainyReact } from "@/lib/signals";
import { play } from "@/lib/sound";
import { GameShell, ResultCard, StatChip } from "@/components/game/GameShell";
import { useFinish, type FinishInfo } from "@/components/game/useFinish";
import { BrainySvg } from "@/components/Brainy";

type State = "idle" | "waiting" | "go" | "early" | "shown" | "done";

export default function ReactionTime() {
  const { t, line, randomLine, formatNumber } = useI18n();
  const finishGame = useFinish();
  const [state, setState] = useState<State>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [early, setEarly] = useState(0);
  const [earlyIdx, setEarlyIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<FinishInfo | null>(null);
  const timer = useRef<number | null>(null);
  const goAt = useRef(0);

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clear, []);

  const arm = useCallback(() => {
    clear();
    setState("waiting");
    timer.current = window.setTimeout(() => {
      timer.current = null;
      goAt.current = performance.now();
      setState("go");
      play("pop");
    }, randomDelay());
  }, []);

  const restart = useCallback(() => {
    clear();
    setTimes([]);
    setLast(null);
    setEarly(0);
    setPaused(false);
    setResult(null);
    setState("idle");
  }, []);

  const tap = () => {
    if (paused) return;
    switch (state) {
      case "idle":
      case "shown":
      case "early":
        play("click");
        arm();
        break;
      case "waiting": {
        clear();
        play("fail");
        setEarly((v) => v + 1);
        const idx = randomLine("tooSoon");
        setEarlyIdx(idx);
        brainyReact("shocked", { pool: "tooSoon", index: idx }, 2200);
        setState("early");
        break;
      }
      case "go": {
        const ms = Math.round(performance.now() - goAt.current);
        const next = [...times, ms];
        setTimes(next);
        setLast(ms);
        if (next.length >= REACTION_ROUNDS) {
          const avg = average(next);
          setState("done");
          setResult(
            finishGame({
              game: "reaction-time",
              score: avg,
              points: reactionPoints(avg),
              won: avg < REACTION_WIN_MS,
              meta: { fastest: Math.min(...next) },
            }),
          );
        } else {
          play(ms < 300 ? "ding" : "boing");
          brainyReact(ms < 300 ? "dancing" : ms < 450 ? "happy" : "sleepy", null, 1100);
          setState("shown");
        }
        break;
      }
    }
  };

  const pause = () => {
    clear();
    setPaused(true);
    if (state === "waiting" || state === "go") setState("idle");
  };

  const round = Math.min(times.length + 1, REACTION_ROUNDS);
  const panel: Record<Exclude<State, "done">, { cls: string; title: string; sub: string }> = {
    idle: { cls: "from-violet-600 to-indigo-600", title: t("reaction.tapToStart", { n: round }), sub: t("reaction.roundOf", { n: round }) },
    waiting: { cls: "from-rose-500 to-red-600", title: t("reaction.wait"), sub: "🔴" },
    go: { cls: "from-emerald-400 to-green-600", title: t("reaction.go"), sub: "🟢" },
    early: { cls: "from-amber-400 to-orange-500", title: t("reaction.tooSoon"), sub: t("reaction.tapRetry") },
    shown: { cls: "from-sky-500 to-violet-600", title: last !== null ? t("reaction.yourTime", { ms: formatNumber(last) }) : "", sub: t("reaction.tapNext") },
  };
  const p = state !== "done" ? panel[state] : null;

  return (
    <GameShell
      game="reaction-time"
      canPause={state !== "done" && times.length + early > 0}
      paused={paused}
      onPause={pause}
      onResume={() => setPaused(false)}
      onRestart={restart}
      stats={
        <>
          <StatChip label={t("common.round")} value={`${Math.min(times.length, REACTION_ROUNDS)}/${REACTION_ROUNDS}`} testId="rt-round" />
          <StatChip label={t("reaction.average")} value={times.length ? `${formatNumber(average(times))}` : "—"} testId="rt-avg" />
          <StatChip label={t("reaction.fastest")} value={times.length ? `${formatNumber(Math.min(...times))}` : "—"} testId="rt-fast" />
        </>
      }
    >
      {p && (
        <button
          type="button"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            tap();
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              if (!e.repeat) tap();
            }
          }}
          data-testid="rt-panel"
          data-state={state}
          className={`relative flex min-h-[22rem] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl bg-linear-to-br p-6 text-center text-white shadow-xl transition-colors duration-75 select-none sm:min-h-[26rem] ${p.cls} ${
            state === "early" ? "animate-shake" : ""
          }`}
          style={{ touchAction: "manipulation" }}
        >
          {state === "early" && (
            <div className="animate-pop-in flex flex-col items-center gap-2">
              <BrainySvg mood="shocked" className="h-28 w-28" />
              <span className="text-5xl">⏰💥</span>
            </div>
          )}
          {state === "go" && <span className="animate-pop-in text-7xl">⚡</span>}
          {state === "waiting" && <BrainySvg mood="thinking" className="h-24 w-24 opacity-90" />}
          {state === "idle" && <BrainySvg mood="happy" className="h-24 w-24" />}
          <span className="font-display text-4xl font-extrabold drop-shadow sm:text-5xl" data-testid="rt-title">
            {p.title}
          </span>
          {state === "early" ? (
            <span className="max-w-sm text-lg font-bold" data-testid="rt-early-line">
              {line("tooSoon", earlyIdx)}
            </span>
          ) : null}
          <span className="text-base font-bold text-white/90">{p.sub}</span>
          {times.length > 0 && (
            <div className="absolute bottom-3 flex gap-1.5">
              {times.map((ms, i) => (
                <span key={i} className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold tabular-nums">
                  {ms}
                </span>
              ))}
            </div>
          )}
        </button>
      )}

      {state === "done" && result && (
        <ResultCard info={result} onPlayAgain={restart}>
          <div className="flex flex-wrap justify-center gap-1.5" data-testid="rt-times">
            {times.map((ms, i) => (
              <span key={i} className="chip tabular-nums">
                {t("common.round")} {i + 1}: {formatNumber(ms)} {t("common.ms")}
              </span>
            ))}
          </div>
          {early > 0 && <p className="text-sm text-slate-500">⏰ × {early}</p>}
        </ResultCard>
      )}
    </GameShell>
  );
}
