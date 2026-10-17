"use client";
// Funny loading state: thinking Brainy + rotating loading lines.
// Starts on line 0 (same on server and client, so no hydration mismatch) and
// rotates on a single interval that is cleared on unmount.
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { BrainySvg } from "./Brainy";

export function LoadingBrain({ compact = false }: { compact?: boolean }) {
  const { line, randomLine, t } = useI18n();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(randomLine("loading"));
    const id = window.setInterval(() => setIdx(randomLine("loading")), 1400);
    return () => window.clearInterval(id);
  }, [randomLine]);
  return (
    <div role="status" aria-label={t("common.loading")} data-testid="loading" className={`flex flex-col items-center justify-center gap-3 text-center ${compact ? "py-8" : "min-h-[50vh] py-16"}`}>
      <BrainySvg mood="thinking" className={compact ? "h-20 w-20" : "h-28 w-28"} />
      <p className="font-display animate-pulse text-lg font-bold text-violet-700 dark:text-violet-200">{line("loading", idx)}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}
