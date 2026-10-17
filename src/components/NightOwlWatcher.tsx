"use client";
// Brainy gets sleepy late at night (00:00-05:00) - just a mood, no timers.
import { useEffect } from "react";
import { brainyReact } from "@/lib/signals";

export function NightOwlWatcher() {
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 0 && h < 5) brainyReact("sleepy", { key: "brainy.sleepy" }, 4000);
  }, []);
  return null;
}
