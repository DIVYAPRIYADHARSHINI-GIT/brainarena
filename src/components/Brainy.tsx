"use client";
// Brainy: Brain Arena's original cartoon brain mascot, drawn as inline SVG.
// Expressions: happy, shocked, sleepy, crying, dancing, thinking.
import { useId } from "react";
import type { Mood } from "@/lib/signals";

const INK = "#3b0a45";

function Eyes({ mood }: { mood: Mood }) {
  switch (mood) {
    case "sleepy":
      return (
        <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M39 54 Q46 59 53 54" />
          <path d="M67 54 Q74 59 81 54" />
        </g>
      );
    case "crying":
      return (
        <g>
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M39 56 Q46 51 53 56" />
            <path d="M67 56 Q74 51 81 56" />
            <path d="M38 45 L51 49" />
            <path d="M82 45 L69 49" />
          </g>
          <path className="brainy-tear" d="M42 60 q-3 5 0 7 q3 -2 0 -7z" fill="#38bdf8" />
          <path className="brainy-tear-2" d="M78 60 q-3 5 0 7 q3 -2 0 -7z" fill="#38bdf8" />
        </g>
      );
    case "dancing":
      return (
        <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M39 55 Q46 47 53 55" />
          <path d="M67 55 Q74 47 81 55" />
        </g>
      );
    case "shocked":
      return (
        <g>
          <circle cx="46" cy="52" r="9" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="74" cy="52" r="9" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="46" cy="52" r="3" fill={INK} />
          <circle cx="74" cy="52" r="3" fill={INK} />
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M37 38 Q46 33 54 38" />
            <path d="M66 38 Q74 33 83 38" />
          </g>
        </g>
      );
    case "thinking":
      return (
        <g>
          <ellipse cx="46" cy="53" rx="6.5" ry="7.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <ellipse cx="74" cy="53" rx="6.5" ry="7.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="49" cy="50" r="3.2" fill={INK} />
          <circle cx="77" cy="50" r="3.2" fill={INK} />
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M39 42 L53 44" />
            <path d="M67 41 Q74 36 82 40" />
          </g>
        </g>
      );
    default:
      return (
        <g className="brainy-blink">
          <ellipse cx="46" cy="53" rx="6.5" ry="7.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <ellipse cx="74" cy="53" rx="6.5" ry="7.5" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="47" cy="54" r="3.6" fill={INK} />
          <circle cx="75" cy="54" r="3.6" fill={INK} />
          <circle cx="48.3" cy="52.4" r="1.2" fill="#fff" />
          <circle cx="76.3" cy="52.4" r="1.2" fill="#fff" />
        </g>
      );
  }
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case "shocked":
      return <ellipse cx="60" cy="70" rx="5.5" ry="7" fill={INK} />;
    case "sleepy":
      return <ellipse cx="60" cy="68" rx="3.5" ry="2.5" fill={INK} />;
    case "crying":
      return <path d="M50 72 Q60 63 70 72" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />;
    case "thinking":
      return <path d="M52 68 q4 -3 8 0 t8 0" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />;
    case "dancing":
      return (
        <g>
          <path d="M48 63 Q60 80 72 63 Z" fill={INK} />
          <path d="M54 70 Q60 75 66 70 Q60 67 54 70Z" fill="#fb7185" />
        </g>
      );
    default:
      return (
        <g>
          <path d="M50 64 Q60 76 70 64 Z" fill={INK} />
          <path d="M55 69 Q60 73 65 69 Q60 66.5 55 69Z" fill="#fb7185" />
        </g>
      );
  }
}

function Extras({ mood }: { mood: Mood }) {
  if (mood === "sleepy")
    return (
      <g fill="#7c3aed" fontWeight="800" fontFamily="sans-serif">
        <text className="brainy-z" x="92" y="30" fontSize="12">
          z
        </text>
        <text className="brainy-z-2" x="100" y="20" fontSize="15">
          Z
        </text>
      </g>
    );
  if (mood === "dancing")
    return (
      <g fill="#14b8a6" fontSize="16" fontFamily="sans-serif">
        <text className="brainy-note" x="4" y="28">
          ♪
        </text>
        <text className="brainy-note-2" x="100" y="24">
          ♫
        </text>
      </g>
    );
  if (mood === "thinking")
    return (
      <text x="98" y="26" fontSize="18" fontWeight="900" fill="#14b8a6" fontFamily="sans-serif" className="brainy-note">
        ?
      </text>
    );
  if (mood === "shocked")
    return (
      <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
        <path d="M14 22 l6 6" />
        <path d="M106 22 l-6 6" />
        <path d="M60 2 v7" />
      </g>
    );
  return null;
}

export function BrainySvg({ mood = "happy", className = "", title = "Brainy" }: { mood?: Mood; className?: string; title?: string }) {
  const gid = useId().replace(/:/g, "");
  const blush = mood === "happy" || mood === "dancing" || mood === "thinking";
  const anim = mood === "dancing" ? "brainy-dance brainy-dancing" : mood === "shocked" ? "brainy-shake" : mood === "crying" ? "brainy-cry" : mood === "sleepy" ? "brainy-sleep" : "brainy-float";
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={title} data-mood={mood}>
      <title>{title}</title>
      <defs>
        <radialGradient id={`bg-${gid}`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#ffd1e8" />
          <stop offset="0.6" stopColor="#ff9ccc" />
          <stop offset="1" stopColor="#f472b6" />
        </radialGradient>
      </defs>
      <g className={anim}>
        {/* legs + sneakers */}
        <g stroke={INK} strokeWidth="3" strokeLinecap="round">
          <path d="M50 84 L48 96" />
          <path d="M70 84 L72 96" />
        </g>
        <ellipse cx="45" cy="99" rx="8" ry="4.5" fill="#14b8a6" stroke={INK} strokeWidth="2" />
        <ellipse cx="75" cy="99" rx="8" ry="4.5" fill="#14b8a6" stroke={INK} strokeWidth="2" />
        {/* arms */}
        <g className="brainy-arm-l">
          <path d="M30 72 Q18 76 14 86" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="13" cy="88" r="4.5" fill="#fff" stroke={INK} strokeWidth="2" />
        </g>
        <g className="brainy-arm-r">
          <path d="M90 72 Q102 76 106 86" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="107" cy="88" r="4.5" fill="#fff" stroke={INK} strokeWidth="2" />
        </g>
        {/* brain body */}
        <path
          d="M26 64 C14 61 12 45 22 39 C19 27 33 18 44 22 C48 12 66 10 72 18 C82 11 99 19 97 32 C109 36 109 55 98 61 C102 73 90 84 78 79 C72 87 54 87 48 81 C36 87 22 77 26 64 Z"
          fill={`url(#bg-${gid})`}
          stroke="#be185d"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* brain folds */}
        <g stroke="#db2777" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M60 17 C55 24 64 30 58 38" />
          <path d="M33 30 C40 30 40 37 46 36" />
          <path d="M86 28 C80 30 81 36 74 36" />
          <path d="M22 50 C28 48 30 54 34 52" />
          <path d="M98 48 C92 47 91 53 87 52" />
          <path d="M44 24 C46 28 50 28 52 26" />
          <path d="M70 24 C72 28 76 27 78 24" />
        </g>
        {blush && (
          <g fill="#fb7185" opacity="0.55">
            <ellipse cx="34" cy="64" rx="5" ry="3" />
            <ellipse cx="86" cy="64" rx="5" ry="3" />
          </g>
        )}
        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </g>
      <Extras mood={mood} />
    </svg>
  );
}
