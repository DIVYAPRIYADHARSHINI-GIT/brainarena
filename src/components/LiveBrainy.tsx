"use client";
// Brainy wired to the global mood signal + speech bubble.
// Easter egg: poke Brainy 10 times (pause < 3 s between pokes) and it dances.
import { useI18n } from "@/i18n";
import { awardBadge } from "@/lib/store";
import { brainyReact, useBrainy, confetti, toast, type BrainyMsg } from "@/lib/signals";
import { play } from "@/lib/sound";
import { BrainySvg } from "./Brainy";

let pokes = 0;
let lastPoke = 0;

function poke(badgeLabel: (name: string) => string) {
  const now = Date.now();
  pokes = now - lastPoke > 3000 ? 1 : pokes + 1;
  lastPoke = now;
  if (pokes >= 10) {
    pokes = 0;
    play("cheer");
    brainyReact("dancing", { key: "brainy.dance" }, 7000);
    confetti({ emoji: ["🧠", "💃", "🎶", "✨"], count: 70 });
    if (awardBadge("dancer")) toast(badgeLabel("dancer"), "💃", "success");
    return;
  }
  play("boing");
  brainyReact(pokes > 6 ? "shocked" : "happy", { key: "brainy.ouch" }, 1400);
}

export function useBrainyText() {
  const { t, line } = useI18n();
  return (msg: BrainyMsg) => (!msg ? null : "pool" in msg ? line(msg.pool, msg.index) : t(msg.key, msg.vars));
}

export function LiveBrainy({ size = "md", bubble = true, className = "" }: { size?: "sm" | "md" | "lg"; bubble?: boolean; className?: string }) {
  const { mood, msg, seq } = useBrainy();
  const { t } = useI18n();
  const text = useBrainyText()(msg);
  const px = size === "sm" ? "h-11 w-11" : size === "md" ? "h-24 w-24" : "h-36 w-36 sm:h-44 sm:w-44";
  const badgeLabel = (id: string) => t("common.badgeUnlocked", { name: t(`badges.${id}.name`) });

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {bubble && text && (
        <div
          key={seq}
          role="status"
          aria-live="polite"
          data-testid="brainy-bubble"
          className="animate-pop-in relative mb-2 max-w-[18rem] rounded-2xl border-2 border-violet-200 bg-white px-3 py-2 text-center text-sm font-bold text-violet-900 shadow-lg dark:border-violet-400/40 dark:bg-[#24163f] dark:text-violet-100"
        >
          {text}
          <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-violet-200 bg-white dark:border-violet-400/40 dark:bg-[#24163f]" />
        </div>
      )}
      <button
        type="button"
        onClick={() => poke(badgeLabel)}
        className={`${px} shrink-0 rounded-full transition-transform hover:scale-105 active:scale-95`}
        aria-label={t("brainy.hello")}
        data-testid={size === "sm" ? "brainy-nav" : "brainy"}
        data-mood={mood}
      >
        <BrainySvg mood={mood} className="h-full w-full drop-shadow-md" title="Brainy" />
      </button>
    </div>
  );
}
