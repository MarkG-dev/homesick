"use client";
import { useState, useEffect, useRef } from "react";

const PRODUCTS = [
  {
    name: "ATC 1.0",
    description:
      "A stone that counts every mile you've ever walked. Not steps today — miles, total, forever. Watch the number build and suddenly a Tuesday afternoon walk matters.",
  },
  {
    name: "WANDR",
    description:
      "This tin can holds one message at a time, in one place. Modern phones are distracting and too accessible. Constant access kills spontaneity and presence. This device brings both back.",
  },
  { name: "SIGH", description: "" },
  { name: "PARROT", description: "" },
  { name: "123456", description: "" },
  { name: "SCORE", description: "" },
  { name: "AURA", description: "" },
  { name: "DREAMCATCH", description: "" },
  { name: "EVIL CLAUDE", description: "" },
  { name: "ATC 1.0", description: "" },
];

export default function Home() {
  const [screen, setScreen] = useState<"sheep" | "catalog">("sheep");
  const [selected, setSelected] = useState(0);
  const homesickRef = useRef<HTMLDivElement>(null);
  // Start with a reasonable estimate so layout is correct before measurement
  const [bottomPad, setBottomPad] = useState(112);

  useEffect(() => {
    const el = homesickRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBottomPad(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      {/* ─── HOMESICK — truly fixed, never moves, above all layers ─── */}
      <div
        ref={homesickRef}
        className="fixed bottom-0 inset-x-0 z-50 px-3 pb-2 bg-black"
      >
        <img
          src="/assets/HOMESICK.png"
          alt="HOMESICK"
          className="w-full block"
          style={{ mixBlendMode: "screen" }}
        />
      </div>

      {/* ─── CATALOG (base layer, always behind sheep) ─── */}
      <div
        className="fixed inset-0 z-10 flex flex-col bg-black text-white"
        style={{ paddingBottom: bottomPad }}
      >
        <div
          className="flex-1 grid grid-cols-[1fr_1.3fr_2.2fr] gap-x-3 px-3 pb-4 min-h-0 overflow-hidden"
          style={{ paddingTop: "max(env(safe-area-inset-top), 32px)" }}
        >
          {/* Nav */}
          <nav className="text-body uppercase leading-tight flex flex-col gap-8">
            <button
              className="text-left text-white"
              onClick={() => setScreen("sheep")}
            >
              MAGICAL
              <br />
              OBJECTS
            </button>
            <span className="text-white/40">
              SOME
              <br />
              STORY
            </span>
            <span className="text-white/40">
              PIRATE
              <br />
              SHIP
            </span>
          </nav>

          {/* Product list */}
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

          {/* Description */}
          <p className="text-body leading-snug">
            {PRODUCTS[selected].description}
          </p>
        </div>
      </div>

      {/* ─── SHEEP (slides down on tap, revealing catalog behind it) ─── */}
      <div
        className={`fixed inset-0 z-20 flex flex-col transition-transform duration-700 ease-in-out ${
          screen === "sheep" ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: bottomPad }}
      >
        {/* Video */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          <video
            autoPlay
            muted
            playsInline
            onEnded={(e) => e.currentTarget.pause()}
            className="absolute inset-0 w-full h-full object-cover object-top"
          >
            <source
              src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Nav */}
        <nav className="shrink-0 bg-black px-3 pt-6 pb-4 text-body uppercase leading-tight flex flex-col gap-6">
          <button
            className="text-left text-white"
            onClick={() => setScreen("catalog")}
          >
            MAGICAL
            <br />
            OBJECTS
          </button>
          <button className="text-left text-white">
            SOME
            <br />
            STORY
          </button>
          <button className="text-left text-white">
            PIRATE
            <br />
            SHIP
          </button>
        </nav>
      </div>
    </>
  );
}
