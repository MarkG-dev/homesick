"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ───────────────────────────────────────────────────────────────────
   GRID WALL — sixteen little windows.
   Hover to color a tile. Click to step into that color room.
   ─────────────────────────────────────────────────────────────────── */

const IMG = {
  atc: "/assets/magnifics_upscale-V3jRyWe7MMJjWWu6FHMo-image%208%202.png",
  wandr: "/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png",
  sigh: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
  parrot: "/assets/freepik__make-the-bird-parrot-colors-parakeet-colors-and-ma__23599%202.png",
  stonecharge: "/assets/freepik__small-apple-mag-safe-wire-coming-out-of-the-right-__23598%202.png",
  dreamcatcher: "/assets/freepik__make-the-rock-slightly-thinner-maybe-40-thinner-__23593%202.png",
};

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
    };

const TILES: Tile[] = [
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
  { kind: "teaser", id: "soft-echo", twoWords: ["SOFT", "ECHO"], color: "#E8DCC8", ink: "dark" },
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
  { kind: "teaser", id: "tiny-weather", twoWords: ["TINY", "WEATHER"], color: "#CFD8D2", ink: "dark" },

  { kind: "teaser", id: "slow-mail", twoWords: ["SLOW", "MAIL"], color: "#D9C7B0", ink: "dark" },
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
  { kind: "teaser", id: "warm-rock", twoWords: ["WARM", "ROCK"], color: "#C9A87C", ink: "dark" },
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
  { kind: "teaser", id: "little-moon", twoWords: ["LITTLE", "MOON"], color: "#1E2742", ink: "light" },
  { kind: "teaser", id: "humming-bird", twoWords: ["HUMMING", "BIRD"], color: "#E6B8C4", ink: "dark" },
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

  { kind: "teaser", id: "fire-fly", twoWords: ["FIRE", "FLY"], color: "#F0E04A", ink: "dark" },
  { kind: "teaser", id: "quiet-door", twoWords: ["QUIET", "DOOR"], color: "#8B7355", ink: "light" },
  { kind: "teaser", id: "salt-air", twoWords: ["SALT", "AIR"], color: "#B8D4D4", ink: "dark" },
  { kind: "teaser", id: "good-omen", twoWords: ["GOOD", "OMEN"], color: "#D44C3A", ink: "light" },
];

const TILE_BY_SLUG: Record<string, Tile> = Object.fromEntries(TILES.map((t) => [t.id, t]));

/* ─── grain overlay (matches the existing site) ─── */
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

/* ─── animated product image (gentle float) ─── */
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

