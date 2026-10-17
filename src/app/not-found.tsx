"use client";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { BrainySvg } from "@/components/Brainy";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="card mx-auto flex max-w-xl flex-col items-center gap-3 p-8 text-center" data-testid="not-found">
      <div className="relative">
        <BrainySvg mood="shocked" className="h-36 w-36" />
        <span className="absolute -top-2 -right-6 rotate-12 text-4xl">❓</span>
        <span className="absolute top-8 -left-8 -rotate-12 text-3xl">🔍</span>
      </div>
      <p className="font-display bg-linear-to-r from-violet-600 to-teal-500 bg-clip-text text-7xl font-extrabold text-transparent">404</p>
      <h1 className="font-display text-2xl font-extrabold text-violet-900 dark:text-violet-100">{t("notFound.line")}</h1>
      <p className="text-slate-600 dark:text-slate-300">{t("notFound.sub")}</p>
      <Link href="/" className="btn-primary mt-2" data-testid="not-found-home">
        🏠 {t("notFound.back")}
      </Link>
    </div>
  );
}
