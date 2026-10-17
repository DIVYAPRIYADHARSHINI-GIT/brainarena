"use client";
// Brain-stats radar chart (Recharts).
// Render-loop safety: the chart is drawn at a FIXED pixel size measured once
// from the container on mount and on window resize (debounced) - no
// ResizeObserver feeding state back into layout, so it can't loop.
import { useEffect, useRef, useState } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from "recharts";
import { useTheme } from "./ThemeProvider";

export interface StatDatum {
  stat: string;
  value: number;
}

export function BrainChart({ data, height = 300 }: { data: StatDatum[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const { dark } = useTheme();

  useEffect(() => {
    const measure = () => {
      const w = Math.floor(ref.current?.clientWidth ?? 0);
      setWidth((prev) => (Math.abs(prev - w) > 4 ? w : prev));
    };
    measure();
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
    };
  }, []);

  const axis = dark ? "#c4b5fd" : "#5b21b6";
  const grid = dark ? "rgba(255,255,255,0.18)" : "rgba(91,33,182,0.18)";

  return (
    <div ref={ref} style={{ height }} className="w-full" data-testid="brain-chart" dir="ltr">
      {width > 0 && (
        <RadarChart width={width} height={height} data={data} outerRadius={Math.min(width, height) * 0.36}>
          <PolarGrid stroke={grid} />
          <PolarAngleAxis dataKey="stat" tick={{ fill: axis, fontSize: 13, fontWeight: 700 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            formatter={(v) => [`${v}/100`, ""]}
            contentStyle={{ borderRadius: 12, border: "none", background: dark ? "#24163f" : "#fff", color: dark ? "#f5f3ff" : "#2e1065", fontWeight: 700 }}
          />
          <Radar dataKey="value" stroke="#14b8a6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.45} isAnimationActive={false} dot={{ r: 4, fill: "#14b8a6" }} />
        </RadarChart>
      )}
    </div>
  );
}
