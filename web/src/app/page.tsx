"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ─── Assets ────────────────────────────────────────────────────────────────
const SHEEP_VIDEO =
  "/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4";
const WANDERSTONE_VIDEO =
  "/magnific_turn-this-into-a-3d-rotating-product-video-black-b_seedance_480p_16-9_24fps_93030.mp4";

const OBJECTS = [
  {
    name: "WANDERSTONE",
    video: WANDERSTONE_VIDEO,
    image: null as string | null,
    description:
      "Counts every mile you've ever walked. Syncs to nothing. Keeps the number anyway.",
  },
  {
    name: "DREAMCATCHER",
    video: null as string | null,
    image: "/assets/freepik__make-the-rock-slightly-thinner-maybe-40-thinner-__23593%202.png",
    description:
      "Press this button in the dark to record your dreams. Receive them transcribed in the morning.",
  },
  {
    name: "SIGH",
    video: null as string | null,
    image: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
    description:
      "Breathwork guidance in light and vibration. A device to cure the disease of devices.",
  },
  {
    name: "TIN CAN",
    video: null as string | null,
    image: "/assets/magnifics_upscale-V3jRyWe7MMJjWWu6FHMo-image%208%202.png",
    description:
      "Holds one message. From one person. Play it when you're ready.",
  },
];

const STORY_SENTENCES = [
  "We struggled and struggled to make something beautiful and the world made it invisible, which is the worst thing a beautiful thing can become.",
  "You cannot love what you cannot lose. You cannot miss what you never touched. And the distance between yourself and the world has never been wider.",
  "Our objects are irregular. They do one thing. Their silence makes you lonely.",
  "Freed from the tyranny of multi-function, you will rediscover boredom, and through boredom, yourself. Soon you will hold something alive and shy like a firefly.",
  "This is a story about what happens after everything works. After the last update. After the final upgrade. When perfection might be the problem.",
] as const;

// stop: -1 = entry, 0-3 = objects, 4 = story, 5 = join
const MIN_STOP = -1;
const MAX_STOP = 5;

// [inactive, active]
const STOP_SHAPES = [
  ["○", "●"],
  ["○", "●"],
  ["○", "●"],
  ["○", "●"],
  ["□", "■"],
  ["△", "▲"],
] as [string, string][];

// ─── Components ────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
        opacity: 0.045,
        mixBlendMode: "overlay",
      }}
    />
  );
}

function SoftGradient() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
      style={{
        height: "40%",
        background:
          "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
        transform: "translateZ(0)",
      }}
    />
  );
}

// Darkens the bottom-left corner behind description text
function DescriptionVignette() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-10"
      style={{
        background:
          "radial-gradient(ellipse 50% 50% at 0% 100%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
      }}
    />
  );
}

function TypewriterText({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline",
            opacity: 0,
            animation: `wordIn 0.15s ease-out ${i * 0.03}s forwards`,
          }}
        >
          {word}{" "}
        </span>
      ))}
    </>
  );
}

