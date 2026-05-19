"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ───────────────────────────────────────────────────────────────────
   GRID — twelve little windows.
   Inspired by AWGE: pixel grid, chunky labels, retro icon vibe.
   Click a tile and its color floods the screen as a room.
   ─────────────────────────────────────────────────────────────────── */

const IMG = {
  atc: "/assets/magnifics_upscale-V3jRyWe7MMJjWWu6FHMo-image%208%202.png",
  wandr: "/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png",
  sigh: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
  parrot: "/assets/freepik__make-the-bird-parrot-colors-parakeet-colors-and-ma__23599%202.png",
  stonecharge: "/assets/freepik__small-apple-mag-safe-wire-coming-out-of-the-right-__23598%202.png",
  dreamcatcher: "/assets/freepik__make-the-rock-slightly-thinner-maybe-40-thinner-__23593%202.png",
};

/* simple inline SVG icons for teaser tiles — flat, chunky, like clip art */
type IconShape = "echo" | "moon" | "feather" | "spark" | "wave" | "star";

function ShapeIcon({ shape, color }: { shape: IconShape; color: string }) {
  const stroke = { stroke: color, strokeWidth: 6, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  const fill = { fill: color } as const;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {shape === "echo" && (
        <g {...stroke}>
          <circle cx="50" cy="50" r="10" />
          <circle cx="50" cy="50" r="22" />
          <circle cx="50" cy="50" r="34" />
        </g>
      )}
      {shape === "moon" && (
        <path {...fill} d="M68 22a32 32 0 1 0 0 56 26 26 0 0 1 0-56z" />
      )}
      {shape === "feather" && (
        <g>
          <path {...fill} d="M30 78 C30 50, 50 22, 78 22 C78 50, 58 78, 30 78 Z" />
          <line x1="30" y1="78" x2="20" y2="88" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {shape === "spark" && (
        <path {...fill} d="M50 14 L56 44 L86 50 L56 56 L50 86 L44 56 L14 50 L44 44 Z" />
      )}
      {shape === "wave" && (
        <g {...stroke}>
          <path d="M14 42 Q30 28, 46 42 T78 42 T86 42" />
          <path d="M14 58 Q30 44, 46 58 T78 58 T86 58" />
        </g>
      )}
      {shape === "star" && (
        <path {...fill} d="M50 14 L60 40 L88 42 L66 60 L74 86 L50 72 L26 86 L34 60 L12 42 L40 40 Z" />
      )}
    </svg>
  );
}

type Tile =
  | {
      kind: "product";
      id: string;
      name: string;
      twoWords: [string, string];
      image: string;
      color: string;
      ink: "light" | "dark";
      description: string;
    }
  | {
      kind: "teaser";
      id: string;
      twoWords: [string, string];
      color: string;
      ink: "light" | "dark";
      shape: IconShape;
    };

/* 12 tiles — 4 rows × 3 cols. 6 products + 6 teasers. */
const TILES: Tile[] = [
  // row 1: hero products
  {
    kind: "product",
    id: "please-hold",
    name: "PLEASE HOLD",
    twoWords: ["PASS", "MESSAGES"],
    image: IMG.atc,
    color: "#F4C430",
    ink: "dark",
    description:
      "This phone holds one message at a time. Play the game of telephone with friends! Messages save to a digital map so you can co-create funny stories.",
  },
  {
    kind: "product",
    id: "dreamcatcher",
    name: "DREAMCATCHER",
    twoWords: ["RECORD", "DREAMS"],
    image: IMG.dreamcatcher,
    color: "#2A3FA8",
    ink: "light",
    description:
      "Press this button in the dark to record your dreams. Receive them transcribed in the morning. If you're feeling brave, we'll analyze them too.",
  },
  {
    kind: "product",
    id: "wandr",
    name: "WANDR",
    twoWords: ["COUNT", "MILES"],
    image: IMG.wandr,
    color: "#7B5BD9",
    ink: "light",
    description:
      "A stone that counts every mile you've ever walked. Not steps today — miles, total, forever. Watch the number build and suddenly a Tuesday afternoon walk matters.",
  },

  // row 2: more products
  {
    kind: "product",
    id: "sigh",
    name: "SIGH",
    twoWords: ["CALM", "BREATH"],
    image: IMG.sigh,
    color: "#7BB7E0",
    ink: "dark",
    description:
      "Breathwork guidance shrunk down to light and vibration in your pocket. It's a little ridiculous that the best way to calm down involves pulling out the same device that stresses us out!",
  },
  {
    kind: "product",
    id: "parrot",
    name: "PARROT",
    twoWords: ["TALKING", "DESK"],
    image: IMG.parrot,
    color: "#3CB878",
    ink: "light",
    description:
      "A robot parrot for your desk. It listens. It repeats things. It has opinions about your vocabulary. Wouldn't it be fun if we all had a parrot? I've always wanted one...",
  },
  {
    kind: "product",
    id: "stonecharge",
    name: "STONECHARGE",
    twoWords: ["HIDE", "PHONE"],
    image: IMG.stonecharge,
    color: "#E07A3C",
    ink: "dark",
    description:
      "Safe underneath a beautiful rock that hides your phone. You want it back? Lift the stone. Deliberately. Elevate your space.",
  },

  // row 3: teasers
  { kind: "teaser", id: "soft-echo",    twoWords: ["SOFT", "ECHO"],    color: "#8B7E66", ink: "dark",  shape: "echo" },
  { kind: "teaser", id: "little-moon",  twoWords: ["LITTLE", "MOON"],  color: "#1E2742", ink: "light", shape: "moon" },
  { kind: "teaser", id: "humming-bird", twoWords: ["HUMMING", "BIRD"], color: "#C24F7A", ink: "light", shape: "feather" },

  // row 4: teasers
  { kind: "teaser", id: "fire-fly",     twoWords: ["FIRE", "FLY"],     color: "#E8B824", ink: "dark",  shape: "spark" },
  { kind: "teaser", id: "salt-air",     twoWords: ["SALT", "AIR"],     color: "#4A9E9C", ink: "light", shape: "wave" },
  { kind: "teaser", id: "good-omen",    twoWords: ["GOOD", "OMEN"],    color: "#D44C3A", ink: "light", shape: "star" },
];

const TILE_BY_SLUG: Record<string, Tile> = Object.fromEntries(TILES.map((t) => [t.id, t]));

/* ─── grain / scanline overlay ─── */
function GrainOverlay({ opacity = 0.045 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
        opacity,
        mixBlendMode: "overlay",
      }}
    />
  );
}

