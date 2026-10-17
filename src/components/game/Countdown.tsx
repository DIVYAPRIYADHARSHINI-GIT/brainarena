"use client";
// 3-2-1 countdown with a funny loading line before a timed game starts.
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { play } from "@/lib/sound";

export function Countdown({ onDone, step = 550 }: { onDone: () => void; step?: number }) {
  const { line, randomLine } = useI18n();
  const [n, setN] = useState(3);
  const [idx] = useState(() => randomLine("loading"));
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    play("tick");
    const timers = [1, 2, 3].map((i) =>
      window.setTimeout(() => {
        if (i < 3) {
          setN(3 - i);
          play("tick");
        } else {
          play("ding");
          doneRef.current();
        }
      }, i * step),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [step]);

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-10" data-testid="countdown">
      <div key={n} className="animate-pop-in font-display grid h-28 w-28 place-items-center rounded-full bg-linear-to-br from-violet-600 to-teal-500 text-6xl font-extrabold text-white shadow-xl">
        {n}
      </div>
      <p className="font-display text-lg font-bold text-violet-700 dark:text-violet-200">{line("loading", idx)}</p>
    </div>
  );
}
