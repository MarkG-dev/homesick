"use client";

export default function Home() {
  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden bg-black text-white">

      {/* Sheep video — fills all available height, pauses on last frame */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <video
          autoPlay
          muted
          playsInline
          onEnded={(e) => e.currentTarget.pause()}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Nav — below video, left-aligned on black */}
      <nav className="shrink-0 px-3 pt-6 pb-4 text-body uppercase leading-tight flex flex-col gap-6">
        <button className="text-left text-white">MAGICAL<br />OBJECTS</button>
        <button className="text-left text-white">SOME<br />STORY</button>
        <button className="text-left text-white">PIRATE<br />SHIP</button>
      </nav>

      {/* HOMESICK — full bleed anchor at bottom */}
      <img
        src="/assets/HOMESICK.png"
        alt="HOMESICK"
        className="w-full block shrink-0"
        style={{ mixBlendMode: "screen" }}
      />

    </main>
  );
}
