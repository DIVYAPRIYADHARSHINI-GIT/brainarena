"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/i18n";
import { GAME_IDS, GAMES } from "@/lib/games";
import { BADGE_IDS } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { useHydrated, useProgress } from "@/lib/store";
import { brainySay } from "@/lib/signals";
import { GameIcon } from "../GameIcon";
import { LiveBrainy } from "../LiveBrainy";
import { Skeleton } from "../LoadingBrain";
import { useFormatScore } from "../game/GameShell";
import { DailyCard, useDailyGame } from "./DailyCard";

export function HomeView() {
  const { t, formatNumber } = useI18n();
  const p = useProgress();
  const hydrated = useHydrated();
  const fmt = useFormatScore();
  const daily = useDailyGame();
  const r = rankFor(p.totalPoints);
  const badgeCount = BADGE_IDS.filter((b) => p.badges[b]).length;

  useEffect(() => {
    brainySay({ key: "brainy.hello" });
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="card relative overflow-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-500/20" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-600/25" />
        <div className="relative flex flex-col items-center gap-5 text-center md:flex-row md:text-start">
          <LiveBrainy size="lg" />
          <div className="flex-1">
            <h1 className="font-display bg-linear-to-r from-violet-700 to-teal-500 bg-clip-text text-4xl leading-tight font-extrabold text-transparent sm:text-5xl dark:from-violet-300 dark:to-teal-300" data-testid="hero-title">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-2 text-lg font-semibold text-slate-600 dark:text-slate-300">{t("home.heroSub")}</p>
            <p className="mt-1 text-sm text-violet-600 dark:text-violet-300">👆 {t("home.pokeBrainy")}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
              <Stat label={t("home.totalPoints")} value={hydrated ? formatNumber(p.totalPoints) : null} testId="home-points" />
              <Stat label={t("home.gamesPlayed")} value={hydrated ? formatNumber(p.gamesPlayed) : null} />
              <Stat label={t("home.badges")} value={hydrated ? `${badgeCount}/${BADGE_IDS.length}` : null} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Rank */}
        <section className="card p-5" data-testid="rank-card">
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">{t("home.yourRank")}</p>
          {hydrated ? (
            <>
              <p className="font-display mt-1 text-3xl font-extrabold text-violet-800 dark:text-violet-100" data-testid="rank-title">
                {r.rank.emoji} {t(`ranks.${r.rank.id}`)}
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-violet-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-linear-to-r from-violet-500 to-teal-400 transition-all" style={{ width: `${Math.round(r.progress * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {r.next ? t("home.toNext", { n: formatNumber(r.toNext), rank: `${t(`ranks.${r.next.id}`)} ${r.next.emoji}` }) : t("home.maxRank")}
              </p>
            </>
          ) : (
            <Skeleton className="mt-2 h-20" />
          )}
        </section>
        <DailyCard />
      </div>

      {/* Games */}
      <section>
        <h2 className="font-display mb-3 text-2xl font-extrabold text-violet-900 dark:text-violet-100">{t("home.gamesTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAME_IDS.map((id, i) => {
            const g = GAMES[id];
            const best = p.bests[id];
            return (
              <Link
                key={id}
                href={g.href}
                data-testid={`game-card-${id}`}
                className="card group animate-slide-up relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`flex items-center gap-3 bg-linear-to-r p-4 text-white ${g.gradient}`}>
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 transition group-hover:rotate-6 group-hover:scale-110">
                    <GameIcon game={id} className="h-12 w-12" />
                  </div>
                  <h3 className="font-display flex-1 text-2xl leading-tight font-extrabold">{t(`games.${id}.name`)}</h3>
                  {hydrated && daily === id && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-violet-700 shadow">⭐ {t("daily.badge")}</span>}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="flex-1 text-sm text-slate-600 dark:text-slate-300">{t(`games.${id}.short`)}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">
                      <span className="font-bold text-slate-500 dark:text-slate-400">🏆 {t("home.best")}: </span>
                      {hydrated ? (
                        <span className="font-extrabold text-violet-700 dark:text-violet-200" data-testid={`best-${id}`}>
                          {best === undefined ? t("home.noBest") : fmt(id, best)}
                        </span>
                      ) : (
                        <span className="skeleton inline-block h-4 w-16 align-middle" />
                      )}
                    </span>
                    <span className="btn-primary min-h-10 px-4 py-1.5 text-sm">▶ {t("home.play")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, testId }: { label: string; value: string | null; testId?: string }) {
  return (
    <div className="rounded-2xl bg-violet-50 p-2 text-center dark:bg-white/5">
      <div className="font-display text-xl font-extrabold text-violet-800 tabular-nums dark:text-violet-100" data-testid={testId}>
        {value ?? <span className="skeleton mx-auto block h-6 w-10" />}
      </div>
      <div className="text-[11px] leading-tight font-bold text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
