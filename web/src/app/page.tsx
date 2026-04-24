"use client";
import { useState } from "react";

type Screen = "sheep" | "catalog" | "story" | "contact";

const offset = (s: Screen) =>
  s === "contact" ? "0dvh" : s === "sheep" ? "-100dvh" : "-200dvh";

const SAFE_TOP = "max(env(safe-area-inset-top), 28px)";

const PRODUCTS = [
  {
    name: "WANDR",
    description:
      "This tin can holds one message at a time, in one place. Modern phones are distracting and too accessible (social media, constant notifications, etc.). Constant access kills spontaneity and presence. This device brings both back.",
    image: null as string | null,
  },
  {
    name: "SIGH",
    description:
      "Breathwork guidance shrunk down to light and vibration in your pocket. It's a little ridiculous that the best way to calm down currently involves pulling out the same device that stresses us out!",
    image: "/assets/freepik__small-retru-device-with-soft-diffused-light-coming__23594%202.png",
  },
  {
    name: "ATC 1.0",
    description:
      "A stone that counts every mile you've ever walked. Not steps today — miles, total, forever. Watch the number build and suddenly a Tuesday afternoon walk matters.",
    image: "/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png",
  },
  {
    name: "PARROT",
    description:
      "A robot parrot for your desk. It listens. It repeats things. It has opinions about your vocabulary. Wouldn't it be fun if we all had a parrot? I've always wanted one...",
    image: "/assets/freepik__make-the-bird-parrot-colors-parakeet-colors-and-ma__23599%202.png",
  },
  {
    name: "SCORE",
    description:
      "Turns on when your favorite team is playing and shows their score. Nothing else. Put your team in the room.",
    image: null,
  },
  {
    name: "AURA",
    description:
      "Remember mood rings? Same idea, room-sized. Reads the energy and glows accordingly. Nice for dinner dates.",
    image: null,
  },
  {
    name: "DREAMCATCH",
    description:
      "Safe underneath a beautiful rock that hides your phone. You want it back? Lift the stone. Deliberately. Elevate your space.",
    image: "/assets/freepik__small-apple-mag-safe-wire-coming-out-of-the-right-__23598%202.png",
  },
  { name: "EVIL CLAUDE", description: "", image: null },
];

