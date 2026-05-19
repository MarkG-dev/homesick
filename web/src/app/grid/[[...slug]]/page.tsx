"use client";
import { useState, useRef } from "react";
import Link from "next/link";

/* ───────────────────────────────────────────────────────────────────
   GRID — six little cards on warm paper, with a tiny TV up top.
   The TV starts off; click the power dot to flash it on. Three
   channels cycle through the field/sky/nest videos and the fretless
   song plays as soundtrack while the TV is alive.
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
  image: string;
  price: string;
  stock: string;
  color: string;
};

const PRODUCTS: Product[] = [
  { id: "please-hold",  name: "PLEASE HOLD",  image: IMG.atc,          price: "$89",  stock: "IN STOCK · 12 LEFT",     color: "#F4C430" },
  { id: "dreamcatcher", name: "DREAMCATCHER", image: IMG.dreamcatcher, price: "$129", stock: "IN STOCK · 47 LEFT",     color: "#2A3FA8" },
  { id: "wandr",        name: "WANDR",        image: IMG.wandr,        price: "$99",  stock: "LOW STOCK · 8 LEFT",     color: "#7B5BD9" },
  { id: "sigh",         name: "SIGH",         image: IMG.sigh,         price: "$69",  stock: "IN STOCK · 23 LEFT",     color: "#7BB7E0" },
  { id: "parrot",       name: "PARROT",       image: IMG.parrot,       price: "$149", stock: "PRE-ORDER · SHIPS APRIL", color: "#3CB878" },
  { id: "stonecharge",  name: "STONECHARGE",  image: IMG.stonecharge,  price: "$79",  stock: "IN STOCK · 31 LEFT",     color: "#E07A3C" },
];

const VIDEOS = [
  { id: "field", label: "FIELD", src: "/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4" },
  { id: "sky",   label: "SKY",   src: "/assets/freepik_steadfy-frame-just-the-clouds-moving-across-horizo_veo3_1_1080p_9-16_24fps_23601.mp4" },
  { id: "nest",  label: "NEST",  src: "/assets/freepik_the-two-baby-eagles-yap-their-beaks-then-the-mothe_veo3_1_1080p_9-16_24fps_23600.mp4" },
];

/* ─── paper background (warm cream + fuzzy fibers) ─── */
function PaperBackground() {
  return (
    <>
      {/* base cream tone, slight vignette */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #f3ead8 0%, #ebe0ca 55%, #d9cdb5 100%)",
        }}
      />
      {/* paper fiber noise — bigger, softer than CRT grain */}
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
      {/* large soft fuzz — gives it a slightly out-of-focus paper feel */}
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

/* ─── tiny CRT TV with power + 3 channel buttons ─── */
function MediaTV() {
  const [tvState, setTvState] = useState<"off" | "flashing" | "on">("off");
  const [channel, setChannel] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const powerOn = () => {
    setTvState("flashing");
    // play audio + video on the user gesture so autoplay policies are happy
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
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePower = () => {
    if (tvState === "off") powerOn();
    else powerOff();
  };

  const switchChannel = (i: number) => {
    if (tvState === "off") return;
    setChannel(i);
    // give the new <video> a moment to swap src, then play
    window.setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 30);
  };

  const isLive = tvState === "on" || tvState === "flashing";

  return (
    <div className="relative mx-auto w-[min(70vw,240px)]">
      {/* bezel */}
      <div
        className="relative rounded-[18px] p-[10px]"
        style={{
          background: "linear-gradient(180deg, #d8d2c4 0%, #b3ac9d 100%)",
          boxShadow:
            "inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1.5px 0 rgba(0,0,0,0.18), 0 6px 14px rgba(60,40,20,0.18)",
        }}
      >
        {/* screen */}
        <div
          className="relative aspect-square overflow-hidden rounded-[7px]"
          style={{
            background: "#0a0a0a",
            boxShadow: "inset 0 0 14px rgba(0,0,0,0.7)",
          }}
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
              style={{ objectPosition: "center 30%" }}
            >
              <source src={VIDEOS[channel].src} type="video/mp4" />
            </video>
          )}

          {/* off-state: black screen */}
          {tvState === "off" && (
            <div className="absolute inset-0" style={{ background: "#0a0a0a" }} />
          )}

          {/* flash-on overlay */}
          {tvState === "flashing" && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ animation: "tvFlash 0.38s steps(8) forwards" }}
            />
          )}

          {/* scanlines */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 2px)",
              mixBlendMode: "overlay",
              opacity: isLive ? 1 : 0,
            }}
          />

          {/* screen reflection sheen */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 82%, rgba(0,0,0,0.22) 100%)",
            }}
          />

          {/* channel label */}
          {isLive && (
            <div
              className="absolute left-2 top-2 text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5"
              style={{
                color: "#fff",
                background: "rgba(0,0,0,0.35)",
                textShadow: "0 1px 0 rgba(0,0,0,0.4)",
              }}
            >
              CH {channel + 1} · {VIDEOS[channel].label}
            </div>
          )}

          {/* tiny red record dot when on */}
          <div
            aria-hidden
            className="absolute right-2 top-2 w-[5px] h-[5px] rounded-full transition-opacity duration-300"
            style={{
              background: "#ff4d4d",
              boxShadow: isLive ? "0 0 6px #ff4d4d" : "none",
              opacity: isLive ? 1 : 0.25,
            }}
          />
        </div>

        {/* control row */}
        <div className="mt-2 flex items-center justify-between px-0.5">
          {/* channel buttons */}
          <div className="flex gap-1.5">
            {VIDEOS.map((v, i) => {
              const active = isLive && channel === i;
              return (
                <button
                  key={v.id}
                  onClick={() => switchChannel(i)}
                  aria-label={`Channel ${i + 1}`}
                  disabled={tvState === "off"}
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-[700] transition-all"
                  style={{
                    background: active ? "#fff" : "rgba(255,255,255,0.4)",
                    color: active ? "#1a1a1a" : "rgba(0,0,0,0.5)",
                    boxShadow: active
                      ? "inset 0 -1px 0 rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.4)"
                      : "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.15)",
                    cursor: tvState === "off" ? "not-allowed" : "pointer",
                    opacity: tvState === "off" ? 0.5 : 1,
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* power button */}
          <button
            onClick={togglePower}
            aria-label={tvState === "off" ? "Power on" : "Power off"}
            className="relative w-[20px] h-[20px] rounded-full flex items-center justify-center"
            style={{
              background: isLive
                ? "radial-gradient(circle at 35% 30%, #ff7a7a 0%, #c41818 60%, #800a0a 100%)"
                : "radial-gradient(circle at 35% 30%, #d4ccba 0%, #8a8475 80%)",
              boxShadow: isLive
                ? "0 0 8px rgba(255,60,60,0.6), inset 0 -1px 0 rgba(0,0,0,0.3)"
                : "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)",
            }}
          >
            <span
              aria-hidden
              className="block w-[6px] h-[6px] rounded-full"
              style={{
                background: isLive ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.3)",
              }}
            />
          </button>
        </div>
      </div>
      {/* base/feet */}
      <div className="mx-auto mt-1 w-[50%] h-[4px] bg-[#a39c8c] rounded-b-md" />

      {/* audio element — only plays when the TV is on */}
      <audio ref={audioRef} src="/assets/fretle$$.m4a" loop preload="auto" />
    </div>
  );
}

/* ─── product card ─── */
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      {/* small product image at top */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        {/* soft color halo on hover (desktop) */}
        <div
          aria-hidden
          className="absolute rounded-full md:opacity-0 md:group-hover:opacity-30 transition-opacity duration-500"
          style={{
            width: "78%",
            height: "78%",
            background: product.color,
            filter: "blur(18px)",
          }}
        />
        <img
          src={product.image}
          alt={product.name}
          className="relative max-w-[78%] max-h-[78%] object-contain transition-transform duration-300 md:group-hover:scale-[1.04]"
          style={{ filter: "drop-shadow(0 6px 10px rgba(80,60,30,0.18))" }}
        />
      </div>

      {/* name */}
      <div
        className="text-[12px] md:text-[14px] uppercase tracking-[0.06em] font-[700]"
        style={{ color: product.color, textShadow: "0 1px 0 rgba(255,255,255,0.45)" }}
      >
        {product.name}
      </div>

      {/* price + stock — mobile: always visible. desktop: revealed on hover. */}
      <div
        className="
          mt-1 flex flex-col items-center text-[10px] md:text-[11px] uppercase tracking-[0.08em]
          opacity-100 translate-y-0
          md:opacity-0 md:translate-y-1
          md:group-hover:opacity-100 md:group-hover:translate-y-0
          transition-all duration-300
        "
        style={{ color: "rgba(40,30,15,0.78)" }}
      >
        <div className="font-[700]">{product.price}</div>
        <div className="opacity-70">{product.stock}</div>
      </div>
    </div>
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
      `}</style>

      <PaperBackground />

      {/* ─── HEADER ─── */}
      <header className="relative z-10 px-5 md:px-8 pt-5 md:pt-7 pb-2 flex items-center justify-between">
        <Link href="/" className="text-[11px] md:text-[12px] uppercase tracking-wider text-black/60 hover:text-black">
          ← OLD SITE
        </Link>
        <h1
          className="text-[20px] md:text-[26px] uppercase tracking-[0.06em] font-[800]"
          style={{ color: "#2a2218" }}
        >
          HOMESICK
        </h1>
        <span className="text-[11px] md:text-[12px] uppercase tracking-wider text-black/40">
          GRID
        </span>
      </header>

      {/* subtle separator */}
      <div className="relative z-10 mx-5 md:mx-8 h-px" style={{ background: "rgba(60,40,20,0.18)" }} />

      {/* ─── MEDIA TV ─── */}
      <div className="relative z-10 pt-5 md:pt-7 pb-3 md:pb-5">
        <MediaTV />
      </div>

      {/* ─── CARDS ─── */}
      <div
        className="relative z-10 px-5 md:px-8 pb-8 grid grid-cols-3 gap-x-4 gap-y-6 md:gap-x-10 md:gap-y-10"
        style={{ maxWidth: 760, marginInline: "auto" }}
      >
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* ─── FOOTER ─── */}
      <footer
        className="relative z-10 px-5 md:px-8 pt-2 pb-8 text-center text-[10px] uppercase tracking-[0.2em]"
        style={{ color: "rgba(60,40,20,0.55)" }}
      >
        <div>© 2026 · HOMESICK</div>
        <div className="mt-1 opacity-70">SIX OBJECTS</div>
      </footer>
    </div>
  );
}
