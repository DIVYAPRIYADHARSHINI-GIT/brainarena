"use client";
// Shared frame for every mini game: title, best score, How-to-play popup,
// Pause/Resume + Restart controls, the paused overlay and the result card.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { GAMES, type GameId } from "@/lib/games";
import { getPrefs, setSetup, useHydrated, useProgress } from "@/lib/store";
import { brainyBase, brainySay } from "@/lib/signals";
import { play } from "@/lib/sound";
import { GameIcon } from "../GameIcon";
import { LiveBrainy } from "../LiveBrainy";
import { Modal } from "../Modal";
import { BrainySvg } from "../Brainy";
import type { FinishInfo } from "./useFinish";

export function useFormatScore() {
  const { t, formatNumber } = useI18n();
  return (game: GameId, score: number | undefined) =>
    score === undefined ? "—" : GAMES[game].unit === "ms" ? `${formatNumber(score)} ${t("common.ms")}` : `${formatNumber(score)} ${t("common.pts")}`;
}

export interface GameShellProps {
  game: GameId;
  /** Pause button shown only when the game can be paused right now. */
  canPause?: boolean;
  paused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onRestart: () => void;
  /** Small stat chips shown under the title (score, timer...). */
  stats?: React.ReactNode;
  children: React.ReactNode;
}

