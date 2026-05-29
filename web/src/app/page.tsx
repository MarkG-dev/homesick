"use client";
import { useState, useRef, useEffect, useCallback } from "react";

type Screen = "home" | "catalog" | "story" | "follow";
const SCREENS: Screen[] = ["home", "catalog", "story", "follow"];

const IMG = {
  atc: "/assets/magnifics_upscale-V3jRyWe7MMJjWWu6FHMo-image%208%202.png",
  wandr: "/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png",
  sigh: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
  parrot: "/assets/freepik__make-the-bird-parrot-colors-parakeet-colors-and-ma__23599%202.png",
  stonecharge: "/assets/freepik__small-apple-mag-safe-wire-coming-out-of-the-right-__23598%202.png",
  dreamcatcher: "/assets/freepik__make-the-rock-slightly-thinner-maybe-40-thinner-__23593%202.png",
};

// Every video on the site — warmed up behind the landing screen
const VIDEOS = [
  "/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4",
  "/assets/freepik_steadfy-frame-just-the-clouds-moving-across-horizo_veo3_1_1080p_9-16_24fps_23601.mp4",
  "/assets/freepik_the-two-baby-eagles-yap-their-beaks-then-the-mothe_veo3_1_1080p_9-16_24fps_23600.mp4",
];

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
  "We struggled and struggled to make everything work! Then we made it beautiful. Then we perfected it until it was in every blue jean pocket, so polished and universal it became invisible, which is the worst thing a beautiful thing can become.",
  "You cannot love what you cannot lose. But nothing broke for so long that you forgot. We track our sleep on the device that ruined it! Everything is efficient and nothing is yours and the distance between yourself and the world has never been wider.",
  "Our objects are irregular. You might hate one. Good. It wasn't for you. Seventy-two degrees is comfortable for you but it makes your friend get sweaty and quiet until their silence makes you lonely.",
  "Freed from the tyranny of multi-function, objects can look like themselves again. Your nerve endings know. Magic is the goal. Soon you will hold something alive and shy like a firefly.",
  "This is a story about what happens after everything works. Do you, like us, suspect that perfection might be the problem?",
];

const STORY_TITLES = [
  "MADE INVISIBLE",
  "WHAT YOU LOSE",
  "NOT FOR YOU",
  "ALIVE AND SHY",
  "AFTER IT WORKS",
] as const;


const SUN = "/assets/freepik_sun-logo-out-of-cardboardbrbrpaper-cutout-diorama-with-layered-cardstock-construction-visible-paper-fiber-texture-and-soft-dimensional-shadows-cast-between-each-layer-handpainted-matte-go_0001%201.png";

function SunSpinner() {
  return <img src={SUN} alt="" aria-hidden className="w-[1em] h-[1em] inline-block" style={{ animation: "spin 1s linear infinite" }} />;
}

function SoftGradient() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
      style={{
        height: "55%",
        background:
          "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 100%)",
        transform: "translateZ(0)",
        willChange: "opacity",
      }}
    />
  );
}

function SideGradient() {
  return (
    <div
      aria-hidden
      className="absolute inset-y-0 left-0 pointer-events-none z-10"
      style={{
        width: "25%",
        background: "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
        transform: "translateZ(0)",
      }}
    />
  );
}

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

