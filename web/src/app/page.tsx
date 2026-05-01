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

const PRODUCTS = [
  {
    name: "PLEASE HOLD",
    image: IMG.atc,
    description:
      "This phone holds one message at a time. Play the game of telephone with friends! Messages save to a digital map so you can co-create funny stories.",
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
  "You cannot love what you cannot lose. You know this. You have always known this. But nothing broke for so long that you forgot. We track our sleep on the device that ruined it! Everything is efficient and nothing is yours and the distance between yourself and the world has never been wider.",
  "Our objects are irregular. You might hate one. Good. It wasn't for you. Seventy-two degrees is comfortable for you but it makes your friend get sweaty and quiet until their silence makes you lonely.",
  "Freed from the tyranny of multi-function, objects can look like themselves again. Your nerve endings know. Magic is the goal. Soon you will hold something alive and shy like a firefly.",
  "This is a story about what happens after everything works. Do you, like us, suspect that perfection might be the problem?",
];

const FOLLOW_CHANNELS = ["PHONE", "EMAIL", "INSTA", "TIKTOK"] as const;
type Channel = (typeof FOLLOW_CHANNELS)[number];

/** Softer 3-stop fade — black at bottom, 25% at midpoint, transparent at top.
 *  Used only on home + story to bridge the video into the black content box.
 *  translateZ(0) forces a GPU layer so it composites cleanly over the video
 *  layer (without it the video can paint a frame before the gradient is up). */
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

function Bullet({ on }: { on: boolean }) {
  return <span className="inline-block w-[1em]">{on ? "●" : "○"}</span>;
}

/** Shared content box used by catalog, story, follow.
 *  Two columns: bulleted list on the left, content on the right.
 *  Always renders ROWS rows so the box stays the same height across pages —
 *  pages with fewer items get invisible spacer rows below. */
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
  const [channel, setChannel] = useState<Channel>("PHONE");
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const homeVideoRef = useRef<HTMLVideoElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const followVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = false;
    a.play().catch(() => {
      a.muted = true;
      setMuted(true);
    });
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
  const isContact = channel === "PHONE" || channel === "EMAIL";

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex justify-center">
      <audio ref={audioRef} src="/assets/fretle$$.m4a" loop autoPlay preload="auto" />

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

            {/* HOME ── full-bleed sheep video, soft gradient bridging into black bar */}
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
              </div>
            </div>

            {/* CATALOG ── product image + content box, no gradient */}
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
              </div>
              <ContentBox
                items={PRODUCTS.map((p) => p.name)}
                activeIndex={selected}
                onSelect={setSelected}
              >
                <p className="leading-snug line-clamp-6 overflow-hidden text-white text-body normal-case">
                  {PRODUCTS[selected].description}
                </p>
              </ContentBox>
            </div>

            {/* STORY ── clouds video + soft gradient + paginated content box */}
            <div
              className="h-full shrink-0 flex flex-col bg-black"
              style={{ width: `${pct}%` }}
            >
              <div
                className="flex-1 relative overflow-y-scroll min-h-0 cursor-pointer"
                onClick={() => {
                  if (storyVideoRef.current) {
                    storyVideoRef.current.currentTime = 0;
                    storyVideoRef.current.play();
                  }
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  const direction = e.deltaY > 0 ? 1 : -1;
                  setStoryPage((p) =>
                    Math.max(0, Math.min(STORY_SENTENCES.length - 1, p + direction))
                  );
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
              </div>
              <ContentBox
                items={STORY_SENTENCES.map((_, i) =>
                  String(i + 1).padStart(2, "0"),
                )}
                activeIndex={storyPage}
                onSelect={setStoryPage}
              >
                <p
                  key={storyPage}
                  className="leading-snug text-white text-body normal-case"
                  style={{ animation: "slideInRight 0.3s ease-out" }}
                >
                  {STORY_SENTENCES[storyPage]}
                </p>
              </ContentBox>
            </div>

            {/* FOLLOW ── eagles video + soft gradient, content box with form */}
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
              </div>
              <ContentBox
                items={FOLLOW_CHANNELS}
                activeIndex={FOLLOW_CHANNELS.indexOf(channel)}
                onSelect={(i) => setChannel(FOLLOW_CHANNELS[i])}
              >
                {isContact ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        key={channel}
                        type={channel === "EMAIL" ? "email" : "tel"}
                        autoComplete={channel === "EMAIL" ? "email" : "tel"}
                        className="flex-1 border-b border-white/40 py-1 outline-none text-body bg-transparent text-white"
                      />
                      <button
                        aria-label="Submit"
                        className="text-white/80 text-body leading-none"
                      >
                        →
                      </button>
                    </div>
                    <p className="text-body text-white/70 normal-case leading-snug">
                      We make objects. We&apos;ll tell you when they&apos;re ready.
                    </p>
                  </div>
                ) : (
                  <p className="text-body text-white/70 normal-case leading-snug">
                    {channel === "INSTA" ? "@homesick" : "@homesick"}
                  </p>
                )}
              </ContentBox>
            </div>

          </div>
        </div>

        {/* ── Locked bottom bar — always on top ───────────────────── */}
        <div className="shrink-0 bg-black relative z-50">
          <BottomNav screen={screen} go={go} />
          <Homesick onClick={() => go("home")} />
        </div>

      </div>
    </div>
  );
}