export function GameShell({ game, canPause = false, paused = false, onPause, onResume, onRestart, stats, children }: GameShellProps) {
  const { t, dict } = useI18n();
  const progress = useProgress();
  const hydrated = useHydrated();
  const fmt = useFormatScore();
  const [howOpen, setHowOpen] = useState(false);
  const meta = GAMES[game];
  const how = dict.games[game].how;

  // First visit to a game: open "How to play" automatically (once).
  useEffect(() => {
    const key = `seen-how-${game}`;
    if (!getPrefs().setup[key]) {
      setHowOpen(true);
      setSetup(key, "1");
    }
  }, [game]);

  // Brainy "thinks" while you're in a game, and is happy again when you leave.
  useEffect(() => {
    brainyBase("thinking");
    brainySay(null);
    return () => brainyBase("happy");
  }, []);

  const openHow = () => {
    if (canPause && !paused) onPause?.();
    setHowOpen(true);
    play("pop");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className={`card relative overflow-hidden bg-linear-to-r p-3 text-white sm:p-5 ${meta.gradient}`}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20 sm:h-16 sm:w-16">
            <GameIcon game={game} className="h-9 w-9 sm:h-12 sm:w-12" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl leading-tight font-extrabold sm:text-3xl" data-testid="game-title">
              {t(`games.${game}.name`)}
            </h1>
            <p className="text-sm font-semibold text-white/90">
              {t("common.best")}: <span data-testid="game-best">{hydrated ? fmt(game, progress.bests[game]) : "…"}</span>
            </p>
          </div>
          <LiveBrainy size="md" bubble={false} className="hidden h-20 w-20 sm:flex [&>button]:h-20 [&>button]:w-20" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
          <button type="button" className="btn min-h-9 bg-white/20 px-3 py-1 text-sm text-white hover:bg-white/30" onClick={openHow} data-testid="how-to-play">
            ❓ {t("common.howToPlay")}
          </button>
          {canPause && (
            <button
              type="button"
              className="btn min-h-9 bg-white/20 px-3 py-1 text-sm text-white hover:bg-white/30"
              onClick={() => {
                play("click");
                if (paused) onResume?.();
                else onPause?.();
              }}
              data-testid="pause"
            >
              {paused ? `▶️ ${t("common.resume")}` : `⏸️ ${t("common.pause")}`}
            </button>
          )}
          <button
            type="button"
            className="btn min-h-9 bg-white/20 px-3 py-1 text-sm text-white hover:bg-white/30"
            onClick={() => {
              play("slideDown");
              onRestart();
            }}
            data-testid="restart"
          >
            🔄 {t("common.restart")}
          </button>
        </div>
      </div>

      {stats && <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:mt-3 sm:gap-2">{stats}</div>}

      <div className="relative mt-2 sm:mt-3">
        {children}
        {paused && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/90 p-6 text-center backdrop-blur-md dark:bg-[#140c26]/95" data-testid="paused-overlay">
            <BrainySvg mood="sleepy" className="h-24 w-24" />
            <p className="font-display text-3xl font-extrabold text-violet-700 dark:text-violet-200">{t("common.paused")}</p>
            <p className="max-w-xs text-sm text-slate-600 dark:text-slate-300">{t("common.pausedSub")}</p>
            <button type="button" className="btn-primary" onClick={onResume} data-testid="resume">
              ▶️ {t("common.resume")}
            </button>
          </div>
        )}
      </div>

      <Modal open={howOpen} onClose={() => setHowOpen(false)} title={t("common.howToPlay")} testId="how-modal">
        <div className="flex items-start gap-3">
          <BrainySvg mood="happy" className="h-16 w-16 shrink-0" />
          <ol className="list-decimal space-y-2 ps-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {how.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
        <button type="button" className="btn-primary mt-5 w-full" onClick={() => setHowOpen(false)} data-testid="how-close">
          {t("common.gotIt")}
        </button>
      </Modal>
    </div>
  );
}

export function StatChip({ label, value, testId, highlight = false }: { label: string; value: React.ReactNode; testId?: string; highlight?: boolean }) {
  return (
    <div className={`card flex min-w-[4.75rem] flex-col items-center px-2.5 py-1 sm:min-w-[5.5rem] sm:px-3 sm:py-1.5 ${highlight ? "ring-2 ring-amber-400" : ""}`}>
      <span className="text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">{label}</span>
      <span className="font-display text-lg font-extrabold text-violet-800 tabular-nums sm:text-xl dark:text-violet-100" data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

export function SetupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card animate-slide-up flex flex-col items-center gap-4 p-5 text-center sm:p-8">
      <LiveBrainy size="md" />
      <p className="font-display text-lg font-bold text-violet-800 dark:text-violet-100">{title}</p>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label, testId }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; testId?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">{label}</span>
      <div className="seg" role="group" aria-label={label} data-testid={testId}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            data-value={o.value}
            onClick={() => {
              play("click");
              onChange(o.value);
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Result card shown at the end of every game. */
export function ResultCard({ info, onPlayAgain, children, extra }: { info: FinishInfo; onPlayAgain: () => void; children?: React.ReactNode; extra?: React.ReactNode }) {
  const { t, line, formatNumber } = useI18n();
  const fmt = useFormatScore();
  const { result, outcome, pool, index, beatBest } = info;
  const mood = beatBest ? "dancing" : result.won ? "happy" : "crying";
  return (
    <div className="card animate-pop-in flex flex-col items-center gap-3 p-5 text-center sm:p-8" data-testid="result" data-won={result.won ? "1" : "0"}>
      <BrainySvg mood={mood} className="h-28 w-28" />
      <h2 className="font-display text-3xl font-extrabold text-violet-800 dark:text-violet-100">{beatBest ? `🏆 ${t("common.newBest")}` : result.won ? t("common.youWon") : t("common.youLost")}</h2>
      <p className="max-w-md text-lg font-bold text-teal-700 dark:text-teal-300" data-testid="result-line">
        {line(pool, index)}
      </p>
      <div className="font-display text-5xl font-extrabold text-violet-700 tabular-nums dark:text-violet-200" data-testid="result-score">
        {fmt(result.game, result.score)}
      </div>
      <p className="chip" data-testid="result-points">
        {t("common.pointsEarned", { n: formatNumber(outcome.pointsAdded) })}
      </p>
      {children}
      {outcome.leaderboardPos !== null && <p className="text-sm text-slate-600 dark:text-slate-300">🏅 #{outcome.leaderboardPos + 1} · {t("leaderboard.title")}</p>}
      {extra}
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button type="button" className="btn-primary" onClick={onPlayAgain} data-testid="play-again">
          🔁 {t("common.playAgain")}
        </button>
        <Link href={`/leaderboard?game=${result.game}`} className="btn-ghost">
          🏆 {t("common.viewLeaderboard")}
        </Link>
        <Link href="/" className="btn-ghost">
          🏠 {t("common.backHome")}
        </Link>
      </div>
    </div>
  );
}
