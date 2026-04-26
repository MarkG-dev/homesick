"use client";
import { useState, useRef, useEffect, useCallback } from "react";

type Screen = "home" | "catalog" | "story";
const SCREENS: Screen[] = ["home", "catalog", "story"];

const IMG = {
  atc: "/assets/magnifics_upscale-V3jRyWe7MMJjWWu6FHMo-image%208%202.png",
  wandr: "/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png",
  sigh: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
  parrot: "/assets/freepik__make-the-bird-parrot-colors-parakeet-colors-and-ma__23599%202.png",
  stonecharge: "/assets/freepik__small-apple-mag-safe-wire-coming-out-of-the-right-__23598%202.png",
  dreamcatcher: "/assets/freepik__make-the-rock-slightly-thinner-maybe-40-thinner-__23593%202.png",
};

const PRODUCTS = [
  {
    name: "ATC 1.0",
    image: IMG.atc,
    description:
      "This tin can holds one message at a time, in one place. Modern phones are distracting and too accessible. Constant access kills spontaneity and presence. This device brings both back.",
  },
  {
    name: "WANDR",
    image: IMG.wandr,
    description:
      "A stone that counts every mile you've ever walked. Not steps today — miles, total, forever. Watch the number build and suddenly a Tuesday afternoon walk matters.",
  },
  {
    name: "SIGH",
    image: IMG.sigh,
    description:
      "Breathwork guidance shrunk down to light and vibration in your pocket. It's a little ridiculous that the best way to calm down involves pulling out the same device that stresses us out!",
  },
  {
    name: "PARROT",
    image: IMG.parrot,
    description:
      "A robot parrot for your desk. It listens. It repeats things. It has opinions about your vocabulary. Wouldn't it be fun if we all had a parrot? I've always wanted one...",
  },
  {
    name: "STONECHARGE",
    image: IMG.stonecharge,
    description:
      "Safe underneath a beautiful rock that hides your phone. You want it back? Lift the stone. Deliberately. Elevate your space.",
  },
  {
    name: "DREAMCATCHER",
    image: IMG.dreamcatcher,
    description:
      "Press this button in the dark to record your dreams. Receive them transcribed in the morning. If you're feeling brave, we'll analyze them too.",
  },
];

const STORY_SENTENCES = [
  "We struggled and struggled to make everything work!",
  "Then we made it beautiful.",
  "We perfected it until it was in every blue jean pocket — so polished and universal it became invisible.",
  "Which is the worst thing a beautiful thing can become.",
  "You cannot love what you cannot lose.",
  "Do you, like us, suspect that perfection might be the problem?",
];

/** Black at bottom → transparent going up — fades video into nav */
function BottomGradient() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
      style={{
        height: "40%",
        background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
      }}
    />
  );
}

function Bullet({ on }: { on: boolean }) {
  return <span className="inline-block w-[1em]">{on ? "●" : "○"}</span>;
}

function BottomNav({
  screen,
  go,
  followOpen,
  onFollow,
}: {
  screen: Screen;
  go: (s: Screen) => void;
  followOpen: boolean;
  onFollow: () => void;
}) {
  return (
    <nav className="shrink-0 flex items-center gap-4 px-3 pt-3 pb-2 text-body uppercase">
      {(
        [
          ["catalog", "MAGICAL OBJECTS"],
          ["story", "STORY"],
        ] as const
      ).map(([target, label]) => {
        const active = screen === target;
        return (
          <button
            key={target}
            onClick={() => go(target)}
            className={`flex items-center gap-[3px] whitespace-nowrap ${
              active ? "text-white" : "text-white/40"
            }`}
          >
            <Bullet on={active} />
            {label}
          </button>
        );
      })}
      <button
        onClick={onFollow}
        className={`flex items-center gap-[3px] whitespace-nowrap ${
          followOpen ? "text-white" : "text-white/40"
        }`}
      >
        <Bullet on={followOpen} />
        FOLLOW
      </button>
    </nav>
  );
}

