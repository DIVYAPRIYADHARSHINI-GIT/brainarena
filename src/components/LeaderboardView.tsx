"use client";
// Local leaderboard: top 10 scores per game on this device, with nickname.
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { GAME_IDS, GAMES, isGameId, type GameId } from "@/lib/games";
import { useHydrated, useProgress } from "@/lib/store";
import { BrainySvg } from "./Brainy";
import { GameIcon } from "./GameIcon";
import { LoadingBrain } from "./LoadingBrain";
import { useFormatScore } from "./game/GameShell";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardView() {
  const { t, formatDate } = useI18n();
  const params = useSearchParams();
  const p = useProgress();
  const hydrated = useHydrated();
  const fmt = useFormatScore();
  const [game, setGame] = useState<GameId>("quick-math");

  useEffect(() => {
    const q = params.get("game");
    if (isGameId(q)) setGame(q);
  }, [params]);

  const rows = p.leaderboard[game] ?? [];
  const latest = p.history.find((h) => h.game === game)?.id;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold text-violet-900 dark:text-violet-100">🏆 {t("leaderboard.title")}</h1>
        <p className="text-slate-600 dark:text-slate-300">{t("leaderboard.subtitle")}</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t("leaderboard.title")}>
        {GAME_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === game}
            data-testid={`lb-tab-${id}`}
            onClick={() => setGame(id)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold transition ${
              id === game ? `bg-linear-to-r text-white shadow-lg ${GAMES[id].gradient}` : "bg-white/70 text-violet-800 hover:bg-white dark:bg-white/5 dark:text-violet-200"
            }`}
          >
            <GameIcon game={id} className="h-6 w-6" />
            {t(`games.${id}.name`)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden" data-testid="lb-table">
        {!hydrated ? (
          <LoadingBrain compact />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center" data-testid="lb-empty">
            <BrainySvg mood="sleepy" className="h-24 w-24" />
            <p className="font-bold text-slate-600 dark:text-slate-300">{t("leaderboard.empty")}</p>
            <Link href={GAMES[game].href} className="btn-primary">
              ▶ {t("common.play")} {t(`games.${game}.name`)}
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-xs tracking-wide text-slate-500 uppercase dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 text-start">#</th>
                <th className="px-3 py-2 text-start">{t("leaderboard.player")}</th>
                <th className="px-3 py-2 text-end">{t("leaderboard.score")}</th>
                <th className="hidden px-3 py-2 text-end sm:table-cell">{t("leaderboard.date")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} data-testid="lb-row" className={`border-t border-violet-100 dark:border-white/5 ${r.id === latest ? "bg-teal-50 dark:bg-teal-500/10" : ""}`}>
                  <td className="px-3 py-2.5 text-lg font-extrabold">{MEDALS[i] ?? i + 1}</td>
                  <td className="px-3 py-2.5 font-bold text-violet-900 dark:text-violet-100">
                    {r.name}
                    {r.id === latest && <span className="chip ms-2 px-2 py-0 text-[10px]">{t("leaderboard.you")}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-end font-display text-lg font-extrabold text-violet-700 tabular-nums dark:text-violet-200">{fmt(game, r.score)}</td>
                  <td className="hidden px-3 py-2.5 text-end text-slate-500 sm:table-cell dark:text-slate-400">{formatDate(r.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
