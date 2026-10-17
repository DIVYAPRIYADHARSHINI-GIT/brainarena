// Original SVG card faces for Memory Match: 18 animals, 18 flags, 18 space icons.
// Animals share one parametric cartoon-face template to keep this file small.
import type { MemoryTheme } from "@/lib/memory";

const INK = "#2e1065";

// ---------------- Animals ----------------
type Ear = "round" | "pointy" | "long" | "floppy" | "none" | "big";
interface Animal {
  name: string;
  head: string;
  ear: Ear;
  earColor?: string;
  inner?: string;
  muzzle?: string;
  extra?: "whiskers" | "patches" | "snout" | "mane" | "stripes" | "spots" | "beak" | "trunk" | "frog" | "penguin" | "owl" | "koala";
}

const ANIMALS: Animal[] = [
  { name: "Cat", head: "#fdba74", ear: "pointy", inner: "#fda4af", extra: "whiskers" },
  { name: "Dog", head: "#d6a46b", ear: "floppy", earColor: "#92582b", muzzle: "#fde7c8" },
  { name: "Panda", head: "#ffffff", ear: "round", earColor: "#1f1f1f", extra: "patches" },
  { name: "Bear", head: "#a16207", ear: "round", inner: "#fcd34d", muzzle: "#fde68a" },
  { name: "Rabbit", head: "#f5f5f4", ear: "long", inner: "#fbcfe8" },
  { name: "Pig", head: "#f9a8d4", ear: "pointy", inner: "#f472b6", extra: "snout" },
  { name: "Frog", head: "#4ade80", ear: "none", extra: "frog" },
  { name: "Lion", head: "#fbbf24", ear: "round", earColor: "#f59e0b", extra: "mane", muzzle: "#fef3c7" },
  { name: "Fox", head: "#f97316", ear: "pointy", inner: "#fff7ed", muzzle: "#fff7ed" },
  { name: "Mouse", head: "#cbd5e1", ear: "big", inner: "#fbcfe8", extra: "whiskers" },
  { name: "Cow", head: "#ffffff", ear: "floppy", earColor: "#e7e5e4", extra: "spots", muzzle: "#fbcfe8" },
  { name: "Owl", head: "#a16207", ear: "pointy", inner: "#78350f", extra: "owl" },
  { name: "Penguin", head: "#1e293b", ear: "none", extra: "penguin" },
  { name: "Chick", head: "#fde047", ear: "none", extra: "beak" },
  { name: "Monkey", head: "#92400e", ear: "round", inner: "#fcd9b6", muzzle: "#fcd9b6" },
  { name: "Koala", head: "#9ca3af", ear: "big", inner: "#e5e7eb", extra: "koala" },
  { name: "Tiger", head: "#fb923c", ear: "round", inner: "#fff7ed", extra: "stripes", muzzle: "#fff7ed" },
  { name: "Elephant", head: "#94a3b8", ear: "big", inner: "#f9a8d4", extra: "trunk" },
];

