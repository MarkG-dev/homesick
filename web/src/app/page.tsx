"use client";
import { useEffect, useState } from "react";

type Screen = "follow" | "home" | "catalog" | "story";

const OFFSET: Record<Screen, string> = {
  follow: "0dvh",
  home: "-100dvh",
  catalog: "-200dvh",
  story: "-300dvh",
};

const SAFE_TOP = "max(env(safe-area-inset-top), 28px)";

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
      "This tin can holds one message at a time, in one place. Modern phones are distracting and too accessible (social media, constant notifications, etc.). Constant access kills spontaneity and presence. This device brings both back.",
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
      "Breathwork guidance shrunk down to light and vibration in your pocket. It's a little ridiculous that the best way to calm down currently involves pulling out the same device that stresses us out!",
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

const CONTACT = [
  { label: "PHONE", value: "347-920-7112" },
  { label: "EMAIL", value: "SUBMIT" },
  { label: "INSTAGRAM", value: "" },
  { label: "TIKTOK", value: "" },
  { label: "INQUIRIES?", value: "" },
];

/** Soft dark fade over the bottom of video/image blocks.
 *  Transparent from top down to 85vh, then darkens toward black at the bottom. */
function MediaFade() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 pointer-events-none"
      style={{
        top: 0,
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 85%, rgba(0,0,0,0.85) 100%)",
      }}
    />
  );
}

function BottomNav({
  screen,
  go,
}: {
  screen: Screen;
  go: (s: Screen) => void;
}) {
  const Item = ({ label, target }: { label: string; target: Screen }) => {
    const active = screen === target;
    return (
      <button
        onClick={() => go(target)}
        className={`flex items-center gap-2 text-body uppercase ${
          active ? "text-white" : "text-white/40"
        }`}
      >
        <span className="inline-block w-[0.9em]">{active ? "●" : "○"}</span>
        {label}
      </button>
    );
  };
  return (
    <nav className="shrink-0 px-3 pt-4 pb-3 flex items-center gap-6">
      <Item label="MAGICAL OBJECTS" target="catalog" />
      <Item label="STORY" target="story" />
      <Item label="FOLLOW" target="follow" />
    </nav>
  );
}