/* horizontal CRT scanlines */
function Scanlines() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)",
        mixBlendMode: "multiply",
        opacity: 0.7,
      }}
    />
  );
}

/* animated product image (gentle float) — used inside the open room */
function FloatingProduct({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative w-[min(72vw,560px)] h-[min(72vw,560px)]"
      style={{ animation: "floatBob 6s ease-in-out infinite" }}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ filter: "drop-shadow(0 24px 36px rgba(0,0,0,0.18))" }}
      />
    </div>
  );
}

/* MEDIA box at top — sheep video framed like an old TV */
function MediaTV() {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div className="relative mx-auto w-[min(86vw,360px)]">
      {/* TV bezel */}
      <div
        className="relative rounded-[24px] p-3 md:p-4"
        style={{
          background: "linear-gradient(180deg, #d9d4cc 0%, #b8b3aa 100%)",
          boxShadow:
            "inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15), 0 8px 18px rgba(0,0,0,0.18)",
        }}
      >
        {/* screen */}
        <div
          className="relative aspect-square overflow-hidden rounded-[10px]"
          style={{
            background: "#0a0a0a",
            boxShadow: "inset 0 0 18px rgba(0,0,0,0.6)",
          }}
        >
          <video
            ref={ref}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 20%" }}
          >
            <source src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4" type="video/mp4" />
          </video>

          {/* CRT static bar + scanlines */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px)",
              mixBlendMode: "overlay",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 82%, rgba(0,0,0,0.25) 100%)",
            }}
          />
          {/* label */}
          <div
            className="absolute left-0 right-0 bottom-0 text-center pb-3"
            style={{
              color: "#fff",
              letterSpacing: "0.08em",
              textShadow: "0 1px 0 rgba(0,0,0,0.6)",
            }}
          >
            <span className="font-[600] text-[14px] md:text-[16px] uppercase">HOMESICK</span>
          </div>

          {/* tiny red record dot */}
          <div
            aria-hidden
            className="absolute right-3 top-3 w-[6px] h-[6px] rounded-full"
            style={{ background: "#ff4d4d", boxShadow: "0 0 6px #ff4d4d" }}
          />
        </div>
      </div>
      {/* TV base/feet */}
      <div className="mx-auto mt-1 w-[60%] h-[6px] bg-[#aea99e] rounded-b-md" />
    </div>
  );
}