function Ears({ a }: { a: Animal }) {
  const c = a.earColor ?? a.head;
  const inner = a.inner ?? c;
  switch (a.ear) {
    case "round":
      return (
        <g stroke={INK} strokeWidth="2">
          <circle cx="16" cy="18" r="9" fill={c} />
          <circle cx="48" cy="18" r="9" fill={c} />
          <circle cx="16" cy="18" r="4.5" fill={inner} stroke="none" />
          <circle cx="48" cy="18" r="4.5" fill={inner} stroke="none" />
        </g>
      );
    case "pointy":
      return (
        <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M10 28 L14 6 L28 18 Z" fill={c} />
          <path d="M54 28 L50 6 L36 18 Z" fill={c} />
          <path d="M14 22 L15.5 12 L23 18 Z" fill={inner} stroke="none" />
          <path d="M50 22 L48.5 12 L41 18 Z" fill={inner} stroke="none" />
        </g>
      );
    case "long":
      return (
        <g stroke={INK} strokeWidth="2">
          <ellipse cx="22" cy="12" rx="5.5" ry="13" fill={c} />
          <ellipse cx="42" cy="12" rx="5.5" ry="13" fill={c} />
          <ellipse cx="22" cy="12" rx="2.5" ry="9" fill={inner} stroke="none" />
          <ellipse cx="42" cy="12" rx="2.5" ry="9" fill={inner} stroke="none" />
        </g>
      );
    case "floppy":
      return (
        <g stroke={INK} strokeWidth="2">
          <ellipse cx="11" cy="32" rx="7" ry="13" fill={c} transform="rotate(18 11 32)" />
          <ellipse cx="53" cy="32" rx="7" ry="13" fill={c} transform="rotate(-18 53 32)" />
        </g>
      );
    case "big":
      return (
        <g stroke={INK} strokeWidth="2">
          <circle cx="12" cy="24" r="12" fill={c} />
          <circle cx="52" cy="24" r="12" fill={c} />
          <circle cx="12" cy="24" r="7" fill={inner} stroke="none" />
          <circle cx="52" cy="24" r="7" fill={inner} stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

function AnimalFace({ a }: { a: Animal }) {
  const eyes = (
    <g fill={INK}>
      <circle cx="25" cy="34" r="3" />
      <circle cx="39" cy="34" r="3" />
      <circle cx="26" cy="33" r="1" fill="#fff" />
      <circle cx="40" cy="33" r="1" fill="#fff" />
    </g>
  );
  const smile = <path d="M28 45 Q32 49 36 45" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />;
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      {a.extra === "mane" && <circle cx="32" cy="36" r="27" fill="#d97706" stroke={INK} strokeWidth="2" />}
      <Ears a={a} />
      {a.extra === "penguin" ? (
        <g>
          <ellipse cx="32" cy="36" rx="22" ry="24" fill={a.head} stroke={INK} strokeWidth="2" />
          <path d="M32 22 C20 22 18 34 20 44 C22 54 42 54 44 44 C46 34 44 22 32 22Z" fill="#fff" />
          {eyes}
          <path d="M28 41 L36 41 L32 47Z" fill="#f59e0b" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      ) : a.extra === "frog" ? (
        <g stroke={INK} strokeWidth="2">
          <circle cx="21" cy="20" r="9" fill={a.head} />
          <circle cx="43" cy="20" r="9" fill={a.head} />
          <ellipse cx="32" cy="38" rx="25" ry="18" fill={a.head} />
          <circle cx="21" cy="20" r="5" fill="#fff" />
          <circle cx="43" cy="20" r="5" fill="#fff" />
          <circle cx="22" cy="21" r="2.5" fill={INK} stroke="none" />
          <circle cx="44" cy="21" r="2.5" fill={INK} stroke="none" />
          <path d="M20 40 Q32 50 44 40" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="40" r="3" fill="#fb7185" stroke="none" opacity="0.6" />
          <circle cx="48" cy="40" r="3" fill="#fb7185" stroke="none" opacity="0.6" />
        </g>
      ) : (
        <g>
          <circle cx="32" cy="36" r="21" fill={a.head} stroke={INK} strokeWidth="2" />
          {a.extra === "patches" && (
            <g fill="#1f1f1f">
              <ellipse cx="24" cy="34" rx="6" ry="7.5" transform="rotate(-25 24 34)" />
              <ellipse cx="40" cy="34" rx="6" ry="7.5" transform="rotate(25 40 34)" />
            </g>
          )}
          {a.extra === "spots" && (
            <g fill="#44403c">
              <ellipse cx="20" cy="26" rx="6" ry="4" />
              <ellipse cx="45" cy="24" rx="4" ry="3" />
            </g>
          )}
          {a.extra === "stripes" && (
            <g stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round">
              <path d="M32 16 v6" />
              <path d="M24 18 l2 5" />
              <path d="M40 18 l-2 5" />
              <path d="M12 34 h6" />
              <path d="M46 34 h6" />
            </g>
          )}
          {a.extra === "owl" && (
            <g stroke={INK} strokeWidth="1.5">
              <circle cx="24" cy="34" r="8" fill="#fef3c7" />
              <circle cx="40" cy="34" r="8" fill="#fef3c7" />
            </g>
          )}
          {a.muzzle && <ellipse cx="32" cy="44" rx="10" ry="7.5" fill={a.muzzle} />}
          {a.extra === "patches" ? (
            <g fill="#fff">
              <circle cx="25" cy="34" r="2.2" />
              <circle cx="39" cy="34" r="2.2" />
            </g>
          ) : (
            eyes
          )}
          {a.extra === "snout" ? (
            <g>
              <ellipse cx="32" cy="44" rx="7" ry="5" fill="#f472b6" stroke={INK} strokeWidth="1.5" />
              <circle cx="29.5" cy="44" r="1.3" fill={INK} />
              <circle cx="34.5" cy="44" r="1.3" fill={INK} />
            </g>
          ) : a.extra === "beak" || a.extra === "owl" ? (
            <path d="M28 41 L36 41 L32 47Z" fill="#f59e0b" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          ) : a.extra === "trunk" ? (
            <path d="M29 40 C29 50 30 56 24 58 M35 40 C35 52 34 58 26 61" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : a.extra === "koala" ? (
            <ellipse cx="32" cy="42" rx="5" ry="6.5" fill="#374151" />
          ) : (
            <g>
              <ellipse cx="32" cy="41" rx="3" ry="2.2" fill={INK} />
              {smile}
            </g>
          )}
          {a.extra === "whiskers" && (
            <g stroke={INK} strokeWidth="1.2" strokeLinecap="round">
              <path d="M12 40 l10 1" />
              <path d="M12 45 l10 -1" />
              <path d="M52 40 l-10 1" />
              <path d="M52 45 l-10 -1" />
            </g>
          )}
          {a.extra === "trunk" && <circle cx="20" cy="44" r="3" fill="#fb7185" opacity="0.5" />}
        </g>
      )}
    </svg>
  );
}

// ---------------- Flags (simplified, 3:2) ----------------
const FLAG_NAMES = ["India", "Japan", "France", "Germany", "Italy", "Brazil", "Canada", "USA", "UK", "Bangladesh", "Sweden", "Switzerland", "Nigeria", "Indonesia", "Ukraine", "Greece", "Argentina", "Vietnam"];

function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.42 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function FlagArt({ i }: { i: number }) {
  const H = (colors: string[]) => colors.map((c, k) => <rect key={k} x="0" y={(40 / colors.length) * k} width="60" height={40 / colors.length + 0.2} fill={c} />);
  const V = (colors: string[]) => colors.map((c, k) => <rect key={k} x={(60 / colors.length) * k} y="0" width={60 / colors.length + 0.2} height="40" fill={c} />);
  let body: React.ReactNode;
  switch (i) {
    case 0:
      body = (
        <>
          {H(["#ff9933", "#ffffff", "#138808"])}
          <circle cx="30" cy="20" r="5" fill="none" stroke="#000080" strokeWidth="1.3" />
          <circle cx="30" cy="20" r="1" fill="#000080" />
        </>
      );
      break;
    case 1:
      body = (
        <>
          <rect width="60" height="40" fill="#fff" />
          <circle cx="30" cy="20" r="10" fill="#bc002d" />
        </>
      );
      break;
    case 2:
      body = V(["#0055a4", "#ffffff", "#ef4135"]);
      break;
    case 3:
      body = H(["#000000", "#dd0000", "#ffce00"]);
      break;
    case 4:
      body = V(["#009246", "#ffffff", "#ce2b37"]);
      break;
    case 5:
      body = (
        <>
          <rect width="60" height="40" fill="#009c3b" />
          <path d="M30 5 L55 20 L30 35 L5 20Z" fill="#ffdf00" />
          <circle cx="30" cy="20" r="8" fill="#002776" />
          <path d="M22.5 18 Q30 16 37.5 21" stroke="#fff" strokeWidth="1.3" fill="none" />
        </>
      );
      break;
    case 6:
      body = (
        <>
          {V(["#d52b1e", "#ffffff", "#ffffff", "#d52b1e"])}
          <path d="M30 9 l2 4 3 -1 -1 6 3 -2 1 2 3 0 -2 3 2 1 -6 4 0 4 -2 0 0 -4 -6 -4 2 -1 -2 -3 3 0 1 -2 3 2 -1 -6 3 1z" fill="#d52b1e" />
        </>
      );
      break;
    case 7:
      body = (
        <>
          {H(["#b22234", "#fff", "#b22234", "#fff", "#b22234", "#fff", "#b22234"])}
          <rect width="26" height="22" fill="#3c3b6e" />
          {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <circle key={`${r}${c}`} cx={4 + c * 6} cy={4 + r * 7} r="1.3" fill="#fff" />))}
        </>
      );
      break;
    case 8:
      body = (
        <>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#c8102e" strokeWidth="3" />
          <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="12" />
          <path d="M30 0 V40 M0 20 H60" stroke="#c8102e" strokeWidth="7" />
        </>
      );
      break;
    case 9:
      body = (
        <>
          <rect width="60" height="40" fill="#006a4e" />
          <circle cx="27" cy="20" r="10" fill="#f42a41" />
        </>
      );
      break;
    case 10:
      body = (
        <>
          <rect width="60" height="40" fill="#006aa7" />
          <path d="M22 0 V40 M0 20 H60" stroke="#fecc00" strokeWidth="7" />
        </>
      );
      break;
    case 11:
      body = (
        <>
          <rect width="60" height="40" fill="#da291c" />
          <path d="M30 9 V31 M19 20 H41" stroke="#fff" strokeWidth="6.5" />
        </>
      );
      break;
    case 12:
      body = V(["#008751", "#ffffff", "#008751"]);
      break;
    case 13:
      body = H(["#ce1126", "#ffffff"]);
      break;
    case 14:
      body = H(["#0057b7", "#ffd700"]);
      break;
    case 15:
      body = (
        <>
          {H(["#0d5eaf", "#fff", "#0d5eaf", "#fff", "#0d5eaf", "#fff", "#0d5eaf", "#fff", "#0d5eaf"])}
          <rect width="22.2" height="22.2" fill="#0d5eaf" />
          <path d="M11.1 0 V22.2 M0 11.1 H22.2" stroke="#fff" strokeWidth="4.4" />
        </>
      );
      break;
    case 16:
      body = (
        <>
          {H(["#74acdf", "#ffffff", "#74acdf"])}
          <circle cx="30" cy="20" r="4" fill="#f6b40e" stroke="#85340a" strokeWidth="0.6" />
        </>
      );
      break;
    default:
      body = (
        <>
          <rect width="60" height="40" fill="#da251d" />
          <polygon points={star(30, 20.5, 10)} fill="#ffcd00" />
        </>
      );
  }
  return (
    <svg viewBox="0 0 60 40" className="h-auto w-[86%] overflow-hidden rounded-[3px] shadow ring-1 ring-black/10" aria-hidden>
      {body}
    </svg>
  );
}

// ---------------- Space ----------------
const SPACE_NAMES = ["Sun", "Moon", "Earth", "Saturn", "Rocket", "Star", "Comet", "UFO", "Astronaut", "Alien", "Telescope", "Satellite", "Galaxy", "Asteroid", "Black hole", "Mars", "Constellation", "Jupiter"];

function SpaceArt({ i }: { i: number }) {
  const s = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  let body: React.ReactNode;
  switch (i) {
    case 0:
      body = (
        <g>
          {Array.from({ length: 8 }, (_, k) => (
            <path key={k} d="M32 6 L35 14 L29 14Z" fill="#fb923c" transform={`rotate(${k * 45} 32 32)`} />
          ))}
          <circle cx="32" cy="32" r="15" fill="#facc15" {...s} />
          <circle cx="27" cy="30" r="1.8" fill={INK} />
          <circle cx="37" cy="30" r="1.8" fill={INK} />
          <path d="M27 36 Q32 40 37 36" fill="none" {...s} />
        </g>
      );
      break;
    case 1:
      body = (
        <g>
          <path d="M40 10 A22 22 0 1 0 54 42 A17 17 0 1 1 40 10Z" fill="#fde68a" {...s} />
          <circle cx="24" cy="38" r="2.5" fill="#fbbf24" />
          <circle cx="30" cy="48" r="1.8" fill="#fbbf24" />
        </g>
      );
      break;
    case 2:
      body = (
        <g>
          <circle cx="32" cy="32" r="20" fill="#38bdf8" {...s} />
          <path d="M18 22 C24 20 26 28 22 32 C18 36 24 42 20 46 C15 42 13 30 18 22Z M36 14 C44 16 50 24 48 30 C44 28 40 32 36 28 C34 24 38 20 36 14Z M34 40 C40 38 46 42 44 48 C40 52 34 50 34 40Z" fill="#4ade80" />
        </g>
      );
      break;
    case 3:
      body = (
        <g>
          <ellipse cx="32" cy="34" rx="28" ry="8" fill="none" stroke="#d97706" strokeWidth="4" transform="rotate(-18 32 34)" />
          <circle cx="32" cy="32" r="14" fill="#fcd34d" {...s} />
          <path d="M5 42 A28 8 -18 0 0 59 26" fill="none" stroke="#d97706" strokeWidth="4" transform="rotate(0)" />
        </g>
      );
      break;
    case 4:
      body = (
        <g>
          <path d="M32 6 C42 14 44 28 40 42 H24 C20 28 22 14 32 6Z" fill="#f1f5f9" {...s} />
          <circle cx="32" cy="24" r="5" fill="#38bdf8" {...s} />
          <path d="M24 34 L14 46 L24 44Z M40 34 L50 46 L40 44Z" fill="#ef4444" {...s} />
          <path d="M26 44 Q32 60 38 44Z" fill="#fb923c" />
          <path d="M29 44 Q32 54 35 44Z" fill="#facc15" />
        </g>
      );
      break;
    case 5:
      body = (
        <g>
          <polygon points={star(32, 33, 24)} fill="#facc15" {...s} />
          <circle cx="27" cy="32" r="1.8" fill={INK} />
          <circle cx="37" cy="32" r="1.8" fill={INK} />
          <path d="M28 38 Q32 41 36 38" fill="none" {...s} />
        </g>
      );
      break;
    case 6:
      body = (
        <g>
          <path d="M44 20 L8 50 M46 26 L14 56 M38 16 L6 40" stroke="#7dd3fc" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
          <circle cx="46" cy="18" r="10" fill="#e0f2fe" {...s} />
        </g>
      );
      break;
    case 7:
      body = (
        <g>
          <path d="M26 42 L18 58 M38 42 L46 58" stroke="#facc15" strokeWidth="3" opacity="0.8" />
          <path d="M20 26 A12 10 0 0 1 44 26Z" fill="#a5f3fc" {...s} />
          <ellipse cx="32" cy="32" rx="26" ry="9" fill="#a78bfa" {...s} />
          <circle cx="18" cy="32" r="2" fill="#facc15" />
          <circle cx="32" cy="34" r="2" fill="#facc15" />
          <circle cx="46" cy="32" r="2" fill="#facc15" />
        </g>
      );
      break;
    case 8:
      body = (
        <g>
          <circle cx="32" cy="30" r="20" fill="#f8fafc" {...s} />
          <rect x="18" y="20" width="28" height="18" rx="9" fill="#1e3a8a" {...s} />
          <path d="M24 26 Q28 23 32 25" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="22" y="48" width="20" height="10" rx="4" fill="#f8fafc" {...s} />
          <circle cx="52" cy="22" r="3" fill="#f43f5e" {...s} />
        </g>
      );
      break;
    case 9:
      body = (
        <g>
          <path d="M22 16 L18 6 M42 16 L46 6" {...s} />
          <circle cx="18" cy="6" r="3" fill="#a3e635" {...s} />
          <circle cx="46" cy="6" r="3" fill="#a3e635" {...s} />
          <path d="M32 12 C48 12 54 26 50 38 C46 50 38 56 32 56 C26 56 18 50 14 38 C10 26 16 12 32 12Z" fill="#a3e635" {...s} />
          <ellipse cx="24" cy="32" rx="6" ry="8" fill={INK} transform="rotate(-20 24 32)" />
          <ellipse cx="40" cy="32" rx="6" ry="8" fill={INK} transform="rotate(20 40 32)" />
          <path d="M28 46 Q32 49 36 46" fill="none" {...s} />
        </g>
      );
      break;
    case 10:
      body = (
        <g>
          <rect x="12" y="18" width="34" height="12" rx="3" fill="#a78bfa" transform="rotate(-25 29 24)" {...s} />
          <path d="M30 32 L20 56 M30 32 L40 56 M30 32 L30 56" {...s} />
          <circle cx="50" cy="10" r="2" fill="#facc15" />
          <circle cx="56" cy="20" r="1.5" fill="#facc15" />
        </g>
      );
      break;
    case 11:
      body = (
        <g transform="rotate(-30 32 32)">
          <rect x="4" y="26" width="18" height="12" fill="#38bdf8" {...s} />
          <rect x="42" y="26" width="18" height="12" fill="#38bdf8" {...s} />
          <path d="M13 26 V38 M51 26 V38" stroke={INK} strokeWidth="1" />
          <rect x="24" y="22" width="16" height="20" rx="3" fill="#e2e8f0" {...s} />
          <path d="M32 22 V14" {...s} />
          <circle cx="32" cy="12" r="3" fill="#f43f5e" {...s} />
        </g>
      );
      break;
    case 12:
      body = (
        <g>
          <path d="M32 32 C32 20 48 18 50 30 C52 44 34 50 24 42 C12 32 20 12 36 12" fill="none" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" />
          <path d="M32 32 C32 44 16 46 14 34 C12 20 30 14 40 22 C52 32 44 52 28 52" fill="none" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="32" cy="32" r="5" fill="#fef9c3" />
        </g>
      );
      break;
    case 13:
      body = (
        <g>
          <path d="M14 30 C12 18 26 10 36 12 C50 14 56 26 50 38 C46 50 30 54 20 46 C14 42 16 36 14 30Z" fill="#a8a29e" {...s} />
          <circle cx="26" cy="26" r="5" fill="#78716c" />
          <circle cx="40" cy="38" r="6" fill="#78716c" />
          <circle cx="40" cy="22" r="3" fill="#78716c" />
        </g>
      );
      break;
    case 14:
      body = (
        <g>
          <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#f97316" strokeWidth="4" />
          <ellipse cx="32" cy="32" rx="20" ry="6" fill="none" stroke="#facc15" strokeWidth="2" />
          <circle cx="32" cy="32" r="11" fill="#0f0a1f" stroke="#a78bfa" strokeWidth="2" />
        </g>
      );
      break;
    case 15:
      body = (
        <g>
          <circle cx="32" cy="32" r="20" fill="#ef4444" {...s} />
          <circle cx="24" cy="26" r="4" fill="#b91c1c" />
          <circle cx="38" cy="38" r="5" fill="#b91c1c" />
          <circle cx="40" cy="22" r="2.5" fill="#b91c1c" />
          <circle cx="24" cy="42" r="2" fill="#b91c1c" />
        </g>
      );
      break;
    case 16:
      body = (
        <g>
          <path d="M10 46 L22 28 L34 36 L44 14 L56 22" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="3 3" />
          {[
            [10, 46],
            [22, 28],
            [34, 36],
            [44, 14],
            [56, 22],
          ].map(([x, y], k) => (
            <polygon key={k} points={star(x, y, 5)} fill="#facc15" />
          ))}
        </g>
      );
      break;
    default:
      body = (
        <g>
          <circle cx="32" cy="32" r="22" fill="#fdba74" {...s} />
          <path d="M11 26 H53 M10 34 H54 M13 42 H51" stroke="#c2410c" strokeWidth="3" />
          <ellipse cx="40" cy="38" rx="5" ry="3" fill="#dc2626" />
        </g>
      );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      {body}
    </svg>
  );
}

export function memoryFaceName(theme: MemoryTheme, face: number): string {
  if (theme === "animals") return ANIMALS[face]?.name ?? "";
  if (theme === "flags") return FLAG_NAMES[face] ?? "";
  return SPACE_NAMES[face] ?? "";
}

export function MemoryFace({ theme, face }: { theme: MemoryTheme; face: number }) {
  if (theme === "animals") return <AnimalFace a={ANIMALS[face]} />;
  if (theme === "flags") return <FlagArt i={face} />;
  return <SpaceArt i={face} />;
}

/** Card back pattern: little Brain Arena "?" brain. */
export function CardBack() {
  return (
    <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 opacity-90" aria-hidden>
      <path d="M18 36 C10 34 10 24 16 21 C14 13 23 8 30 11 C33 5 44 5 47 11 C54 8 60 16 56 24 C62 28 60 38 52 40 C52 48 44 52 38 48 C34 54 24 54 22 48 C14 50 12 42 18 36Z" fill="#fff" opacity="0.25" />
      <text x="34" y="40" textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff" fontFamily="sans-serif">
        ?
      </text>
    </svg>
  );
}