function Homesick({ dim }: { dim?: boolean }) {
  return (
    <div
      className={`shrink-0 px-3 pb-2 bg-black transition-opacity duration-500 ${
        dim ? "opacity-30" : "opacity-100"
      }`}
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
  const [screen, setScreen] = useState<Screen>("sheep");
  const [selected, setSelected] = useState(0);
  const go = (s: Screen) => setScreen(s);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Single container — all panels slide together */}
      <div
        className="flex flex-col w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(${offset(screen)})` }}
      >

        {/* ══════ PANEL 1: CONTACT ══════ */}
        <div className="h-[100dvh] shrink-0 flex flex-col bg-black text-white">
          <div
            className="shrink-0 flex justify-between items-center px-3 py-3 text-body uppercase"
            style={{ paddingTop: SAFE_TOP }}
          >
            <span>[CELL PHONE HERE]</span>
            <span>[EXCITED!]&nbsp;→</span>
          </div>

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
          </div>

          <nav className="shrink-0 px-3 pt-6 pb-4 text-body uppercase leading-tight flex flex-col gap-6">
            <button className="text-left text-white/40" onClick={() => go("catalog")}>
              MAGICAL<br />OBJECTS
            </button>
            <button className="text-left text-white/40" onClick={() => go("story")}>
              SOME<br />STORY
            </button>
            <button className="text-left text-white">
              PIRATE<br />SHIP
            </button>
          </nav>

          <Homesick />
        </div>

        {/* ══════ PANEL 2: SHEEP ══════ */}
        <div className="h-[100dvh] shrink-0 flex flex-col bg-black text-white">
          <div className="flex-1 relative overflow-hidden min-h-0">
            <video
              autoPlay
              muted
              playsInline
              onEnded={(e) => e.currentTarget.pause()}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
            >
              <source
                src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          <nav className="shrink-0 px-3 pt-6 pb-4 text-body uppercase leading-tight flex flex-col gap-6">
            <button className="text-left text-white" onClick={() => go("catalog")}>
              MAGICAL<br />OBJECTS
            </button>
            <button className="text-left text-white/40" onClick={() => go("story")}>
              SOME<br />STORY
            </button>
            <button className="text-left text-white/40" onClick={() => go("contact")}>
              PIRATE<br />SHIP
            </button>
          </nav>

          <Homesick />
        </div>

        {/* ══════ PANEL 3: CATALOG / STORY ══════ */}
        <div className="h-[100dvh] shrink-0 flex flex-col bg-black text-white">

          {/* — Catalog — */}
          <div className={`flex-1 min-h-0 flex flex-col ${screen === "story" ? "hidden" : ""}`}>
            <div
              className="shrink-0 grid grid-cols-[1fr_1.3fr_2.2fr] gap-x-3 px-3 pb-4"
              style={{ paddingTop: SAFE_TOP }}
            >
              <nav className="text-body uppercase leading-tight flex flex-col gap-8">
                <button className="text-left text-white">
                  MAGICAL<br />OBJECTS
                </button>
                <button
                  className="text-left text-white/40"
                  onClick={() => go("story")}
                >
                  SOME<br />STORY
                </button>
                <button
                  className="text-left text-white/40"
                  onClick={() => go("contact")}
                >
                  PIRATE<br />SHIP
                </button>
              </nav>

              <ul className="text-body uppercase leading-tight flex flex-col gap-0.5 list-none m-0 p-0 overflow-y-auto">
                {PRODUCTS.map((p, i) => (
                  <li key={i}>
                    <button
                      className={`text-left w-full ${
                        i === selected ? "text-white" : "text-white/40"
                      }`}
                      onClick={() => setSelected(i)}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="text-body leading-snug">
                {PRODUCTS[selected].description}
              </p>
            </div>

            <Homesick />

            <div className="flex-1 min-h-0 relative overflow-hidden">
              {PRODUCTS[selected].image && (
                <img
                  src={PRODUCTS[selected].image as string}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              )}
            </div>
          </div>

          {/* — Story — */}
          <div
            className={`flex-1 overflow-y-auto overscroll-contain min-h-0 ${
              screen === "story" ? "" : "hidden"
            }`}
          >
            <div className="relative" style={{ paddingTop: SAFE_TOP }}>
              <img
                src="/assets/HOMESICK.png"
                aria-hidden
                className="absolute inset-x-0 top-0 w-full z-0 pointer-events-none"
                style={{ mixBlendMode: "screen", opacity: 0.9 }}
              />
              <div className="relative z-10 grid grid-cols-[auto_1fr] gap-6 px-3 pb-10">
                <nav className="w-14 text-body uppercase leading-tight flex flex-col gap-8">
                  <button
                    className="text-left text-white/40"
                    onClick={() => go("catalog")}
                  >
                    MAGICAL<br />OBJECTS
                  </button>
                  <button className="text-left text-white">
                    SOME<br />STORY
                  </button>
                  <button
                    className="text-left text-white/40"
                    onClick={() => go("contact")}
                  >
                    PIRATE<br />SHIP
                  </button>
                </nav>
                <p className="text-display leading-snug">
                  We struggled and struggled to make everything work! Then we
                  made it beautiful. Then we perfected it until it was in every
                  blue jean pocket, so polished and universal it became
                  invisible, which is the worst thing a beautiful thing can
                  become.
                </p>
              </div>
            </div>

            <div className="pl-[92px] pr-3 pb-16">
              <div className="relative mb-10">
                <img
                  src="/assets/crab.png"
                  alt=""
                  className="absolute left-0 w-[62%] z-20 pointer-events-none"
                  style={{ top: "42%" }}
                />
                <p className="text-display leading-snug">
                  You cannot love what you cannot lose. You know this. You have
                  always known this. But nothing broke for so long that you
                  forgot. We lost our sleep on the device that ruined it!
                  Everything is efficient and nothing is yours and the distance
                  between yourself and the world has never been wider
                </p>
              </div>

              <div className="relative mb-10">
                <img
                  src="/assets/jelly.png"
                  alt=""
                  className="absolute right-0 w-[38%] z-20 pointer-events-none"
                  style={{ top: "55%" }}
                />
                <p className="text-display leading-snug">
                  Our objects are irregular. You might hate one. Good. It
                  wasn&apos;t for you. Seventy-two degrees is comfortable for
                  you but it makes your friend get sweaty and quiet until their
                  silence makes you laugh. Freed from the multi-function look
                  like them. Your nerve endings know. Magic is the goal. Soon
                  you will hold something alive and shy like a firefly.
                </p>
              </div>

              <p className="text-display leading-snug">
                This is a story about what happens after everything works. Do
                you, like us, suspect that perfection might be the problem?
              </p>
            </div>
          </div>

          {screen === "story" && <Homesick dim />}
        </div>

      </div>
    </div>
  );
}