function BottomBar({
  stop,
  onStop,
}: {
  stop: number;
  onStop: (s: number) => void;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      {/* Shape icons row */}
      <div className="flex items-center gap-[10px] px-4 pb-1 pt-2 pointer-events-auto">
        {STOP_SHAPES.map(([off, on], i) => (
          <button
            key={i}
            onClick={() => onStop(i)}
            className={`text-[11px] leading-none transition-colors duration-300 ${
              stop === i ? "text-white" : "text-white/25"
            }`}
          >
            {stop === i ? on : off}
          </button>
        ))}
      </div>

      {/* HOMESICK wordmark — full width SVG, click to return home */}
      <svg
        viewBox="0 0 100 6.5"
        className="w-[98vw] mx-auto block pointer-events-auto cursor-pointer"
        style={{
          transition: "opacity 0.8s ease",
          opacity: stop >= 0 ? 0.12 : 1,
        }}
        onClick={() => onStop(-1)}
        aria-label="HOMESICK — return to start"
      >
        <text
          x="0.3"
          y="5.8"
          textLength="99.4"
          lengthAdjust="spacingAndGlyphs"
          fontFamily="var(--font-pilat)"
          fontWeight="700"
          fontSize="5.6"
          fill="white"
        >
          HOMESICK
        </text>
      </svg>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [stop, setStop] = useState(-1);
  const [muted, setMuted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sheepVideoRef = useRef<HTMLVideoElement>(null);
  const wanderstoneVideoRef = useRef<HTMLVideoElement>(null);

  const stopRef = useRef(stop);
  const scrollCooldown = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => { stopRef.current = stop; }, [stop]);

  // Desktop scroll → navigate stops
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        scrollCooldown.current = false;
      }, 600);
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;
      const dir = e.deltaY > 0 ? 1 : -1;
      setStop(s => Math.max(MIN_STOP, Math.min(MAX_STOP, s + dir)));
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Autoplay videos on stop change
  useEffect(() => {
    if (stop === -1) {
      sheepVideoRef.current?.play().catch(() => {});
    } else if (stop === 0) {
      wanderstoneVideoRef.current?.play().catch(() => {});
    }
  }, [stop]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      const next = !m;
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next) audioRef.current.play().catch(() => {});
      }
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    const value = inputRef.current?.value?.trim();
    if (!value || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "EMAIL", value }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const isObject = stop >= 0 && stop <= 3;

  // Bottom bar height: icon row (~36px) + SVG (~6.37vw)
  const barBottom = "calc(6.37vw + 48px)";

  return (
    <div
      className="w-full h-full bg-black relative overflow-hidden"
      onTouchStart={e => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) {
          const dir = dx < 0 ? 1 : -1;
          setStop(s => Math.max(MIN_STOP, Math.min(MAX_STOP, s + dir)));
        }
      }}
    >
      <audio ref={audioRef} src="/assets/fretle$$.m4a" loop muted={muted} />

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-40 text-body uppercase text-white/40 hover:text-white/70 transition-colors"
      >
        ♪ {muted ? "OFF" : "ON"}
      </button>

      {/* ── Entry: sheep ──────────────────────────────────────────────── */}
      {stop === -1 && (
        <div className="absolute inset-0">
          <video
            ref={sheepVideoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={e => e.currentTarget.pause()}
            className="absolute inset-0 w-full h-full object-cover bg-black"
            style={{ objectPosition: "center 20%" }}
          >
            <source src={SHEEP_VIDEO} type="video/mp4" />
          </video>
          <SoftGradient />
          <GrainOverlay />
        </div>
      )}

      {/* ── Objects ───────────────────────────────────────────────────── */}
      {isObject && (
        <div key={stop} className="absolute inset-0">
          {OBJECTS[stop].video ? (
            <video
              ref={wanderstoneVideoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              loop
              className="absolute inset-0 w-full h-full object-cover bg-black"
            >
              <source src={OBJECTS[stop].video!} type="video/mp4" />
            </video>
          ) : (
            <img
              src={OBJECTS[stop].image!}
              alt={OBJECTS[stop].name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <GrainOverlay />
          <DescriptionVignette />
        </div>
      )}

      {/* ── Story ─────────────────────────────────────────────────────── */}
      {stop === 4 && (
        <div
          className="absolute inset-0 flex flex-col justify-center overflow-y-auto"
          style={{
            paddingLeft: "4vw",
            paddingRight: "20vw",
            paddingBottom: barBottom,
            paddingTop: "4vw",
          }}
        >
          <div className="flex flex-col gap-10">
            {STORY_SENTENCES.map((s, i) => (
              <p
                key={i}
                className="text-white/90 leading-snug"
                style={{ fontSize: "clamp(18px, 2.6vw, 44px)" }}
              >
                {s}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Join ──────────────────────────────────────────────────────── */}
      {stop === 5 && (
        <div
          className="absolute inset-0 flex flex-col justify-center"
          style={{ paddingLeft: "4vw", paddingBottom: barBottom }}
        >
          {submitted ? (
            <p className="text-white/50 text-body normal-case">
              we'll find you.
            </p>
          ) : (
            <>
              <p className="text-white/40 text-body normal-case mb-5">
                leave your email and we'll find you.
              </p>
              <input
                ref={inputRef}
                type="email"
                placeholder="your@email.com"
                className="bg-transparent border-b border-white/30 text-white text-body normal-case pb-1 outline-none placeholder:text-white/20 focus:border-white/60 transition-colors"
                style={{ width: "22vw", minWidth: "200px" }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </>
          )}
        </div>
      )}

      {/* ── Object label + description ────────────────────────────────── */}
      {isObject && (
        <>
          <div
            className="fixed top-4 z-20 text-[11px] uppercase tracking-widest text-white/50"
            style={{ left: "4vw" }}
          >
            {OBJECTS[stop].name}
          </div>
          <div
            className="fixed z-20 text-body normal-case text-white/80 leading-snug"
            style={{
              bottom: barBottom,
              left: "4vw",
              width: "22vw",
              minWidth: "180px",
            }}
          >
            <p key={stop}>
              <TypewriterText text={OBJECTS[stop].description} />
            </p>
          </div>
        </>
      )}

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <BottomBar stop={stop} onStop={setStop} />
    </div>
  );
}
