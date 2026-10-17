"use client";
// Footer with the hidden "Do not press" easter-egg button. Each press does one
// harmless silly thing (flip the page, rain potatoes, wobble...) and then undoes it.
import { useRef } from "react";
import { useI18n } from "@/i18n";
import { awardBadge } from "@/lib/store";
import { brainyReact, confetti, toast } from "@/lib/signals";
import { play } from "@/lib/sound";

const ANTICS = ["flip", "potatoes", "wobble", "slide", "brains"] as const;

export function Footer() {
  const { t, randomLine, line } = useI18n();
  const count = useRef(0);

  const press = () => {
    const antic = ANTICS[count.current++ % ANTICS.length];
    const idx = randomLine("doNotPress");
    toast(line("doNotPress", idx), "🔴", "warn", 3600);
    brainyReact("shocked", { pool: "doNotPress", index: idx }, 3000);
    const root = document.documentElement;
    if (antic === "flip") {
      play("slide");
      root.classList.add("upside-down");
      setTimeout(() => {
        root.classList.remove("upside-down");
        play("slideDown");
      }, 2200);
    } else if (antic === "potatoes") {
      play("boing");
      confetti({ emoji: ["🥔", "🥔", "🍟"], count: 60 });
    } else if (antic === "wobble") {
      play("boing");
      root.classList.add("wobble");
      setTimeout(() => root.classList.remove("wobble"), 1900);
    } else if (antic === "slide") {
      play("slideDown");
    } else {
      play("cheer");
      confetti({ emoji: ["🧠", "⚡", "🤯"], count: 60 });
    }
    if (awardBadge("rebel")) setTimeout(() => toast(t("common.badgeUnlocked", { name: t("badges.rebel.name") }), "🔴", "success"), 400);
  };

  return (
    <footer className="mx-auto mt-10 max-w-6xl px-4 pb-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>{t("footer.made")}</p>
      <p className="mt-1 text-xs">{t("footer.sounds")}</p>
      <button
        type="button"
        onClick={press}
        data-testid="do-not-press"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-linear-to-b from-red-400 to-red-600 px-4 py-2 text-xs font-extrabold tracking-wide text-white uppercase shadow-[0_4px_0_#7f1d1d] transition active:translate-y-1 active:shadow-none"
      >
        <span className="h-3 w-3 rounded-full bg-white/80" /> {t("footer.doNotPress")}
      </button>
    </footer>
  );
}
