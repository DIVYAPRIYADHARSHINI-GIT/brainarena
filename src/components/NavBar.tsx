"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n";
import { LANGUAGES, isLang } from "@/i18n/languages";
import { setMuted, usePrefs } from "@/lib/store";
import { play } from "@/lib/sound";
import { useTheme } from "./ThemeProvider";
import { LiveBrainy } from "./LiveBrainy";

function IconBtn({ label, onClick, children, testId }: { label: string; onClick: () => void; children: React.ReactNode; testId: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} data-testid={testId} className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg text-white transition hover:bg-white/25 active:scale-90">
      {children}
    </button>
  );
}

export function NavBar() {
  const { t, lang, setLang } = useI18n();
  const { dark, toggle } = useTheme();
  const { muted } = usePrefs();
  const path = usePathname();

  const links = [
    { href: "/", label: t("nav.home"), icon: "🏠" },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: "🏆" },
    { href: "/profile", label: t("nav.profile"), icon: "🧑‍🚀" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-linear-to-r from-violet-700 via-purple-600 to-teal-500 text-white shadow-lg shadow-violet-900/20">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <LiveBrainy size="sm" bubble={false} />
        <Link href="/" className="min-w-0 flex-1 leading-tight" data-testid="brand">
          <span className="font-display block text-xl font-extrabold tracking-tight sm:text-2xl">{t("brand.name")}</span>
          <span className="line-clamp-2 text-[10.5px] leading-tight font-semibold text-white/85 sm:line-clamp-1 sm:text-xs" data-testid="tagline">
            {t("brand.tagline")}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`rounded-xl px-3 py-2 text-sm font-bold transition hover:bg-white/20 ${path === l.href ? "bg-white/25" : ""}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <label className="sr-only" htmlFor="lang-select">
          {t("nav.language")}
        </label>
        <select
          id="lang-select"
          data-testid="lang-select"
          value={lang}
          onChange={(e) => {
            if (isLang(e.target.value)) {
              setLang(e.target.value);
              play("pop");
            }
          }}
          className="h-10 max-w-[5.6rem] shrink-0 rounded-xl border-0 bg-white/15 px-2 text-sm font-bold text-white outline-none [&>option]:text-slate-900"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native}
            </option>
          ))}
        </select>
        <IconBtn
          testId="mute-toggle"
          label={muted ? t("nav.unmute") : t("nav.mute")}
          onClick={() => {
            setMuted(!muted);
            if (muted) setTimeout(() => play("ding"), 0);
          }}
        >
          {muted ? "🔇" : "🔊"}
        </IconBtn>
        <IconBtn testId="theme-toggle" label={dark ? t("nav.light") : t("nav.dark")} onClick={toggle}>
          {dark ? "☀️" : "🌙"}
        </IconBtn>
      </div>
      {/* Mobile bottom-style tab row */}
      <nav className="flex justify-around border-t border-white/15 md:hidden" aria-label="Mobile">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`flex flex-1 flex-col items-center py-1 text-[11px] font-bold ${path === l.href ? "bg-white/20" : ""}`}>
            <span className="text-base leading-none">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
