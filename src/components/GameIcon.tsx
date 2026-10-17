// Custom SVG icons for each mini game (no icon fonts, no copyrighted art).
import type { GameId } from "@/lib/games";

export function GameIcon({ game, className = "h-14 w-14" }: { game: GameId; className?: string }) {
  const common = { viewBox: "0 0 64 64", className, "aria-hidden": true } as const;
  switch (game) {
    case "quick-math":
      return (
        <svg {...common}>
          <rect x="10" y="6" width="44" height="52" rx="10" fill="#fff" opacity="0.95" />
          <rect x="16" y="12" width="32" height="12" rx="4" fill="#fde68a" />
          <text x="44" y="22" textAnchor="end" fontSize="9" fontWeight="900" fill="#9a3412" fontFamily="sans-serif">
            42
          </text>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={16 + c * 11.5} y={29 + r * 9.5} width="8" height="7" rx="2" fill={c === 2 ? "#f97316" : "#fdba74"} />),
          )}
          <path d="M51 4 l3 6 6 1 -5 4 1 6 -5 -3 -5 3 1 -6 -5 -4 6 -1z" fill="#facc15" stroke="#fff" strokeWidth="1" />
        </svg>
      );
    case "memory-match":
      return (
        <svg {...common}>
          <rect x="6" y="14" width="26" height="36" rx="6" fill="#fff" transform="rotate(-10 19 32)" />
          <rect x="32" y="12" width="26" height="36" rx="6" fill="#f5d0fe" transform="rotate(8 45 30)" />
          <circle cx="19" cy="32" r="7" fill="#a855f7" />
          <path d="M45 22 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1z" fill="#7c3aed" transform="rotate(8 45 30)" />
          <text x="40" y="58" fontSize="10" fontWeight="900" fill="#fff" fontFamily="sans-serif">
            ?
          </text>
        </svg>
      );
    case "word-hunt":
      return (
        <svg {...common}>
          {["B", "R", "A", "I", "N"].map((ch, i) => (
            <g key={i}>
              <rect x={3 + i * 12} y={i % 2 ? 26 : 20} width="10.5" height="12" rx="2.5" fill={i === 0 || i === 3 ? "#22c55e" : i === 2 ? "#facc15" : "#fff"} />
              <text x={8.25 + i * 12} y={i % 2 ? 35.5 : 29.5} textAnchor="middle" fontSize="8.5" fontWeight="900" fill={i === 1 || i === 4 ? "#0f766e" : "#fff"} fontFamily="sans-serif">
                {ch}
              </text>
            </g>
          ))}
          <circle cx="44" cy="48" r="7" fill="none" stroke="#fff" strokeWidth="3.5" />
          <path d="M49 53 l7 7" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "reaction-time":
      return (
        <svg {...common}>
          <circle cx="32" cy="36" r="22" fill="#fff" />
          <rect x="27" y="6" width="10" height="7" rx="2" fill="#fff" />
          <circle cx="32" cy="36" r="17" fill="#fecaca" />
          <path d="M32 36 L32 23" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 36 L41 40" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 10 l-8 14 h7 l-5 12 13 -17 h-7 l6 -9z" fill="#facc15" stroke="#fff" strokeWidth="1" />
        </svg>
      );
    case "quiz-blitz":
      return (
        <svg {...common}>
          <path d="M8 12 h40 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-22 l-10 9 v-9 h-8 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8z" fill="#fff" />
          <text x="30" y="40" textAnchor="middle" fontSize="26" fontWeight="900" fill="#3b82f6" fontFamily="sans-serif">
            ?
          </text>
          <path d="M50 4 l-6 10 h5 l-4 9 10 -12 h-5 l4 -7z" fill="#facc15" stroke="#fff" strokeWidth="1" />
        </svg>
      );
  }
}