function Homesick() {
  return (
    <div className="shrink-0 px-3 pb-2 bg-black">
      <img
        src="/assets/HOMESICK.png"
        alt="HOMESICK"
        className="w-full block"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}

/** Product list (left) + description (right) for CATALOG. */
function ProductBlock({
  selected,
  setSelected,
}: {
  selected: number;
  setSelected: (i: number) => void;
}) {
  return (
    <div className="shrink-0 grid grid-cols-[auto_1fr] gap-x-6 px-3 pb-2">
      <ul className="text-body uppercase leading-tight flex flex-col gap-0.5 list-none m-0 p-0">
        {PRODUCTS.map((p, i) => {
          const active = i === selected;
          return (
            <li key={p.name}>
              <button
                onClick={() => setSelected(i)}
                className={`flex items-center gap-2 text-left w-full ${
                  active ? "text-white" : "text-white/40"
                }`}
              >
                <span className="inline-block w-[0.9em]">
                  {active ? "●" : "○"}
                </span>
                {p.name}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-body leading-snug">{PRODUCTS[selected].description}</p>
    </div>
  );
}

/** Contact list (left) + values (right) for FOLLOW. */
function ContactBlock() {
  return (
    <div className="shrink-0 grid grid-cols-[auto_1fr] gap-x-6 px-3 pb-2">
      <ul className="text-body uppercase leading-tight flex flex-col gap-0.5 list-none m-0 p-0">
        {CONTACT.map((c, i) => {
          const active = i === 0;
          return (
            <li key={c.label}>
              <span
                className={`flex items-center gap-2 ${
                  active ? "text-white" : "text-white/40"
                }`}
              >
                <span className="inline-block w-[0.9em]">
                  {active ? "●" : "○"}
                </span>
                {c.label}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="text-body uppercase flex flex-col gap-0.5">
        <a href="tel:3479207112" className="text-white">
          347-920-7112
        </a>
        <button className="text-left text-white">SUBMIT</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState(0);
  const go = (s: Screen) => setScreen(s);

  // Scroll-down on HOME transitions to CATALOG; video scrolls up, nav + HOMESICK stay locked.
  useEffect(() => {
    if (screen !== "home") return;
    let acc = 0;
    let lastTouchY: number | null = null;
    const THRESHOLD = 80;
    const trigger = () => {
      setScreen("catalog");
      acc = 0;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        acc += e.deltaY;
        if (acc >= THRESHOLD) trigger();
      } else {
        acc = Math.max(0, acc + e.deltaY);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (lastTouchY == null) return;
      const y = e.touches[0].clientY;
      const delta = lastTouchY - y;
      lastTouchY = y;
      if (delta > 0) {
        acc += delta;
        if (acc >= THRESHOLD) trigger();
      } else {
        acc = Math.max(0, acc + delta);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [screen]);

  return (
    // Desktop: center a phone-sized column on black; mobile unchanged.
    <div className="fixed inset-0 overflow-hidden bg-black flex justify-center">
      <div className="relative w-full max-w-[440px] h-full overflow-hidden">
        <div
          className="flex flex-col w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateY(${OFFSET[screen]})` }}
        >
          {/* ══════ FOLLOW ══════ */}
          <section className="h-[100dvh] shrink-0 flex flex-col bg-black text-white">
            <div
              className="flex-1 relative overflow-hidden min-h-0"
              style={{ paddingTop: SAFE_TOP }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 30%" }}
              >
                <source
                  src="/assets/freepik_the-two-baby-eagles-yap-their-beaks-then-the-mothe_veo3_1_1080p_9-16_24fps_23600.mp4"
                  type="video/mp4"
                />
              </video>
              <MediaFade />
            </div>
            <ContactBlock />
            <BottomNav screen={screen} go={go} />
            <Homesick />
          </section>

          {/* ══════ HOME ══════ */}
          <section className="h-[100dvh] shrink-0 flex flex-col bg-black text-white">
            <div
              className="flex-1 relative overflow-hidden min-h-0"
              style={{ paddingTop: SAFE_TOP }}
            >
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
              <MediaFade />
            </div>
            <BottomNav screen={screen} go={go} />
            <Homesick />
          </section>

          {/* ══════ CATALOG ══════ */}
          <section className="h-[100dvh] shrink-0 flex flex-col bg-black text-white">
            <div
              className="flex-1 relative overflow-hidden min-h-0"
              style={{ paddingTop: SAFE_TOP }}
            >
              <img
                src={PRODUCTS[selected].image}
                alt={PRODUCTS[selected].name}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <MediaFade />
            </div>
            <ProductBlock selected={selected} setSelected={setSelected} />
            <BottomNav screen={screen} go={go} />
            <Homesick />
          </section>

          {/* ══════ STORY ══════ */}
          <section className="h-[100dvh] shrink-0 flex flex-col bg-black text-white">
            <div
              className="flex-1 relative overflow-hidden min-h-0"
              style={{ paddingTop: SAFE_TOP }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source
                  src="/assets/freepik_steadfy-frame-just-the-clouds-moving-across-horizo_veo3_1_1080p_9-16_24fps_23601.mp4"
                  type="video/mp4"
                />
              </video>
              <MediaFade />
              <div className="absolute inset-x-0 bottom-0 px-3 pb-3 text-body leading-snug max-h-[55%] overflow-y-auto">
                <p className="mb-3">
                  We struggled and struggled to make everything work! Then we
                  made it beautiful. Then we perfected it until it was in every
                  blue jean pocket, so polished and universal it became
                  invisible, which is the worst thing a beautiful thing can
                  become.
                </p>
                <p className="mb-3">
                  You cannot love what you cannot lose. You know this. You have
                  always known this. But nothing broke for so long that you
                  forgot. We track our sleep on the device that ruined it!
                  Everything is efficient and nothing is yours and the distance
                  between yourself and the world has never been wider.
                </p>
                <p className="mb-3">
                  Our objects are irregular. You might hate one. Good. It
                  wasn&apos;t for you. Seventy-two degrees is comfortable for
                  you but it makes your friend get sweaty and quiet until their
                  silence makes you laugh. Your nerve endings know. Magic is the
                  goal. Soon you will hold something alive and shy like a
                  firefly.
                </p>
                <p>
                  This is a story about what happens after everything works. Do
                  you, like us, suspect that perfection might be the problem?
                </p>
              </div>
            </div>
            <BottomNav screen={screen} go={go} />
            <Homesick />
          </section>
        </div>
      </div>
    </div>
  );
}
