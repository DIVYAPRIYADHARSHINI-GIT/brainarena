"use client";
// Daily Challenge card: today's game (picked from the local date), the
// "come back tomorrow" streak and a live countdown to midnight.
// The date is only read on the client (after hydration) because a statically
// rendered page would otherwise show the build server's date.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { dailyGameFor, formatCountdown, liveDailyStreak, localDateKey, msUntilMidnight } from "@/lib/daily";
import { GAMES, type GameId } from "@/lib/games";
import { useHydrated, useProgress } from "@/lib/store";
import { GameIcon } from "../GameIcon";
import { Skeleton } from "../LoadingBrain";

function useToday(): string | null {
  const hydrated = useHydrated();
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    setKey(localDateKey());
    // Re-check once a minute so the card flips at midnight.
    const id = window.setInterval(() => setKey((k) => (k === localDateKey() ? k : localDateKey())), 60_000);
    return () => window.clearInterval(id);
  }, [hydrated]);
  return key;
}

export function useDailyGame(): GameId | null {
  const today = useToday();
  return today ? dailyGameFor(today) : null;
}

function Countdown() {
  const { t } = useI18n();
  const [ms, setMs] = useState(() => msUntilMidnight());
  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t("daily.nextIn", { time: formatCountdown(ms) })}</span>;
}

export function DailyCard() {
  const { t } = useI18n();
  const p = useProgress();
  const today = useToday();

  if (!today) {
    return (
      <section className="card p-5">
        <Skeleton className="h-28" />
      </section>
    );
  }

  const game = dailyGameFor(today);
  const done = p.daily.lastDone === today;
  const streak = liveDailyStreak(p.daily.lastDone, p.daily.streak, today);
  const g = GAMES[game];

  return (
    <section className="card relative overflow-hidden p-5" data-testid="daily-card" data-game={game} data-done={done ? "1" : "0"}>
      <div className={`pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-linear-to-l opacity-20 ${g.gradient}`} />
      <div className="relative flex items-start gap-4">
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white shadow ${g.gradient}`}>
          <GameIcon game={game} className="h-12 w-12" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">📅 {t("daily.title")}</p>
          <p className="font-display text-2xl font-extrabold text-violet-800 dark:text-violet-100" data-testid="daily-game">
            {t(`games.${game}.name`)}
          </p>
          <div className="mt-1 flex flex-wrap gap-2 text-sm">
            <span className="chip" data-testid="daily-streak">
              🔥 {streak} · {t("daily.streak")}
            </span>
            <span className="chip">🏅 {p.daily.best} · {t("daily.bestStreak")}</span>
          </div>
        </div>
      </div>
      <div className="relative mt-3">
        {done ? (
          <div className="rounded-2xl bg-teal-50 p-3 text-sm font-bold text-teal-800 dark:bg-teal-500/15 dark:text-teal-200">
            ✅ {t("daily.done")}
            <div className="mt-1 font-semibold opacity-80">
              ⏳ <Countdown />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t("daily.notDone")}</p>
            <Link href={g.href} className="btn-primary" data-testid="daily-play">
              ⭐ {t("daily.play")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
