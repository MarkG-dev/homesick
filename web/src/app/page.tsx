"use client";
import { useState } from "react";

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

const CONTACT_ITEMS = ["PHONE", "EMAIL", "INSTAGRAM", "TIKTOK", "INQUIRIES?"];

/** Black at bottom (matching nav bar) → transparent going up */
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
}: {
  screen: Screen;
  go: (s: Screen) => void;
}) {
  return (
    <nav className="shrink-0 flex items-start gap-4 px-3 pt-3 pb-2 text-body uppercase">
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
            className={`flex items-center gap-1.5 whitespace-nowrap ${
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

function Homesick() {
  return (
    <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),8px)] bg-black">
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
  const go = (s: Screen) => setScreen(s);
  const idx = SCREENS.indexOf(screen);
  const pct = 100 / SCREENS.length; // 25% per panel

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex justify-center">
      <div className="w-full max-w-[440px] h-full flex flex-col">

        {/* ── Sliding content area ────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{
              width: `${SCREENS.length * 100}%`,
              transform: `translateX(-${idx * pct}%)`,
            }}
          >

            {/* HOME ── sheep diorama, full bleed */}
            <div
              className="h-full relative shrink-0"
              style={{ width: `${pct}%` }}
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
              <BottomGradient />
            </div>

            {/* CATALOG ── product image + list/description */}
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
              {/* Product block — sticky at bottom, left col = list, right col = description */}
              <div className="shrink-0 grid grid-cols-[auto_1fr] gap-x-4 px-3 pt-3 pb-2 text-body uppercase">
                <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                  {PRODUCTS.map((p, i) => {
                    const on = i === selected;
                    return (
                      <li key={p.name}>
                        <button
                          onClick={() => setSelected(i)}
                          className={`flex items-center gap-1.5 text-left ${
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
                <p className="leading-snug line-clamp-6 overflow-hidden">
                  {PRODUCTS[selected].description}
                </p>
              </div>
            </div>

            {/* STORY ── clouds video, text overlaid at bottom */}
            <div
              className="h-full shrink-0 relative bg-black"
              style={{ width: `${pct}%` }}
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
              <BottomGradient />
              <div className="absolute inset-x-0 bottom-0 px-3 pb-3 z-10 text-body text-white leading-snug line-clamp-[10] overflow-hidden">
                <p className="mb-2">
                  We struggled and struggled to make everything work! Then we
                  made it beautiful. Then we perfected it until it was in every
                  blue jean pocket, so polished and universal it became
                  invisible, which is the worst thing a beautiful thing can
                  become.
                </p>
                <p className="mb-2">
                  You cannot love what you cannot lose. You know this. You have
                  always known this. But nothing broke for so long that you
                  forgot. We track our sleep on the device that ruined it!
                  Everything is efficient and nothing is yours and the distance
                  between yourself and the world has never been wider.
                </p>
                <p className="mb-2">
                  Our objects are irregular. You might hate one. Good. It
                  wasn&apos;t for you. Your nerve endings know. Magic is the
                  goal. Soon you will hold something alive and shy like a
                  firefly.
                </p>
                <p>
                  This is a story about what happens after everything works. Do
                  you, like us, suspect that perfection might be the problem?
                </p>
              </div>
            </div>

            {/* FOLLOW ── eagles video, contact block */}
            <div
              className="h-full shrink-0 flex flex-col bg-black"
              style={{ width: `${pct}%` }}
            >
              <div className="flex-1 relative overflow-hidden min-h-0">
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
                <BottomGradient />
              </div>
              {/* Contact block */}
              <div className="shrink-0 grid grid-cols-[auto_1fr] gap-x-4 px-3 pt-3 pb-2 text-body uppercase">
                <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                  {CONTACT_ITEMS.map((label, i) => (
                    <li
                      key={label}
                      className={`flex items-center gap-1.5 ${
                        i === 0 ? "text-white" : "text-white/40"
                      }`}
                    >
                      <Bullet on={i === 0} />
                      {label}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-0.5 text-white">
                  <a href="tel:3479207112">347-920-7112</a>
                  <button className="text-left">SUBMIT</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Locked bottom bar — NEVER MOVES ─────────────────────── */}
        <div className="shrink-0 bg-black">
          <BottomNav screen={screen} go={go} />
          <Homesick />
        </div>

      </div>
    </div>
  );
}