export default function GridPage() {
  const params = useParams<{ slug?: string[] }>();
  const initialSlug = params?.slug?.[0];

  // Hydrate already-open room from the URL (deep link or refresh).
  const initialTile = initialSlug ? TILE_BY_SLUG[initialSlug] ?? null : null;

  const [opened, setOpened] = useState<Tile | null>(initialTile);
  const [closing, setClosing] = useState(false);
  // origin for the circular wipe — set on tile click in viewport coords.
  // `null` means "no click origin" (deep-link / back-button) → use a soft fade instead.
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /* lock body scroll while a room is open */
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
    // Update URL without a Next route change so the wipe isn't interrupted.
    window.history.pushState({ slug: tile.id }, "", `/grid/${tile.id}`);
  };

  const handleClose = () => {
    setClosing(true);
    // matches the css timing below
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

  /* keep state in sync with browser back/forward */
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

  /* escape closes the room */
  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened]);

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden">
      {/* keyframes scoped to the page */}
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

      {/* ─── HEADER ─── */}
      <header className="relative z-10 px-5 md:px-8 pt-5 md:pt-8 pb-3 flex items-center justify-between">
        <img
          src="/assets/HOMESICK.png"
          alt="HOMESICK"
          className="h-5 md:h-6 block"
          style={{ mixBlendMode: "screen" }}
        />
        <Link
          href="/"
          className="text-[12px] md:text-body uppercase text-white/50 hover:text-white tracking-wide"
        >
          ← OLD SITE
        </Link>
      </header>

      {/* ─── INTRO ─── */}
      <div className="relative z-10 px-5 md:px-8 pt-6 md:pt-12 pb-6 md:pb-10 max-w-[900px]">
        <h1 className="text-[28px] md:text-[44px] leading-[1.05] uppercase tracking-tight">
          A wall of little<br />
          windows. Pick one.
        </h1>
        <p className="mt-3 md:mt-4 text-body text-white/55 normal-case max-w-[520px] leading-snug">
          Sixteen objects, real and not-yet. Hover to peek. Click to step inside.
        </p>
      </div>

      {/* ─── GRID ─── */}
      <div
        className="relative z-10 px-5 md:px-8 pb-10 grid grid-cols-2 md:grid-cols-4 gap-[2px] md:gap-[3px]"
        style={{ maxWidth: 1400, marginInline: "auto" }}
      >
        {TILES.map((tile) => {
          const hovered = hoveredId === tile.id;
          return (
            <button
              key={tile.id}
              onClick={(e) => openTile(tile, e)}
              onMouseEnter={() => setHoveredId(tile.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative aspect-square w-full overflow-hidden text-left bg-[#0a0a0a]"
              style={{ transition: "transform 0.4s ease" }}
            >
              {/* color fill that crossfades in on hover */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{
                  background: tile.color,
                  opacity: hovered ? 1 : 0,
                }}
              />
              {/* grain layered on top of color */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-500 ease-out"
                style={{ opacity: hovered ? 1 : 0 }}
              >
                <GrainOverlay opacity={0.08} />
              </div>

              {/* product image — only on product tiles */}
              {tile.kind === "product" && (
                <div
                  className="absolute inset-0 flex items-center justify-center p-[14%] transition-transform duration-700 ease-out"
                  style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
                >
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="max-w-full max-h-full object-contain transition-[filter] duration-500"
                    style={{
                      filter: hovered ? "none" : "grayscale(1) brightness(1.05) contrast(0.95)",
                    }}
                  />
                </div>
              )}

              {/* teaser tiles: abstract dot, painterly */}
              {tile.kind === "teaser" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: hovered ? "60%" : "32%",
                      height: hovered ? "60%" : "32%",
                      background: hovered
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.04)",
                      border: `1px dashed rgba(${tile.ink === "light" ? "255,255,255" : "0,0,0"}, ${hovered ? 0.3 : 0.18})`,
                    }}
                  />
                </div>
              )}

              {/* two-word label, bottom-left */}
              <div
                className="absolute left-3 bottom-3 right-3 text-[11px] md:text-[12px] leading-[1.05] uppercase tracking-wide transition-colors duration-500"
                style={{
                  color: hovered
                    ? tile.ink === "light"
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(0,0,0,0.85)"
                    : "rgba(255,255,255,0.55)",
                }}
              >
                <div>{tile.twoWords[0]}</div>
                <div>{tile.twoWords[1]}</div>
              </div>

              {/* tiny corner marker for teasers */}
              {tile.kind === "teaser" && (
                <div
                  className="absolute right-2 top-2 text-[10px] uppercase tracking-wider transition-colors duration-500"
                  style={{
                    color: hovered
                      ? tile.ink === "light"
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.5)"
                      : "rgba(255,255,255,0.3)",
                  }}
                >
                  SOON
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 px-5 md:px-8 pb-10 text-[11px] uppercase tracking-wider text-white/35">
        HOMESICK · GRID · PROTOTYPE
      </footer>

      {/* ─── ROOM (full-screen color expansion) ─── */}
      {opened && (
        <div
          className="fixed inset-0 z-50"
          style={{
            // these CSS vars drive the clip-path origin in the keyframes
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

            {/* room content */}
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
              {/* room header */}
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