function Bullet({ on }: { on: boolean }) {
  return <span className="inline-block w-[1em]">{on ? "●" : "○"}</span>;
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

const ROWS = 6;

function ContentBox({
  items,
  activeIndex,
  onSelect,
  children,
}: {
  items: readonly string[];
  activeIndex: number;
  onSelect?: (i: number) => void;
  children: React.ReactNode;
}) {
  const interactive = !!onSelect;
  return (
    <div className="shrink-0 grid grid-cols-[auto_1fr] gap-x-4 px-3 pt-3 pb-2 text-body uppercase bg-black">
      <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
        {Array.from({ length: ROWS }).map((_, i) => {
          const label = items[i];
          if (!label) {
            return (
              <li key={`spacer-${i}`} aria-hidden className="invisible">
                <span className="flex items-center gap-[3px]">
                  <Bullet on={false} />
                  &nbsp;
                </span>
              </li>
            );
          }
          const on = i === activeIndex;
          return (
            <li key={label}>
              {interactive ? (
                <button
                  onClick={() => onSelect!(i)}
                  className={`flex items-center gap-[3px] text-left ${
                    on ? "text-white" : "text-white/40"
                  }`}
                >
                  <Bullet on={on} />
                  {label}
                </button>
              ) : (
                <span
                  className={`flex items-center gap-[3px] ${
                    on ? "text-white" : "text-white/40"
                  }`}
                >
                  <Bullet on={on} />
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="min-w-0 normal-case">{children}</div>
    </div>
  );
}

function BottomNav({
  screen,
  go,
}: {
  screen: Screen;
  go: (s: Screen) => void;
}) {
  return (
    <nav className="shrink-0 flex items-center gap-4 px-3 pt-3 pb-2 text-body uppercase">
      {(
        [
          ["catalog", "MAGICAL OBJECTS"],
          ["story", "STORY"],
          ["follow", "FOLLOW"],
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

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState(0);
  const [storyPage, setStoryPage] = useState(0);
const [followMode, setFollowMode] = useState<"subscribe" | "contact">("subscribe");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [muted, setMuted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [entered, setEntered] = useState(false);
  const [preloaderGone, setPreloaderGone] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const homeVideoRef = useRef<HTMLVideoElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const followVideoRef = useRef<HTMLVideoElement>(null);

  // Mobile swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Desktop scroll tracking — refs shadow state so the wheel handler stays stable
  const screenRef = useRef<Screen>("home");
  const selectedRef = useRef(0);
  const storyPageRef = useRef(0);
  const scrollCooldown = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteredRef = useRef(false);

  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { storyPageRef.current = storyPage; }, [storyPage]);
  useEffect(() => { enteredRef.current = entered; }, [entered]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const audioStarted = useRef(false);
  const startAudio = useCallback(() => {
    if (audioStarted.current) return;
    const a = audioRef.current;
    if (!a) return;
    audioStarted.current = true;
    a.play().catch(() => {});
  }, []);

  useEffect(() => {
    const refByScreen = {
      home: homeVideoRef,
      story: storyVideoRef,
      follow: followVideoRef,
    } as const;
    const ref = (refByScreen as Record<string, typeof homeVideoRef | undefined>)[screen];
    const el = ref?.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }, [screen]);

  // Desktop wheel → linear scroll through home → products → story → follow
  useEffect(() => {
    if (!isDesktop) return;
    const getIdx = () => {
      if (screenRef.current === "home")    return 0;
      if (screenRef.current === "catalog") return 1 + selectedRef.current;
      if (screenRef.current === "story")   return 7 + storyPageRef.current;
      return 12;
    };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!enteredRef.current) return; // landing screen still up
      // Extend unlock timer on every event — only unlocks after scroll truly stops
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => { scrollCooldown.current = false; }, 600);
      // Navigate only on leading edge of each gesture cluster
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;
      startAudio();
      const next = Math.max(0, Math.min(12, getIdx() + (e.deltaY > 0 ? 1 : -1)));
      if (next === 0)       { setScreen("home"); }
      else if (next <= 6)   { setScreen("catalog"); setSelected(next - 1); }
      else if (next <= 11)  { setScreen("story");   setStoryPage(next - 7); }
      else                  { setScreen("follow"); }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isDesktop]);

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

  const go = (s: Screen) => { startAudio(); setScreen(s); };

  // Leave the landing screen: unlock audio, restart the home video, fade out
  const enter = () => {
    startAudio();
    if (homeVideoRef.current) {
      homeVideoRef.current.currentTime = 0;
      homeVideoRef.current.play().catch(() => {});
    }
    setEntered(true);
    setTimeout(() => setPreloaderGone(true), 600);
  };

  const idx = SCREENS.indexOf(screen);
  const pct = 100 / SCREENS.length;
  const isCatalogOrHome = screen === "home" || screen === "catalog";

  const handleSubmit = async () => {
    const value = inputRef.current?.value?.trim();
    if (!value || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: followMode,
          value,
          message: messageRef.current?.value?.trim(),
        }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const FOLLOW_MODES = ["FOLLOW ALONG", "REACH OUT"] as const;

  const followContent = submitted ? (
    <p className="text-body text-white/70 normal-case leading-snug">
      {followMode === "subscribe"
        ? "Thanks so much — confirm your inbox."
        : "Sent. We'll write back."}
    </p>
  ) : followMode === "subscribe" ? (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="email"
          autoComplete="email"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 border-b border-white/40 py-1 outline-none text-body bg-transparent text-white"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          aria-label="Submit"
          className="text-white/80 text-body leading-none disabled:opacity-40"
        >
          {submitting ? <SunSpinner /> : "→"}
        </button>
      </div>
      <p className="text-body text-white/70 normal-case leading-snug">
        We make objects. We&apos;ll tell you when they&apos;re ready.
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="email"
        autoComplete="email"
        placeholder="your email"
        className="border-b border-white/40 py-1 outline-none text-body bg-transparent text-white placeholder:text-white/30"
      />
      <div className="flex items-start gap-2 mt-1">
        <textarea
          ref={messageRef}
          rows={3}
          placeholder="your message"
          className="flex-1 border-b border-white/40 py-1 outline-none text-body bg-transparent text-white placeholder:text-white/30 resize-none leading-snug"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          aria-label="Submit"
          className="text-white/80 text-body leading-none disabled:opacity-40 mt-1"
        >
          {submitting ? <SunSpinner /> : "→"}
        </button>
      </div>
    </div>
  );

  const followForm = (
    <ContentBox
      items={FOLLOW_MODES}
      activeIndex={followMode === "subscribe" ? 0 : 1}
      onSelect={(i) => { setFollowMode(i === 0 ? "subscribe" : "contact"); setSubmitted(false); }}
    >
      {followContent}
    </ContentBox>
  );

  const followFormInline = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5 text-body uppercase">
        {FOLLOW_MODES.map((label, i) => {
          const active = followMode === (i === 0 ? "subscribe" : "contact");
          return (
            <button
              key={label}
              onClick={() => { setFollowMode(i === 0 ? "subscribe" : "contact"); setSubmitted(false); }}
              className={`flex items-center gap-[3px] ${active ? "text-white" : "text-white/40"}`}
            >
              <Bullet on={active} />{label}
            </button>
          );
        })}
      </div>
      {followContent}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex justify-center">
      <audio ref={audioRef} src="/assets/fretle$$.m4a" loop preload="auto" />

      {/* Mute button — positioned relative to the fixed viewport */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute top-3 right-3 z-50 text-white/60 text-body uppercase leading-none"
      >
        {muted ? "♪ off" : "♪ on"}
      </button>

      {/* ── MOBILE layout (< 768px) ──────────────────────────────── */}
      {!isDesktop && (
        <div className="w-full max-w-[440px] h-full flex flex-col relative overflow-hidden">

          {/* Sliding content area — touch handlers here for swipe nav */}
          <div
            className="flex-1 relative overflow-hidden min-h-0"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }}
            onTouchEnd={(e) => {
              startAudio();
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              const dy = e.changedTouches[0].clientY - touchStartY.current;
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                const dir = dx < 0 ? 1 : -1;
                const cur = SCREENS.indexOf(screen);
                go(SCREENS[Math.max(0, Math.min(SCREENS.length - 1, cur + dir))]);
              } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) {
                const dir = dy < 0 ? 1 : -1;
                if (screen === "catalog")
                  setSelected((s) => Math.max(0, Math.min(PRODUCTS.length - 1, s + dir)));
                else if (screen === "story")
                  setStoryPage((p) => Math.max(0, Math.min(STORY_SENTENCES.length - 1, p + dir)));
                else if (screen === "follow") {
                  const modes: Array<"subscribe" | "contact"> = ["subscribe", "contact"];
                  setFollowMode((m) => modes[Math.max(0, Math.min(modes.length - 1, modes.indexOf(m) + dir))]);
                  setSubmitted(false);
                }
              }
            }}
          >
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{
                width: `${SCREENS.length * 100}%`,
                transform: `translateX(-${idx * pct}%)`,
              }}
            >

              {/* HOME — full-bleed sheep video */}
              <div
                className="h-full shrink-0 flex flex-col bg-black"
                style={{ width: `${pct}%` }}
              >
                <div
                  className="flex-1 relative overflow-hidden min-h-0 cursor-pointer"
                  onClick={() => {
                    if (homeVideoRef.current) {
                      homeVideoRef.current.currentTime = 0;
                      homeVideoRef.current.play();
                    }
                  }}
                >
                  <video
                    ref={homeVideoRef}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={(e) => e.currentTarget.pause()}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                    style={{ objectPosition: "center 20%" }}
                  >
                    <source
                      src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <SoftGradient />
                  <GrainOverlay />
                </div>
              </div>

              {/* CATALOG — product image + content box */}
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
                  <GrainOverlay />
                </div>
                <ContentBox
                  items={PRODUCTS.map((p) => p.name)}
                  activeIndex={selected}
                  onSelect={setSelected}
                >
                  <p key={selected} className="leading-snug line-clamp-6 overflow-hidden text-white text-body normal-case">
                    <TypewriterText text={PRODUCTS[selected].description} />
                  </p>
                </ContentBox>
              </div>

              {/* STORY — clouds video + paginated content box */}
              <div
                className="h-full shrink-0 flex flex-col bg-black"
                style={{ width: `${pct}%` }}
              >
                <div
                  className="flex-1 relative overflow-hidden min-h-0 cursor-pointer"
                  onClick={() => {
                    if (storyVideoRef.current) {
                      storyVideoRef.current.currentTime = 0;
                      storyVideoRef.current.play();
                    }
                  }}
                >
                  <video
                    ref={storyVideoRef}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={(e) => e.currentTarget.pause()}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                  >
                    <source
                      src="/assets/freepik_steadfy-frame-just-the-clouds-moving-across-horizo_veo3_1_1080p_9-16_24fps_23601.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <SoftGradient />
                  <GrainOverlay />
                </div>
                <ContentBox
                  items={STORY_TITLES}
                  activeIndex={storyPage}
                  onSelect={setStoryPage}
                >
                  <p key={storyPage} className="leading-snug text-white text-body normal-case">
                    <TypewriterText text={STORY_SENTENCES[storyPage]} />
                  </p>
                </ContentBox>
              </div>

              {/* FOLLOW — eagles video + form */}
              <div
                className="h-full shrink-0 flex flex-col bg-black"
                style={{ width: `${pct}%` }}
              >
                <div
                  className="flex-1 relative overflow-hidden min-h-0 cursor-pointer"
                  onClick={() => {
                    if (followVideoRef.current) {
                      followVideoRef.current.currentTime = 0;
                      followVideoRef.current.play();
                    }
                  }}
                >
                  <video
                    ref={followVideoRef}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={(e) => e.currentTarget.pause()}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                  >
                    <source
                      src="/assets/freepik_the-two-baby-eagles-yap-their-beaks-then-the-mothe_veo3_1_1080p_9-16_24fps_23600.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <SoftGradient />
                  <GrainOverlay />
                </div>
                {followForm}
              </div>

            </div>
          </div>

          {/* Locked bottom bar */}
          <div className="shrink-0 bg-black relative z-50">
            <BottomNav screen={screen} go={go} />
            <Homesick onClick={() => go("home")} />
          </div>

        </div>
      )}

      {/* ── DESKTOP layout (≥ 768px) ─────────────────────────────── */}
      {isDesktop && (
        <div className="w-full h-full flex">

          {/* LEFT RAIL */}
          <div className="w-[22vw] shrink-0 flex flex-col bg-black border-r border-white/10 p-4 overflow-hidden">

            {/* Logo → home (sheep video) */}
            <img
              src="/assets/HOMESICK.png"
              alt="HOMESICK"
              className="w-full block cursor-pointer mb-4"
              style={{ mixBlendMode: "screen" }}
              onClick={() => go("home")}
            />

            {/* Top nav: MAGICAL OBJECTS / STORY / FOLLOW */}
            <nav className="flex flex-col gap-0.5 mb-3 text-body uppercase shrink-0">
              <button
                onClick={() => go("catalog")}
                className={`flex items-center gap-[3px] text-left ${
                  screen === "catalog" ? "text-white" : "text-white/40"
                }`}
              >
                <Bullet on={screen === "catalog"} />
                MAGICAL OBJECTS
              </button>
              <button
                onClick={() => go("story")}
                className={`flex items-center gap-[3px] text-left ${
                  screen === "story" ? "text-white" : "text-white/40"
                }`}
              >
                <Bullet on={screen === "story"} />
                STORY
              </button>
              <button
                onClick={() => go("follow")}
                className={`flex items-center gap-[3px] text-left ${
                  screen === "follow" ? "text-white" : "text-white/40"
                }`}
              >
                <Bullet on={screen === "follow"} />
                FOLLOW
              </button>
            </nav>

            {/* Dynamic sub-list — hidden on home */}
            <ul className="list-none m-0 p-0 flex flex-col gap-0.5 text-body uppercase shrink-0 mt-4">
              {screen === "catalog"
                ? PRODUCTS.map((p, i) => {
                    const on = selected === i;
                    return (
                      <li key={p.name}>
                        <button
                          onClick={() => { setSelected(i); go("catalog"); }}
                          className={`flex items-center gap-[3px] text-left w-full ${
                            on ? "text-white" : "text-white/40"
                          }`}
                        >
                          <Bullet on={on} />
                          {p.name}
                        </button>
                      </li>
                    );
                  })
                : screen === "story"
                ? STORY_TITLES.map((title, i) => {
                    const on = storyPage === i;
                    return (
                      <li key={title}>
                        <button
                          onClick={() => setStoryPage(i)}
                          className={`flex items-center gap-[3px] ${
                            on ? "text-white" : "text-white/40"
                          }`}
                        >
                          <Bullet on={on} />
                          {title}
                        </button>
                      </li>
                    );
                  })
                : null}
            </ul>

            {/* Description / text area — hidden on home, fixed gap below sub-list */}
            {screen !== "home" && (
              <div className="mt-7 shrink-0 text-body normal-case text-white/70 leading-snug">
                {screen === "catalog" ? (
                  <p key={selected}>
                    <TypewriterText text={PRODUCTS[selected].description} />
                  </p>
                ) : screen === "story" ? (
                  <p key={storyPage}>
                    <TypewriterText text={STORY_SENTENCES[storyPage]} />
                  </p>
                ) : (
                  followFormInline
                )}
              </div>
            )}

            {/* Lower spacer */}
            <div className="flex-1" />

          </div>

          {/* RIGHT PANE */}
          <div className="flex-1 flex flex-col bg-black overflow-hidden">
            {screen === "home" ? (
              <div
                className="flex-1 relative overflow-hidden min-h-0 cursor-pointer"
                onClick={() => {
                  if (homeVideoRef.current) {
                    homeVideoRef.current.currentTime = 0;
                    homeVideoRef.current.play();
                  }
                }}
              >
                <video
                  ref={homeVideoRef}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={(e) => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                  style={{ objectPosition: "center 20%" }}
                >
                  <source
                    src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4"
                    type="video/mp4"
                  />
                </video>
                <SideGradient />
                <GrainOverlay />
              </div>
            ) : screen === "catalog" ? (
              <div className="flex-1 relative overflow-hidden">
                <img
                  src={PRODUCTS[selected].image}
                  alt={PRODUCTS[selected].name}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <SideGradient />
                <GrainOverlay />
              </div>
            ) : screen === "story" ? (
              <div
                key="story"
                className="flex-1 relative overflow-hidden min-h-0 cursor-pointer"
                onClick={() => {
                  if (storyVideoRef.current) {
                    storyVideoRef.current.currentTime = 0;
                    storyVideoRef.current.play();
                  }
                }}
              >
                <video
                  ref={storyVideoRef}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={(e) => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                >
                  <source
                    src="/assets/freepik_steadfy-frame-just-the-clouds-moving-across-horizo_veo3_1_1080p_9-16_24fps_23601.mp4"
                    type="video/mp4"
                  />
                </video>
                <SideGradient />
                <GrainOverlay />
              </div>
            ) : (
              <div
                key="follow"
                className="flex-1 relative overflow-hidden min-h-0 cursor-pointer"
                onClick={() => {
                  if (followVideoRef.current) {
                    followVideoRef.current.currentTime = 0;
                    followVideoRef.current.play();
                  }
                }}
              >
                <video
                  ref={followVideoRef}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={(e) => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                >
                  <source
                    src="/assets/freepik_the-two-baby-eagles-yap-their-beaks-then-the-mothe_veo3_1_1080p_9-16_24fps_23600.mp4"
                    type="video/mp4"
                  />
                </video>
                <SideGradient />
                <GrainOverlay />
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── LANDING / PRELOADER ──────────────────────────────────── */}
      {!preloaderGone && (
        <div
          onClick={enter}
          className={`fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center cursor-pointer transition-opacity duration-500 ${
            entered ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <img
            src="/maskbig.png"
            alt="Homesick"
            className="w-[45%] max-w-[220px] select-none"
            style={{ animation: "float 5s ease-in-out infinite" }}
            draggable={false}
          />
          <span
            className="mt-10 text-body uppercase tracking-[0.3em] text-white"
            style={{ animation: "softPulse 1.8s ease-in-out infinite" }}
          >
            Go Home
          </span>

          {/* Warm the browser cache while the visitor reads the mask */}
          <div aria-hidden className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
            {VIDEOS.map((src) => (
              <video key={src} src={src} preload="auto" muted playsInline />
            ))}
            {PRODUCTS.map((p) => (
              <img key={p.image} src={p.image} alt="" />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
