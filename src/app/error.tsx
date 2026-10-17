"use client";
import { useI18n } from "@/i18n";
import { BrainySvg } from "@/components/Brainy";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="card mx-auto flex max-w-xl flex-col items-center gap-3 p-8 text-center">
      <BrainySvg mood="crying" className="h-32 w-32" />
      <h1 className="font-display text-2xl font-extrabold text-violet-900 dark:text-violet-100">{t("error.title")}</h1>
      <p className="text-slate-600 dark:text-slate-300">{t("error.sub")}</p>
      <button type="button" className="btn-primary" onClick={reset}>
        🔄 {t("error.retry")}
      </button>
    </div>
  );
}
