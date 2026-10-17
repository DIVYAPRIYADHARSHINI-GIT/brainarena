"use client";
// One call when a game ends: saves progress, then celebrates (or consoles)
// with sounds, confetti, Brainy reactions and toasts for badges / rank-ups.
import { useCallback } from "react";
import { useI18n, type LinePool } from "@/i18n";
import { saveResult } from "@/lib/store";
import { brainyReact, confetti, toast } from "@/lib/signals";
import { play } from "@/lib/sound";
import { BADGE_ICONS, type GameResult, type RecordOutcome } from "@/lib/progress";
import { RANKS } from "@/lib/ranks";

export interface FinishInfo {
  result: GameResult;
  outcome: RecordOutcome;
  pool: LinePool;
  index: number;
  /** True when an earlier best existed and was beaten. */
  beatBest: boolean;
}

export function useFinish() {
  const { t, randomLine } = useI18n();
  return useCallback(
    (result: GameResult): FinishInfo => {
      const outcome = saveResult(result);
      const beatBest = outcome.newBest && outcome.previousBest !== undefined;
      const pool: LinePool = beatBest ? "newBest" : result.won ? "win" : "lose";
      const index = randomLine(pool);

      if (beatBest) {
        play("fanfare");
        confetti({ count: 200 });
        brainyReact("dancing", { pool, index }, 6000);
      } else if (result.won) {
        play("cheer");
        confetti({ count: 110 });
        brainyReact("happy", { pool, index }, 5000);
      } else {
        play("fail");
        brainyReact("crying", { pool, index }, 5000);
      }

      outcome.badges.forEach((b, i) => setTimeout(() => toast(t("common.badgeUnlocked", { name: t(`badges.${b}.name`) }), BADGE_ICONS[b], "success", 4200), 600 + i * 700));
      if (outcome.rankUp) {
        const r = RANKS.find((x) => x.id === outcome.rankUp);
        setTimeout(() => toast(t("common.rankUp", { rank: `${t(`ranks.${outcome.rankUp}`)} ${r?.emoji ?? ""}` }), "🎖️", "success", 4500), 400);
      }
      if (outcome.dailyCompleted) setTimeout(() => toast(t("daily.completed", { n: outcome.dailyCompleted! }), "📅", "info", 4500), 200);
      return { result, outcome, pool, index, beatBest };
    },
    [t, randomLine],
  );
}