function Homesick({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),8px)] bg-black cursor-pointer"
    >
      <img
        src="/assets/HOMESICK.png"
        alt="HOMESICK"
        className="w-full block"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black rounded-t-[20px] px-6 pt-5 pb-6 text-white">
      {children}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState(0);
  const [storyPage, setStoryPage] = useState(0);
  const [followOpen, setFollowOpen] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  const [muted, setMuted] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [bottomH, setBottomH] = useState(96);

  useEffect(() => {
    const update = () => {
      if (bottomBarRef.current) setBottomH(bottomBarRef.current.offsetHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next) audioRef.current.play().catch(() => {});
      }
      return next;
    });
  }, []);

  const go = (s: Screen) => setScreen(s);
  const idx = SCREENS.indexOf(screen);
  const pct = 100 / SCREENS.length;
  const total = STORY_SENTENCES.length;

  // Slide up from just above the nav; hidden state pushes element below container bottom
  const overlayTransform = (visible: boolean) =>
    visible ? "translateY(0)" : `translateY(calc(100% + ${bottomH}px))`;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex justify-center">
      {/* Background audio — starts muted; user unmutes via button */}
      <audio ref={audioRef} src="/assets/fretle$$.m4a" loop muted preload="auto" />

      <div className="w-full max-w-[440px] h-full flex flex-col relative overflow-hidden">

        {/* Mute / unmute button ── top-right corner */}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute top-3 right-3 z-50 text-white/60 text-body uppercase leading-none"
        >
          {muted ? "♪ off" : "♪ on"}
        </button>

        {/* ── Sliding content area ────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{
              width: `${SCREENS.length * 100}%`,
              transform: `translateX(-${idx * pct}%)`,
            }}
          >

            {/* HOME */}
            <div className="h-full relative shrink-0" style={{ width: `${pct}%` }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 20%" }}
              >
                <source
                  src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4"
                  type="video/mp4"
                />
              </video>
              <BottomGradient />
            </div>

            {/* CATALOG */}
            <div
              className="h-full shrink-0 flex flex-col bg-black"
              style={{ width: `${pct}%` }}
            >
              <div className="flex-1 relative overflow-hidden min-h-0">
                <img
                  src={PRODUCTS[selected].image}
                  alt={PRODUCTS[selected].name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <BottomGradient />
              </div>
              <div className="shrink-0 grid grid-cols-[auto_1fr] gap-x-4 px-3 pt-3 pb-2 text-body uppercase">
                <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                  {PRODUCTS.map((p, i) => {
                    const on = i === selected;
                    return (
                      <li key={p.name}>
                        <button
                          onClick={() => setSelected(i)}
                          className={`flex items-center gap-[3px] text-left ${
                            on ? "text-white" : "text-white/40"
                          }`}
                        >
                          <Bullet on={on} />
                          {p.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="leading-snug line-clamp-6 overflow-hidden text-white">
                  {PRODUCTS[selected].description}
                </p>
              </div>
            </div>

            {/* STORY ── full-bleed clouds video only; card is an overlay */}
            <div
              className="h-full shrink-0 relative bg-black"
              style={{ width: `${pct}%` }}
            >
              <video
                autoPlay
                muted
                playsInline
                onEnded={(e) => e.currentTarget.pause()}
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source
                  src="/assets/freepik_steadfy-frame-just-the-clouds-moving-across-horizo_veo3_1_1080p_9-16_24fps_23601.mp4"
                  type="video/mp4"
                />
              </video>
            </div>

          </div>
        </div>

        {/* ── Backdrop (dims content when follow is open) ──────────── */}
        <div
          className={`absolute inset-0 z-20 bg-black/60 transition-opacity duration-500 ${
            followOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setFollowOpen(false)}
        />

        {/* ── Story card overlay ───────────────────────────────────── */}
        <div
          className="absolute inset-x-0 z-30 transition-transform duration-500 ease-out"
          style={{ bottom: bottomH, transform: overlayTransform(screen === "story") }}
        >
          <Card>
            <div className="grid grid-cols-[1fr_auto] gap-x-5 items-center">
              <div className="min-w-0">
                <p className="text-body text-white/40 uppercase mb-4">
                  ○ {String(storyPage + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </p>
                <p
                  key={storyPage}
                  className="text-display leading-snug"
                  style={{ animation: "slideInRight 0.3s ease-out" }}
                >
                  {STORY_SENTENCES[storyPage]}
                </p>
              </div>
              <div className="flex flex-col gap-4 shrink-0">
                <button
                  onClick={() => setStoryPage((p) => Math.max(p - 1, 0))}
                  className={`text-body leading-none ${
                    storyPage === 0 ? "text-white/20 pointer-events-none" : "text-white/60"
                  }`}
                >
                  ↑
                </button>
                <button
                  onClick={() => setStoryPage((p) => Math.min(p + 1, total - 1))}
                  className={`text-body leading-none ${
                    storyPage === total - 1
                      ? "text-white/20 pointer-events-none"
                      : "text-white/60"
                  }`}
                >
                  ↓
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Follow overlay ───────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 z-40 transition-transform duration-500 ease-out"
          style={{ bottom: bottomH, transform: overlayTransform(followOpen) }}
        >
          <Card>
            <div className="flex justify-between items-start mb-5">
              <p className="text-body text-white/60 italic leading-snug max-w-[75%]">
                We make objects. We&apos;ll tell you when they&apos;re ready.
              </p>
              <button
                onClick={() => setFollowOpen(false)}
                className="text-white/40 text-body"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-body text-white/40 uppercase mb-1">
                {useEmail ? "EMAIL" : "PHONE"}
              </label>
              <input
                key={useEmail ? "email" : "phone"}
                type={useEmail ? "email" : "tel"}
                autoComplete={useEmail ? "email" : "tel"}
                className="w-full border-b border-white/20 py-1 outline-none text-body bg-transparent"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setUseEmail((v) => !v)}
                className="flex items-center gap-[3px] text-body text-white/40 uppercase"
              >
                <Bullet on={useEmail} />
                OR {useEmail ? "PHONE" : "EMAIL"}
              </button>
              <button className="text-body uppercase font-medium underline underline-offset-2">
                SUBMIT →
              </button>
            </div>
          </Card>
        </div>

        {/* ── Locked bottom bar — always on top ───────────────────── */}
        <div ref={bottomBarRef} className="shrink-0 bg-black relative z-50">
          <BottomNav
            screen={screen}
            go={go}
            followOpen={followOpen}
            onFollow={() => setFollowOpen(true)}
          />
          <Homesick onClick={() => go("home")} />
        </div>

      </div>
    </div>
  );
}