export default function GridPage() {
  const params = useParams<{ slug?: string[] }>();
  const initialSlug = params?.slug?.[0];

  const initialTile = initialSlug ? TILE_BY_SLUG[initialSlug] ?? null : null;

  const [opened, setOpened] = useState<Tile | null>(initialTile);
  const [closing, setClosing] = useState(false);
  // origin for the circular wipe — set on tile click in viewport coords.
  // `null` means "no click origin" (deep-link / back-button) → soft fade instead.
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (opened) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [opened]);

  const openTile = (tile: Tile, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOrigin({
      x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
      y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
    });
    setOpened(tile);
    setClosing(false);
    window.history.pushState({ slug: tile.id }, "", `/grid/${tile.id}`);
  };

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(() => {
      setOpened(null);
      setClosing(false);
      setOrigin(null);
    }, 480);
    if (window.history.state?.slug) {
      window.history.back();
    } else {
      window.history.replaceState(null, "", "/grid");
    }
  };

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      const m = path.match(/^\/grid\/([^/]+)/);
      const slug = m?.[1];
      const tile = slug ? TILE_BY_SLUG[slug] ?? null : null;
      setOrigin(null);
      setClosing(false);
      setOpened(tile);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened]);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ background: "#dad4c8", color: "#1a1a1a" }}
    >
      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes wipeIn {
          from { clip-path: circle(0% at var(--ox) var(--oy)); }
          to   { clip-path: circle(150% at var(--ox) var(--oy)); }
        }
        @keyframes wipeOut {
          from { clip-path: circle(150% at var(--ox) var(--oy)); }
          to   { clip-path: circle(0% at var(--ox) var(--oy)); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes roomIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* page-wide scanlines + grain */}
      <Scanlines />
      <GrainOverlay opacity={0.05} />

      {/* ─── HEADER ─── */}
      <header className="relative z-10 px-5 md:px-8 pt-5 md:pt-7 pb-2 flex items-center justify-between">
        <Link href="/" className="text-[11px] md:text-[12px] uppercase tracking-wider text-black/60 hover:text-black">
          ← OLD SITE
        </Link>
        <h1
          className="text-[22px] md:text-[28px] uppercase tracking-[0.06em] font-[800]"
          style={{ color: "#1a1a1a" }}
        >
          HOMESICK
        </h1>
        <span className="text-[11px] md:text-[12px] uppercase tracking-wider text-black/40">
          GRID
        </span>
      </header>

      {/* separator line */}
      <div className="relative z-10 mx-5 md:mx-8 h-px" style={{ background: "rgba(0,0,0,0.18)" }} />

      {/* ─── MEDIA TV ─── */}
      <div className="relative z-10 pt-5 md:pt-8 pb-4 md:pb-6">
        <MediaTV />
      </div>

      {/* ─── GRID ─── */}
      <div
        className="relative z-10 px-5 md:px-8 pb-6 grid grid-cols-3 gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-10"
        style={{ maxWidth: 720, marginInline: "auto" }}
      >
        {TILES.map((tile) => {
          const hovered = hoveredId === tile.id;
          return (
            <button
              key={tile.id}
              onClick={(e) => openTile(tile, e)}
              onMouseEnter={() => setHoveredId(tile.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative flex flex-col items-center text-center"
              style={{ transition: "transform 0.2s ease" }}
            >
              {/* icon area — sits on the page background, not in a hard box */}
              <div
                className="relative w-full aspect-square flex items-center justify-center"
                style={{
                  transform: hovered ? "translateY(-3px)" : "translateY(0)",
                  transition: "transform 0.25s ease",
                }}
              >
                {/* soft color disc behind, fades in on hover */}
                <div
                  aria-hidden
                  className="absolute rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: "92%",
                    height: "92%",
                    background: tile.color,
                    opacity: hovered ? 0.28 : 0,
                    filter: "blur(14px)",
                  }}
                />

                {tile.kind === "product" ? (
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="relative max-w-[88%] max-h-[88%] object-contain"
                    style={{
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))",
                    }}
                  />
                ) : (
                  <div className="relative w-[58%] h-[58%]">
                    <ShapeIcon shape={tile.shape} color={tile.color} />
                  </div>
                )}
              </div>

              {/* two-word label in the tile's color */}
              <div
                className="mt-1 text-[12px] md:text-[14px] leading-[1.05] uppercase tracking-[0.04em] font-[700]"
                style={{
                  color: tile.color,
                  textShadow: "0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                <div>{tile.twoWords[0]}</div>
                <div>{tile.twoWords[1]}</div>
              </div>

              {tile.kind === "teaser" && (
                <div className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-black/40">
                  SOON
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── FOOTER ─── */}
      <footer
        className="relative z-10 px-5 md:px-8 pt-2 pb-8 text-center text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "rgba(0,0,0,0.5)" }}
      >
        <div>© 2026 · HOMESICK</div>
        <div className="mt-1 opacity-70">A FIELD OF OBJECTS · GRID</div>
      </footer>

      {/* ─── ROOM (full-screen color expansion) ─── */}
      {opened && (
        <div
          className="fixed inset-0 z-50"
          style={{
            ["--ox" as string]: origin ? `${origin.x}%` : "50%",
            ["--oy" as string]: origin ? `${origin.y}%` : "50%",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: opened.color,
              animation: closing
                ? "wipeOut 0.45s cubic-bezier(0.7, 0, 0.3, 1) forwards"
                : origin
                ? "wipeIn 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) forwards"
                : "fadeIn 0.35s ease-out forwards",
            }}
          >
            <GrainOverlay opacity={0.07} />

            <div
              className="absolute inset-0 flex flex-col"
              style={{
                color:
                  opened.ink === "light"
                    ? "rgba(255,255,255,0.96)"
                    : "rgba(0,0,0,0.88)",
                opacity: closing ? 0 : 1,
                transition: "opacity 0.25s ease-out",
                animation: closing ? undefined : "roomIn 0.6s ease-out 0.25s backwards",
              }}
            >
              <div className="relative z-10 px-5 md:px-8 pt-5 md:pt-8 pb-3 flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="text-[12px] md:text-body uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity"
                >
                  ← BACK
                </button>
                <div className="text-[11px] md:text-[12px] uppercase tracking-wider opacity-50">
                  {opened.kind === "product" ? opened.name : "COMING SOON"}
                </div>
              </div>

              {opened.kind === "product" ? (
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-5 md:px-12 gap-6 md:gap-16">
                  <div className="flex-1 flex items-center justify-center">
                    <FloatingProduct src={opened.image} alt={opened.name} />
                  </div>
                  <div className="flex-1 max-w-[480px] flex flex-col gap-4">
                    <div className="text-[12px] uppercase tracking-wider opacity-60">
                      {opened.twoWords[0]} · {opened.twoWords[1]}
                    </div>
                    <h2 className="text-[36px] md:text-[56px] leading-[1] uppercase tracking-tight">
                      {opened.name}
                    </h2>
                    <p className="text-[15px] md:text-[17px] leading-snug normal-case max-w-[44ch]">
                      {opened.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
                  <div className="text-[12px] uppercase tracking-wider opacity-60">
                    NOT QUITE READY
                  </div>
                  <h2 className="text-[44px] md:text-[80px] leading-[0.95] uppercase tracking-tight">
                    {opened.twoWords[0]}<br />{opened.twoWords[1]}
                  </h2>
                  <p className="max-w-[40ch] text-[15px] md:text-[17px] leading-snug normal-case opacity-80">
                    A future object we&apos;re still making. Tell us what it should be.
                  </p>
                  <Link
                    href="/"
                    className="mt-2 text-[12px] uppercase tracking-wider underline underline-offset-4 opacity-80 hover:opacity-100"
                  >
                    Drop a note →
                  </Link>
                </div>
              )}

              <div className="px-5 md:px-8 pb-6 md:pb-10 flex items-center justify-between text-[11px] uppercase tracking-wider opacity-50">
                <span>HOMESICK</span>
                <span>WINDOW · {opened.id.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
