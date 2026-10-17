"use client";
// Canvas confetti. Runs one requestAnimationFrame loop per burst and STOPS when
// every particle has fallen off-screen (or after 4 s), so it can never spin
// forever. The canvas is sized from window.innerWidth/innerHeight once per
// burst - no ResizeObserver, no state updates per frame.
import { useEffect, useRef } from "react";
import { useConfetti } from "@/lib/signals";

const COLORS = ["#8b5cf6", "#14b8a6", "#f472b6", "#facc15", "#38bdf8", "#fb923c", "#22c55e"];

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  color: string;
  emoji?: string;
  shape: number;
}

export function Confetti() {
  const burst = useConfetti();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!burst) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = burst.emoji ? Math.min(burst.count, 90) : Math.min(burst.count, 220);
    const ps: P[] = Array.from({ length: n }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? w * 0.15 : w * 0.85,
        y: h * 0.75,
        vx: (fromLeft ? 1 : -1) * (2 + Math.random() * 7),
        vy: -(9 + Math.random() * 9),
        r: burst.emoji ? 14 + Math.random() * 10 : 4 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length],
        emoji: burst.emoji?.[i % burst.emoji.length],
        shape: i % 3,
      };
    });

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of ps) {
        p.vy += 0.32;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < h + 40) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.emoji) {
          ctx.font = `${p.r * 2}px serif`;
          ctx.textAlign = "center";
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          if (p.shape === 0) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
          else if (p.shape === 1) {
            ctx.beginPath();
            ctx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, -p.r);
            ctx.lineTo(p.r, p.r);
            ctx.lineTo(-p.r, p.r);
            ctx.fill();
          }
        }
        ctx.restore();
      }
      if (alive > 0 && now - start < 4000) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
    };
  }, [burst]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" data-testid="confetti" data-burst={burst?.id ?? 0} />;
}
