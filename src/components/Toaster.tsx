"use client";
import { useToasts } from "@/lib/signals";

export function Toaster() {
  const toasts = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-3" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          data-testid="toast"
          className={`animate-pop-in pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl px-3 py-2 text-sm sm:px-4 sm:py-2.5 font-bold shadow-xl ${
            t.tone === "success" ? "bg-teal-500 text-white" : t.tone === "warn" ? "bg-amber-400 text-amber-950" : "bg-violet-600 text-white"
          }`}
        >
          <span className="text-lg">{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
