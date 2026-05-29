"use client";
import { useState, useRef } from "react";
import Link from "next/link";

/* ───────────────────────────────────────────────────────────────────
   GRID — a full-width TV banner over GOAT-style side-scroll rows.
   The TV starts off; click power to flash it on (plays the first
   channel + the fretless song). Three channels cycle field/sky/nest.
   Below: three horizontally-scrolling rows of the six products.
   ─────────────────────────────────────────────────────────────────── */

const IMG = {
  atc: "/assets/magnifics_upscale-V3jRyWe7MMJjWWu6FHMo-image%208%202.png",
  wandr: "/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png",
  sigh: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
  parrot: "/assets/freepik__make-the-bird-parrot-colors-parakeet-colors-and-ma__23599%202.png",
  stonecharge: "/assets/freepik__small-apple-mag-safe-wire-coming-out-of-the-right-__23598%202.png",
  dreamcatcher: "/assets/freepik__make-the-rock-slightly-thinner-maybe-40-thinner-__23593%202.png",
};

type Product = {
  id: string;
  name: string;
  tag: string;
  image: string;
  price: string;
  stock: string;
  color: string;
};

const PRODUCTS: Product[] = [
  { id: "please-hold",  name: "PLEASE HOLD",  tag: "'Pass Messages'", image: IMG.atc,          price: "$89",  stock: "IN STOCK · 12 LEFT",      color: "#F4C430" },
  { id: "dreamcatcher", name: "DREAMCATCHER", tag: "'Record Dreams'", image: IMG.dreamcatcher, price: "$129", stock: "IN STOCK · 47 LEFT",      color: "#2A3FA8" },
  { id: "wandr",        name: "WANDR",        tag: "'Count Miles'",   image: IMG.wandr,        price: "$99",  stock: "LOW STOCK · 8 LEFT",      color: "#7B5BD9" },
  { id: "sigh",         name: "SIGH",         tag: "'Calm Breath'",   image: IMG.sigh,         price: "$69",  stock: "IN STOCK · 23 LEFT",      color: "#7BB7E0" },
  { id: "parrot",       name: "PARROT",       tag: "'Talking Desk'",  image: IMG.parrot,       price: "$149", stock: "PRE-ORDER · SHIPS APRIL", color: "#3CB878" },
  { id: "stonecharge",  name: "STONECHARGE",  tag: "'Hide Phone'",    image: IMG.stonecharge,  price: "$79",  stock: "IN STOCK · 31 LEFT",      color: "#E07A3C" },
];

/* three category rows; each scrolls through all six, offset so they differ */
const ROWS: { label: string; order: number[] }[] = [
  { label: "MAGICAL OBJECTS", order: [0, 1, 2, 3, 4, 5] },
  { label: "NEW ARRIVALS",    order: [2, 3, 4, 5, 0, 1] },
  { label: "BACK IN STOCK",   order: [4, 5, 0, 1, 2, 3] },
];

const VIDEOS = [
  { id: "field", label: "FIELD", src: "/assets/hero-video.mp4" },
  { id: "sky",   label: "SKY",   src: "/assets/story-video.mp4" },
  { id: "nest",  label: "NEST",  src: "/assets/follow-video.mp4" },
];

