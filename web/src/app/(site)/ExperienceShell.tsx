"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PRODUCTS, STORY } from "./products";

// ─── Tiny UI helpers ────────────────────────────────────────────────────────

const SUN =
  "/assets/freepik_sun-logo-out-of-cardboardbrbrpaper-cutout-diorama-with-layered-cardstock-construction-visible-paper-fiber-texture-and-soft-dimensional-shadows-cast-between-each-layer-handpainted-matte-go_0001%201.png";

function SunSpinner() {
  return (
    <img
      src={SUN}
      alt=""
      aria-hidden
      className="w-[1em] h-[1em] inline-block"
      style={{ animation: "spin 1s linear infinite" }}
    />
  );
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

function TypewriterText({ text, animKey }: { text: string; animKey: string | number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={`${animKey}-${i}`}
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

// ─── Route helpers ──────────────────────────────────────────────────────────

// Linear wheel index: 0=home, 1-6=products, 7=story, 8=follow
function pathnameToIdx(p: string): number {
  if (p === "/") return 0;
  if (p.startsWith("/objects/")) {
    const slug = p.split("/")[2];
    const i = PRODUCTS.findIndex((pr) => pr.slug === slug);
    return 1 + (i >= 0 ? i : 0);
  }
  if (p === "/objects") return 1;
  if (p === "/story") return 7;
  return 8;
}

function idxToPath(idx: number): string {
  if (idx === 0) return "/";
  if (idx >= 1 && idx <= 6) return `/objects/${PRODUCTS[idx - 1].slug}`;
  if (idx === 7) return "/story";
  return "/follow";
}

// ─── Shell ──────────────────────────────────────────────────────────────────

export default function ExperienceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Derive display state from URL
  const isHome = pathname === "/";
  const isCatalog = pathname.startsWith("/objects");
  const isStory = pathname === "/story";
  const isFollow = pathname === "/follow";

  const currentProduct = isCatalog
    ? (PRODUCTS.find((p) => `/objects/${p.slug}` === pathname) ?? PRODUCTS[0])
    : PRODUCTS[0];
  const selectedIdx = PRODUCTS.findIndex((p) => p === currentProduct);

  // Preloader: show only on "/" when not yet entered; skip entirely on deep links
  const [entered, setEntered] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return pathname !== "/" || !!sessionStorage.getItem("hs-entered");
  });
  const [preloaderGone, setPreloaderGone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return pathname !== "/" || !!sessionStorage.getItem("hs-entered");
  });

  const [followMode, setFollowMode] = useState<"subscribe" | "contact">("subscribe");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [muted, setMuted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sheepReady, setSheepReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const homeVideoRef = useRef<HTMLVideoElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const followVideoRef = useRef<HTMLVideoElement>(null);

  // Mobile swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Wheel throttle — refs to survive without re-creating the listener
  const scrollCooldown = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteredRef = useRef(entered);
  const pathnameRef = useRef(pathname);

  useEffect(() => { enteredRef.current = entered; }, [entered]);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

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

  // Restart the appropriate video when section changes
  useEffect(() => {
    if (isHome && homeVideoRef.current) {
      homeVideoRef.current.currentTime = 0;
      homeVideoRef.current.play().catch(() => {});
    } else if (isStory && storyVideoRef.current) {
      storyVideoRef.current.currentTime = 0;
      storyVideoRef.current.play().catch(() => {});
    } else if (isFollow && followVideoRef.current) {
      followVideoRef.current.currentTime = 0;
      followVideoRef.current.play().catch(() => {});
    }
  }, [pathname]);  // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = useCallback((delta: number) => {
    const next = Math.max(0, Math.min(8, pathnameToIdx(pathnameRef.current) + delta));
    const target = idxToPath(next);
    if (target !== pathnameRef.current) router.push(target);
  }, [router]);

  // Desktop wheel → linear scroll
  useEffect(() => {
    if (!isDesktop) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!enteredRef.current) return;
      if (Math.abs(e.deltaY) < 8) return;
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => { scrollCooldown.current = false; }, 450);
      startAudio();
      navigate(e.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isDesktop, navigate, startAudio]);

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

  const go = useCallback((path: string) => {
    startAudio();
    router.push(path);
  }, [router, startAudio]);

  const enter = () => {
    setEntered(true);
    startAudio();
    sessionStorage.setItem("hs-entered", "1");
    setTimeout(() => setPreloaderGone(true), 600);
  };

  // ── Follow form ──────────────────────────────────────────────────────────

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
      {followMode === "subscribe" ? "Thanks so much — confirm your inbox." : "Sent. We'll write back."}
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

  // ── Mobile content box (product list) ────────────────────────────────────

  const ROWS = 6;

  const mobileContentBox = isCatalog ? (
    <div className="shrink-0 grid grid-cols-[auto_1fr] gap-x-4 px-3 pt-3 pb-2 text-body uppercase bg-black">
      <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
        {Array.from({ length: ROWS }).map((_, i) => {
          const p = PRODUCTS[i];
          if (!p) return <li key={i} aria-hidden className="invisible"><span className="flex items-center gap-[3px]"><Bullet on={false} />&nbsp;</span></li>;
          const on = i === selectedIdx;
          return (
            <li key={p.slug}>
              <button
                onClick={() => go(`/objects/${p.slug}`)}
                className={`flex items-center gap-[3px] text-left ${on ? "text-white" : "text-white/40"}`}
              >
                <Bullet on={on} />{p.name}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="min-w-0 normal-case">
        <p key={currentProduct.slug} className="leading-snug line-clamp-6 overflow-hidden text-white text-body normal-case">
          <TypewriterText text={currentProduct.description} animKey={currentProduct.slug} />
        </p>
      </div>
    </div>
  ) : isStory ? (
    <div className="shrink-0 px-3 pt-3 pb-2 overflow-y-auto max-h-[45vh] flex flex-col gap-4 bg-black">
      {STORY.map((s) => (
        <div key={s.id}>
          <p className="text-body uppercase text-white/40 mb-1">{s.title}</p>
          <p className="text-body normal-case text-white/80 leading-snug">{s.text}</p>
        </div>
      ))}
    </div>
  ) : isFollow ? (
    <div className="shrink-0 px-3 pt-3 pb-2 bg-black">
      <div className="flex flex-col gap-0.5 text-body uppercase mb-2">
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
  ) : null;

  // ── Screens ───────────────────────────────────────────────────────────────

  const SCREEN_ORDER = ["home", "catalog", "story", "follow"] as const;
  type ScreenKey = typeof SCREEN_ORDER[number];
  const currentScreen: ScreenKey = isHome ? "home" : isCatalog ? "catalog" : isStory ? "story" : "follow";
  const screenIdx = SCREEN_ORDER.indexOf(currentScreen);
  const pct = 100 / SCREEN_ORDER.length;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex justify-center">
      {/* Persistent audio — never unmounts with the layout */}
      <audio ref={audioRef} src="/assets/fretle$$.m4a" loop preload="auto" />

      {/* Hidden media preloader */}
      <div aria-hidden className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
        <video
          src="/assets/hero-video.mp4"
          preload="auto"
          muted
          playsInline
          onCanPlayThrough={() => setSheepReady(true)}
        />
        {sheepReady && (
          <>
            <video src="/assets/story-video.mp4" preload="auto" muted playsInline />
            <video src="/assets/follow-video.mp4" preload="auto" muted playsInline />
            {PRODUCTS.map((p) => (
              <img key={p.slug} src={p.image} alt="" />
            ))}
          </>
        )}
      </div>

      {/* Mute button */}
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute top-3 right-3 z-50 text-white/60 text-body uppercase leading-none"
      >
        {muted ? "♪ off" : "♪ on"}
      </button>

      {/* ── MOBILE layout (< 768px) ─────────────────────────────── */}
      {entered && !isDesktop && (
        <div className="w-full max-w-[440px] h-full flex flex-col relative overflow-hidden">

          {/* Sliding content area */}
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
              const absDx = Math.abs(dx);
              const absDy = Math.abs(dy);
              if (absDx < 40 || absDy > absDx) return; // only horizontal swipe navigates
              navigate(dx > 0 ? 1 : -1);
            }}
          >
            {/* Film strip translates to show the current screen */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{
                width: `${SCREEN_ORDER.length * 100}%`,
                transform: `translateX(-${screenIdx * pct}%)`,
              }}
            >

              {/* HOME */}
              <div className="h-full shrink-0 flex flex-col bg-black" style={{ width: `${pct}%` }}>
                <div
                  className="flex-1 relative overflow-hidden min-h-0 cursor-pointer"
                  onClick={() => {
                    homeVideoRef.current?.play();
                  }}
                >
                  <video
                    ref={homeVideoRef}
                    src="/assets/hero-video.mp4"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={(e) => e.currentTarget.pause()}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                    style={{ objectPosition: "center 20%" }}
                  />
                  <SoftGradient />
                  <GrainOverlay />
                </div>
              </div>

              {/* CATALOG */}
              <div className="h-full shrink-0 flex flex-col bg-black" style={{ width: `${pct}%` }}>
                <div className="flex-1 relative overflow-hidden min-h-0">
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <GrainOverlay />
                </div>
                {mobileContentBox}
              </div>

              {/* STORY */}
              <div className="h-full shrink-0 flex flex-col bg-black" style={{ width: `${pct}%` }}>
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
                    src="/assets/story-video.mp4"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={(e) => e.currentTarget.pause()}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                  />
                  <SoftGradient />
                  <GrainOverlay />
                </div>
                {mobileContentBox}
              </div>

              {/* FOLLOW */}
              <div className="h-full shrink-0 flex flex-col bg-black" style={{ width: `${pct}%` }}>
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
                    src="/assets/follow-video.mp4"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={(e) => e.currentTarget.pause()}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                  />
                  <SoftGradient />
                  <GrainOverlay />
                </div>
                {mobileContentBox}
              </div>

            </div>
          </div>

          {/* Locked bottom bar */}
          <div className="shrink-0 bg-black relative z-50">
            <nav className="shrink-0 flex items-center gap-4 px-3 pt-3 pb-2 text-body uppercase">
              {([
                ["/objects/please-hold", "MAGICAL OBJECTS"],
                ["/story", "STORY"],
                ["/follow", "FOLLOW"],
              ] as const).map(([target, label]) => {
                const active = pathname.startsWith(target.split("/")[1] === "objects" ? "/objects" : target);
                return (
                  <button
                    key={target}
                    onClick={() => go(target)}
                    className={`flex items-center gap-[3px] whitespace-nowrap ${active ? "text-white" : "text-white/40"}`}
                  >
                    <Bullet on={active} />{label}
                  </button>
                );
              })}
            </nav>
            <div
              onClick={() => go("/")}
              className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),8px)] bg-black cursor-pointer"
            >
              <img
                src="/assets/HOMESICK.png"
                alt="HOMESICK"
                className="w-full block"
                style={{ mixBlendMode: "screen" }}
              />
            </div>
          </div>

        </div>
      )}

      {/* ── DESKTOP layout (≥ 768px) ─────────────────────────────── */}
      {entered && isDesktop && (
        <div className="w-full h-full flex">

          {/* LEFT RAIL */}
          <div className="w-[22vw] shrink-0 flex flex-col bg-black border-r border-white/10 p-4 overflow-hidden">

            <img
              src="/assets/HOMESICK.png"
              alt="HOMESICK"
              className="w-full block cursor-pointer mb-4"
              style={{ mixBlendMode: "screen" }}
              onClick={() => go("/")}
            />

            <nav className="flex flex-col gap-0.5 mb-3 text-body uppercase shrink-0">
              <button
                onClick={() => go("/objects/please-hold")}
                className={`flex items-center gap-[3px] text-left ${isCatalog ? "text-white" : "text-white/40"}`}
              >
                <Bullet on={isCatalog} />MAGICAL OBJECTS
              </button>
              <button
                onClick={() => go("/story")}
                className={`flex items-center gap-[3px] text-left ${isStory ? "text-white" : "text-white/40"}`}
              >
                <Bullet on={isStory} />STORY
              </button>
              <button
                onClick={() => go("/follow")}
                className={`flex items-center gap-[3px] text-left ${isFollow ? "text-white" : "text-white/40"}`}
              >
                <Bullet on={isFollow} />FOLLOW
              </button>
            </nav>

            {/* Sub-list */}
            <ul className="list-none m-0 p-0 flex flex-col gap-0.5 text-body uppercase shrink-0 mt-4">
              {isCatalog && PRODUCTS.map((p, i) => {
                const on = i === selectedIdx;
                return (
                  <li key={p.slug}>
                    <button
                      onClick={() => go(`/objects/${p.slug}`)}
                      className={`flex items-center gap-[3px] text-left w-full ${on ? "text-white" : "text-white/40"}`}
                    >
                      <Bullet on={on} />{p.name}
                    </button>
                  </li>
                );
              })}
              {isStory && STORY.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-[3px] text-white/40 hover:text-white/70 transition-colors"
                  >
                    <Bullet on={false} />{s.title}
                  </a>
                </li>
              ))}
            </ul>

            {/* Description area */}
            {!isHome && (
              <div className="mt-7 shrink-0 text-body normal-case text-white/70 leading-snug">
                {isCatalog ? (
                  <p key={currentProduct.slug}>
                    <TypewriterText text={currentProduct.description} animKey={currentProduct.slug} />
                  </p>
                ) : isFollow ? (
                  followFormInline
                ) : null}
              </div>
            )}

            <div className="flex-1" />
          </div>

          {/* RIGHT PANE */}
          <div className="flex-1 flex flex-col bg-black overflow-hidden">
            {isHome && (
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
                  src="/assets/hero-video.mp4"
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={(e) => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                  style={{ objectPosition: "center 20%" }}
                />
                <SideGradient />
                <GrainOverlay />
              </div>
            )}
            {isCatalog && (
              <div className="flex-1 relative overflow-hidden">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <SideGradient />
                <GrainOverlay />
              </div>
            )}
            {isStory && (
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
                  src="/assets/story-video.mp4"
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={(e) => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                />
                <SideGradient />
                <GrainOverlay />
              </div>
            )}
            {isFollow && (
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
                  src="/assets/follow-video.mp4"
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={(e) => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                />
                <SideGradient />
                <GrainOverlay />
              </div>
            )}
          </div>

        </div>
      )}

      {/* SEO content from child pages — invisible to users, readable by crawlers */}
      <div className="sr-only">{children}</div>

      {/* ── PRELOADER (home entry gate) ───────────────────────────── */}
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
            fetchPriority="high"
            draggable={false}
          />
          <span className="mt-10 text-body uppercase tracking-[0.3em] text-white">
            Go Home
          </span>
        </div>
      )}

    </div>
  );
}
