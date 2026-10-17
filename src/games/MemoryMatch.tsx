"use client";
// Memory Match: flip two cards; matches stay open. Themes: animals / flags /
// space. Boards: 4x4 (8 pairs) or 6x6 (18 pairs). Timer starts on the first flip.
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { makeDeck, memoryPoints, type BoardSize, type MemoryCard, type MemoryTheme } from "@/lib/memory";
import { getPrefs, setSetup } from "@/lib/store";
import { useTicker } from "@/lib/hooks";
import { brainyReact } from "@/lib/signals";
import { play } from "@/lib/sound";
import { GameShell, ResultCard, Segmented, SetupCard, StatChip } from "@/components/game/GameShell";
import { useFinish, type FinishInfo } from "@/components/game/useFinish";
import { CardBack, MemoryFace, memoryFaceName } from "@/components/MemoryIcons";

type Phase = "setup" | "playing" | "done";

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function MemoryMatch() {
  const { t } = useI18n();
  const finishGame = useFinish();
  const [phase, setPhase] = useState<Phase>("setup");
  const [theme, setTheme] = useState<MemoryTheme>("animals");
  const [size, setSize] = useState<BoardSize>(4);
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<FinishInfo | null>(null);
  const lock = useRef(false);
  // Live mirror of open/matched/moves so two taps in the same tick stay consistent.
  const live = useRef({ open: [] as number[], matched: new Set<number>(), moves: 0 });
  const flipBack = useRef<number | null>(null);

  useEffect(() => {
    const s = getPrefs().setup;
    if (s["memory.theme"] === "animals" || s["memory.theme"] === "flags" || s["memory.theme"] === "space") setTheme(s["memory.theme"]);
    if (s["memory.size"] === "4" || s["memory.size"] === "6") setSize(Number(s["memory.size"]) as BoardSize);
  }, []);

  useEffect(() => () => {
    if (flipBack.current) window.clearTimeout(flipBack.current);
  }, []);

  const begin = useCallback(() => {
    if (flipBack.current) window.clearTimeout(flipBack.current);
    lock.current = false;
    live.current = { open: [], matched: new Set(), moves: 0 };
    setDeck(makeDeck(size));
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setElapsed(0);
    setStarted(false);
    setPaused(false);
    setResult(null);
    setPhase("playing");
    play("slide");
  }, [size]);

  useTicker(phase === "playing" && started && !paused, (dt) => setElapsed((v) => v + dt), 250);

  const flip = (idx: number) => {
    const L = live.current;
    if (phase !== "playing" || paused || lock.current) return;
    if (L.open.includes(idx) || L.matched.has(idx)) return;
    if (!started) setStarted(true);
    play("flip");
    const nextOpen = [...L.open, idx];
    L.open = nextOpen;
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const [a, b] = nextOpen;
    const movesNow = L.moves + 1;
    L.moves = movesNow;
    setMoves(movesNow);
    if (deck[a].face === deck[b].face) {
      const m = new Set(L.matched);
      m.add(a);
      m.add(b);
      L.matched = m;
      L.open = [];
      setMatched(m);
      setOpen([]);
      setTimeout(() => play("ding"), 120);
      brainyReact("happy", null, 900);
      if (m.size === deck.length) {
        const seconds = Math.round(elapsed / 1000);
        const pts = memoryPoints(size, movesNow, seconds);
        setPhase("done");
        setResult(finishGame({ game: "memory-match", score: pts, points: pts, won: true, meta: { moves: movesNow, seconds, size, theme } }));
      }
    } else {
      lock.current = true;
      brainyReact("thinking", null, 900);
      flipBack.current = window.setTimeout(() => {
        flipBack.current = null;
        L.open = [];
        setOpen([]);
        lock.current = false;
        play("boing");
      }, 800);
    }
  };

  const pairs = deck.length / 2;
  const found = matched.size / 2;
  const cols = size === 4 ? "grid-cols-4" : "grid-cols-6";

  return (
    <GameShell
      game="memory-match"
      canPause={phase === "playing" && started}
      paused={paused}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      onRestart={() => (phase === "setup" ? undefined : begin())}
      stats={
        phase !== "setup" ? (
          <>
            <StatChip label={t("common.time")} value={fmtTime(elapsed)} testId="mm-time" />
            <StatChip label={t("common.moves")} value={moves} testId="mm-moves" />
            <StatChip label={t("memory.pairs")} value={`${found}/${pairs}`} testId="mm-pairs" />
          </>
        ) : null
      }
    >
      {phase === "setup" && (
        <SetupCard title={t("memory.pickSetup")}>
          <Segmented
            label={t("common.theme")}
            value={theme}
            onChange={(v) => {
              setTheme(v);
              setSetup("memory.theme", v);
            }}
            options={[
              { value: "animals", label: `🐼 ${t("memory.animals")}` },
              { value: "flags", label: `🏳️ ${t("memory.flags")}` },
              { value: "space", label: `🚀 ${t("memory.space")}` },
            ]}
            testId="mm-theme"
          />
          <Segmented
            label={t("common.size")}
            value={String(size) as "4" | "6"}
            onChange={(v) => {
              setSize(Number(v) as BoardSize);
              setSetup("memory.size", v);
            }}
            options={[
              { value: "4", label: "4 × 4" },
              { value: "6", label: "6 × 6" },
            ]}
            testId="mm-size"
          />
          <button type="button" className="btn-primary px-8 text-lg" onClick={begin} data-testid="start">
            🃏 {t("common.start")}
          </button>
        </SetupCard>
      )}

      {phase === "playing" && (
        <div className="card p-2 sm:p-4">
          <div className={`mx-auto grid ${cols} gap-1.5 sm:gap-2.5 ${size === 4 ? "max-w-md" : "max-w-xl"}`} data-testid="mm-grid">
            {deck.map((card, i) => {
              const isOpen = open.includes(i) || matched.has(i);
              const isMatched = matched.has(i);
              return (
                <button
                  key={card.id}
                  type="button"
                  className="flip-card aspect-square"
                  data-open={isOpen}
                  data-face={card.face}
                  data-matched={isMatched}
                  data-testid="mm-card"
                  aria-label={isOpen ? memoryFaceName(theme, card.face) : `Card ${i + 1}`}
                  onClick={() => flip(i)}
                >
                  <div className="flip-inner relative h-full w-full">
                    <div className="flip-face absolute inset-0 grid place-items-center rounded-xl bg-linear-to-br from-violet-500 to-teal-400 shadow-md sm:rounded-2xl">
                      <CardBack />
                    </div>
                    <div
                      className={`flip-face flip-back absolute inset-0 grid place-items-center rounded-xl p-1 shadow-md sm:rounded-2xl ${
                        isMatched ? "bg-teal-50 ring-2 ring-teal-400 dark:bg-teal-900/40" : "bg-white dark:bg-slate-800"
                      }`}
                    >
                      {isOpen && <MemoryFace theme={theme} face={card.face} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "done" && result && (
        <ResultCard info={result} onPlayAgain={begin}>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("common.moves")}: {moves} · {t("common.time")}: {fmtTime(elapsed)} · {size}×{size} · {t(`memory.${theme}`)}
          </p>
        </ResultCard>
      )}
    </GameShell>
  );
}