/* ─── paper background (warm cream + fuzzy fibers) ─── */
function PaperBackground() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, #f3ead8 0%, #ebe0ca 55%, #d9cdb5 100%)",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.28 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
          backgroundSize: "400px 400px",
          opacity: 0.35,
          mixBlendMode: "multiply",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.9 0 0 0 0 0.7 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`,
          backgroundSize: "800px 800px",
          opacity: 0.5,
          mixBlendMode: "soft-light",
        }}
      />
    </>
  );
}

/* ─── full-width CRT TV banner (40vh) ─── */
function MediaTV() {
  const [tvState, setTvState] = useState<"off" | "flashing" | "on">("off");
  const [channel, setChannel] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const powerOn = () => {
    setTvState("flashing");
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    window.setTimeout(() => {
      setTvState("on");
      videoRef.current?.play().catch(() => {});
    }, 380);
  };

  const powerOff = () => {
    setTvState("off");
    videoRef.current?.pause();
    audioRef.current?.pause();
  };

  const togglePower = () => {
    if (tvState === "off") powerOn();
    else powerOff();
  };

  const switchChannel = (i: number) => {
    if (tvState === "off") return;
    setChannel(i);
    window.setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 30);
  };

  const isLive = tvState === "on" || tvState === "flashing";

  return (
    <div className="relative w-full" style={{ height: "40vh" }}>
      {/* thin bezel frame */}
      <div
        className="absolute inset-0 p-2 md:p-3"
        style={{
          background: "linear-gradient(180deg, #d8d2c4 0%, #b3ac9d 100%)",
          boxShadow:
            "inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.18)",
        }}
      >
        {/* screen */}
        <div
          className="relative w-full h-full overflow-hidden rounded-[6px]"
          style={{ background: "#0a0a0a", boxShadow: "inset 0 0 28px rgba(0,0,0,0.7)" }}
        >
          {isLive && (
            <video
              ref={videoRef}
              key={VIDEOS[channel].id}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 35%" }}
            >
              <source src={VIDEOS[channel].src} type="video/mp4" />
            </video>
          )}

          {/* off state: black + power prompt */}
          {tvState === "off" && (
            <button
              onClick={togglePower}
              aria-label="Power on"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer"
              style={{ background: "#0a0a0a" }}
            >
              <span
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #ff7a7a 0%, #c41818 60%, #800a0a 100%)",
                  boxShadow: "0 0 14px rgba(255,60,60,0.5)",
                }}
              >
                <span className="block w-3.5 h-3.5 rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-white/70">
                Press to play
              </span>
            </button>
          )}

          {/* flash-on overlay */}
          {tvState === "flashing" && (
            <div aria-hidden className="absolute inset-0" style={{ animation: "tvFlash 0.38s steps(8) forwards" }} />
          )}

          {/* scanlines */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 3px)",
              mixBlendMode: "overlay",
              opacity: isLive ? 1 : 0,
            }}
          />
          {/* sheen */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 14%, rgba(255,255,255,0) 84%, rgba(0,0,0,0.28) 100%)",
            }}
          />

          {/* channel label */}
          {isLive && (
            <div
              className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.18em] px-2 py-1"
              style={{ color: "#fff", background: "rgba(0,0,0,0.4)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
            >
              CH {channel + 1} · {VIDEOS[channel].label}
            </div>
          )}

          {/* controls — bottom-right, only when on */}
          {isLive && (
            <div
              className="absolute right-3 bottom-3 flex items-center gap-2 px-2 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            >
              {VIDEOS.map((v, i) => {
                const active = channel === i;
                return (
                  <button
                    key={v.id}
                    onClick={() => switchChannel(i)}
                    aria-label={`Channel ${i + 1}`}
                    className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-[700] transition-all"
                    style={{
                      background: active ? "#fff" : "rgba(255,255,255,0.25)",
                      color: active ? "#1a1a1a" : "rgba(255,255,255,0.85)",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
              <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.3)" }} />
              <button
                onClick={togglePower}
                aria-label="Power off"
                className="w-[20px] h-[20px] rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #ff7a7a 0%, #c41818 60%, #800a0a 100%)",
                  boxShadow: "0 0 6px rgba(255,60,60,0.6)",
                }}
              >
                <span className="block w-[6px] h-[6px] rounded-full" style={{ background: "rgba(255,255,255,0.9)" }} />
              </button>
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} src="/assets/fretle$$.m4a" loop preload="auto" />
    </div>
  );
}

/* ─── GOAT-style horizontal item ─── */
function ScrollItem({ product }: { product: Product }) {
  return (
    <div className="snap-start shrink-0 w-[82vw] md:w-[380px] flex items-center gap-4 pr-6">
      <div className="relative w-[88px] h-[88px] md:w-[104px] md:h-[104px] shrink-0 flex items-center justify-center">
        <div
          aria-hidden
          className="absolute rounded-full"
          style={{ width: "82%", height: "82%", background: product.color, opacity: 0.14, filter: "blur(12px)" }}
        />
        <img
          src={product.image}
          alt={product.name}
          className="relative max-w-[82%] max-h-[82%] object-contain"
          style={{ filter: "drop-shadow(0 5px 9px rgba(80,60,30,0.18))" }}
        />
      </div>
      <div className="min-w-0 flex flex-col gap-1">
        <div
          className="text-[15px] md:text-[16px] leading-tight font-[700] uppercase tracking-[0.02em]"
          style={{ color: product.color, textShadow: "0 1px 0 rgba(255,255,255,0.4)" }}
        >
          {product.name}
        </div>
        <div className="text-[12px] md:text-[13px] normal-case" style={{ color: "rgba(40,30,15,0.6)" }}>
          {product.tag}
        </div>
        <div className="text-[11px] md:text-[12px] uppercase tracking-[0.06em] mt-0.5" style={{ color: "rgba(40,30,15,0.85)" }}>
          <span className="font-[700]">{product.price}</span>
          <span className="opacity-60"> · {product.stock}</span>
        </div>
      </div>
    </div>
  );
}

function ScrollRow({ label, order }: { label: string; order: number[] }) {
  return (
    <section className="relative z-10">
      {/* section header */}
      <div className="px-5 md:px-8 flex items-baseline justify-between">
        <h2 className="text-[15px] md:text-[17px] uppercase tracking-[0.08em] font-[800]" style={{ color: "#2a2218" }}>
          {label}
        </h2>
        <span className="text-[12px] md:text-[13px] uppercase tracking-wider" style={{ color: "rgba(60,40,20,0.55)" }}>
          {order.length} Items ›
        </span>
      </div>
      {/* divider */}
      <div className="mx-5 md:mx-8 mt-2 h-px" style={{ background: "rgba(60,40,20,0.18)" }} />
      {/* scroller */}
      <div className="no-scrollbar overflow-x-auto snap-x snap-mandatory scroll-px-5 md:scroll-px-8">
        <div className="flex gap-0 px-5 md:px-8 py-4">
          {order.map((idx, i) => (
            <ScrollItem key={`${PRODUCTS[idx].id}-${i}`} product={PRODUCTS[idx]} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function GridPage() {
  return (
    <div className="min-h-screen w-full relative" style={{ color: "#1a1a1a" }}>
      <style>{`
        @keyframes tvFlash {
          0%   { background: rgba(255,255,255,1); }
          25%  { background: rgba(255,255,255,0.9); }
          40%  { background: rgba(0,0,0,0.5); }
          55%  { background: rgba(255,255,255,0.3); }
          70%  { background: rgba(0,0,0,0.3); }
          100% { background: rgba(0,0,0,0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <PaperBackground />

      {/* ─── HEADER ─── */}
      <header className="relative z-10 px-5 md:px-8 pt-5 md:pt-7 pb-2 flex items-center justify-between">
        <Link href="/" className="text-[11px] md:text-[12px] uppercase tracking-wider text-black/60 hover:text-black">
          ← OLD SITE
        </Link>
        <h1 className="text-[20px] md:text-[26px] uppercase tracking-[0.06em] font-[800]" style={{ color: "#2a2218" }}>
          HOMESICK
        </h1>
        <span className="text-[11px] md:text-[12px] uppercase tracking-wider text-black/40">GRID</span>
      </header>

      {/* ─── TV BANNER (full width, 40vh) ─── */}
      <div className="relative z-10 mt-1">
        <MediaTV />
      </div>

      {/* ─── SIDE-SCROLL ROWS ─── */}
      <div className="relative z-10 mt-6 md:mt-8 flex flex-col gap-7 md:gap-9">
        {ROWS.map((r) => (
          <ScrollRow key={r.label} label={r.label} order={r.order} />
        ))}
      </div>

      {/* ─── FOOTER ─── */}
      <footer
        className="relative z-10 px-5 md:px-8 pt-8 pb-8 text-center text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "rgba(60,40,20,0.55)" }}
      >
        <div>© 2026 · HOMESICK</div>
        <div className="mt-1 opacity-70">SIX OBJECTS</div>
      </footer>
    </div>
  );
}
