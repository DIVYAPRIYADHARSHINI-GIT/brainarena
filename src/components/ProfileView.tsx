"use client";
// Profile: nickname, rank, total points, personal bests, brain-stats radar
// chart, badges (locked/unlocked), play history and a reset button.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { GAME_IDS, GAMES } from "@/lib/games";
import { BADGE_ICONS, BADGE_IDS, brainStats } from "@/lib/progress";
import { rankFor } from "@/lib/ranks";
import { liveDailyStreak, localDateKey } from "@/lib/daily";
import { resetProgress, setNickname, useHydrated, useProgress } from "@/lib/store";
import { brainyReact, toast } from "@/lib/signals";
import { play } from "@/lib/sound";
import { BrainySvg } from "./Brainy";
import { BrainChart } from "./BrainChart";
import { GameIcon } from "./GameIcon";
import { LoadingBrain } from "./LoadingBrain";
import { Modal } from "./Modal";
import { useFormatScore } from "./game/GameShell";

export function ProfileView() {
  const { t, formatNumber, formatDate } = useI18n();
  const p = useProgress();
  const hydrated = useHydrated();
  const fmt = useFormatScore();
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (hydrated) setName(p.nickname);
  }, [hydrated, p.nickname]);

  if (!hydrated) return <LoadingBrain />;

  const r = rankFor(p.totalPoints);
  const stats = brainStats(p);
  const chartData = (["speed", "memory", "logic", "knowledge"] as const).map((k) => ({ stat: t(`profile.${k}`), value: stats[k] }));
  const hasStats = Object.values(stats).some((v) => v > 0);
  const unlocked = BADGE_IDS.filter((b) => p.badges[b]).length;
  const streak = liveDailyStreak(p.daily.lastDone, p.daily.streak, localDateKey());

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNickname(name);
    play("pop");
    toast(t("profile.saved"), "✅", "success");
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-center text-4xl font-extrabold text-violet-900 dark:text-violet-100">🧑‍🚀 {t("profile.title")}</h1>

      <section className="card flex flex-col items-center gap-4 p-5 sm:flex-row sm:p-6">
        <BrainySvg mood={p.gamesPlayed ? "happy" : "sleepy"} className="h-24 w-24 shrink-0" />
        <div className="w-full flex-1 space-y-3">
          <form onSubmit={save} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-1 flex-col gap-1 text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {t("profile.nickname")}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={16}
                data-testid="nickname-input"
                className="h-11 min-w-0 rounded-xl border-2 border-violet-200 bg-white px-3 text-base font-bold text-violet-900 normal-case outline-none focus:border-teal-400 dark:border-white/15 dark:bg-white/5 dark:text-white"
              />
            </label>
            <button type="submit" className="btn-primary" data-testid="nickname-save">
              💾 {t("profile.save")}
            </button>
          </form>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Mini label={t("profile.rank")} value={`${r.rank.emoji} ${t(`ranks.${r.rank.id}`)}`} testId="profile-rank" />
            <Mini label={t("profile.totalPoints")} value={formatNumber(p.totalPoints)} testId="profile-points" />
            <Mini label={t("profile.gamesPlayed")} value={formatNumber(p.gamesPlayed)} />
            <Mini label={t("profile.dailyStreak")} value={`🔥 ${streak}`} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-2xl font-extrabold text-violet-900 dark:text-violet-100">🧠 {t("profile.stats")}</h2>
          {hasStats ? (
            <BrainChart data={chartData} />
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center" data-testid="stats-empty">
              <BrainySvg mood="sleepy" className="h-20 w-20" />
              <p className="font-bold text-slate-600 dark:text-slate-300">{t("profile.statsEmpty")}</p>
            </div>
          )}
          <div className="mt-2 grid grid-cols-4 gap-1 text-center text-xs">
            {chartData.map((d) => (
              <div key={d.stat} className="rounded-xl bg-violet-50 py-1.5 dark:bg-white/5">
                <div className="font-display text-lg font-extrabold text-violet-700 dark:text-violet-200">{d.value}</div>
                <div className="font-bold text-slate-500 dark:text-slate-400">{d.stat}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-2xl font-extrabold text-violet-900 dark:text-violet-100">🏆 {t("profile.bests")}</h2>
          <ul className="mt-3 space-y-2">
            {GAME_IDS.map((id) => (
              <li key={id} className="flex items-center gap-3 rounded-2xl bg-violet-50/70 p-2 dark:bg-white/5">
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br text-white ${GAMES[id].gradient}`}>
                  <GameIcon game={id} className="h-7 w-7" />
                </div>
                <span className="flex-1 font-bold">{t(`games.${id}.name`)}</span>
                <span className="font-display text-lg font-extrabold text-violet-700 tabular-nums dark:text-violet-200" data-testid={`profile-best-${id}`}>
                  {fmt(id, p.bests[id])}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="font-display text-2xl font-extrabold text-violet-900 dark:text-violet-100">
          🎖️ {t("profile.badges")} <span className="text-base text-slate-500">({unlocked}/{BADGE_IDS.length})</span>
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" data-testid="badges">
          {BADGE_IDS.map((b) => {
            const at = p.badges[b];
            return (
              <div
                key={b}
                data-testid={`badge-${b}`}
                data-unlocked={at ? "1" : "0"}
                className={`flex items-center gap-2 rounded-2xl border-2 p-2.5 ${at ? "border-amber-300 bg-amber-50 dark:border-amber-400/50 dark:bg-amber-400/10" : "border-dashed border-slate-200 opacity-60 grayscale dark:border-white/10"}`}
              >
                <span className="text-3xl">{at ? BADGE_ICONS[b] : "🔒"}</span>
                <div className="min-w-0">
                  <p className="text-sm leading-tight font-extrabold">{t(`badges.${b}.name`)}</p>
                  <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">{at ? formatDate(at) : t(`badges.${b}.desc`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-2xl font-extrabold text-violet-900 dark:text-violet-100">📜 {t("profile.history")}</h2>
        {p.history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center" data-testid="history-empty">
            <BrainySvg mood="sleepy" className="h-20 w-20" />
            <p className="font-bold text-slate-600 dark:text-slate-300">{t("profile.noHistory")}</p>
            <Link href="/" className="btn-primary">
              ▶ {t("common.play")}
            </Link>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-violet-100 dark:divide-white/5" data-testid="history">
            {p.history.slice(0, 20).map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-2 text-sm">
                <GameIcon game={h.game} className="h-8 w-8 rounded-lg bg-violet-500/80 p-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{t(`games.${h.game}.name`)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(h.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`chip ${h.won ? "" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"}`}>{h.won ? `✅ ${t("profile.won")}` : `😅 ${t("profile.lost")}`}</span>
                <span className="w-24 text-end font-extrabold tabular-nums">{fmt(h.game, h.score)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="text-center">
        <button type="button" className="btn-ghost border-rose-200 text-rose-600 dark:text-rose-300" onClick={() => setConfirm(true)} data-testid="reset">
          🗑️ {t("profile.reset")}
        </button>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title={t("profile.reset")} testId="reset-modal">
        <div className="flex items-center gap-3">
          <BrainySvg mood="crying" className="h-20 w-20 shrink-0" />
          <p className="font-bold">{t("profile.resetConfirm")}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={() => setConfirm(false)}>
            {t("common.close")}
          </button>
          <button
            type="button"
            className="btn flex-1 bg-rose-500 text-white"
            data-testid="reset-confirm"
            onClick={() => {
              resetProgress();
              try {
                localStorage.removeItem("brainarena.word.daily.v1");
              } catch {
                /* ignore */
              }
              setConfirm(false);
              play("slideDown");
              brainyReact("crying", null, 2500);
            }}
          >
            🗑️ {t("profile.reset")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Mini({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="rounded-2xl bg-violet-50 p-2 text-center dark:bg-white/5">
      <div className="font-display text-base leading-tight font-extrabold text-violet-800 dark:text-violet-100" data-testid={testId}>
        {value}
      </div>
      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
