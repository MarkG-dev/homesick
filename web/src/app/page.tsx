export default function Home() {
  return (
    <main className="bg-black text-white overflow-x-hidden">

      {/* ─── FRAME 1: HERO ─── */}
      <section>
        <div className="grid grid-cols-[1fr_1.3fr_2.2fr] gap-x-3 px-3 pt-8 pb-16">

          <nav className="text-body uppercase leading-tight flex flex-col gap-8">
            <span>MAGICAL<br />OBJECTS</span>
            <span>SOME<br />STORY</span>
            <span>PIRATE<br />SHIP</span>
          </nav>

          <ul className="text-body uppercase leading-tight flex flex-col gap-0.5 list-none m-0 p-0">
            {[
              "ATC 1.0", "WANDR", "SIGH", "PARROT",
              "123456", "SCORE", "AURA", "DREAMCATCH",
              "EVIL CLAUDE", "ATC 1.0",
            ].map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <p className="text-body leading-snug">
            This tin can holds one message at a time, in one place. Modern phones
            are distracting and too accessible (social media, constant
            notifications, etc.). Constant access kills spontaneity and presence.
            This device brings both back.
          </p>

        </div>

        {/* LED rock — full bleed */}
        <img
          src="/assets/freepik_make-the-led-twice-as-wid_2752466544%203.png"
          alt=""
          className="w-full block"
        />

        {/* HOMESICK wordmark — locked to margins */}
        <img
          src="/assets/HOMESICK.png"
          alt="HOMESICK"
          className="w-full block"
          style={{ mixBlendMode: "screen" }}
        />
      </section>

      {/* ─── FRAME 2: SHEEP ─── */}
      <section>
        <video autoPlay loop muted playsInline className="w-full block">
          <source
            src="/assets/freepik_have-the-sheep-move-aroun_2647120165.mp4"
            type="video/mp4"
          />
        </video>

        <div className="px-3 pt-8 pb-10 text-body uppercase leading-tight">
          <nav className="flex flex-col gap-8">
            <span>MAGICAL<br />OBJECTS</span>
            <span>SOME<br />STORY</span>
            <span>PIRATE<br />SHIP</span>
          </nav>
        </div>

        <img
          src="/assets/HOMESICK.png"
          alt="HOMESICK"
          className="w-full block"
          style={{ mixBlendMode: "screen" }}
        />
      </section>

      {/* ─── FRAME 3: STORY ─── */}
      <section className="relative overflow-hidden">

        {/* HOMESICK watermark sits behind the first paragraph */}
        <img
          src="/assets/HOMESICK.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-x-0 top-6 w-full pointer-events-none z-0"
          style={{ mixBlendMode: "screen", opacity: 0.9 }}
        />

        <div className="relative z-10 grid grid-cols-[auto_1fr] gap-6 px-3 pt-8 pb-16">

          <nav className="text-body uppercase leading-tight flex flex-col gap-8 w-14">
            <span>MAGICAL<br />OBJECTS</span>
            <span>SOME<br />STORY</span>
            <span>PIRATE<br />SHIP</span>
          </nav>

          <div className="text-display leading-snug">

            <p className="mb-10">
              We struggled and struggled to make everything work! Then we made it
              beautiful. Then we perfected it until it was in every blue jean
              pocket, so polished and universal it became invisible, which is the
              worst thing a beautiful thing can become.
            </p>

            {/* Crab — floats right, text wraps left */}
            <img
              src="/assets/crab.png"
              alt=""
              className="float-right w-3/5 ml-4 mb-4"
            />

            <p className="mb-10">
              You cannot love what you cannot lose. You know this. You have always
              known this. But nothing broke for so long that you forgot. We lost
              our sleep on the device that ruined it! Everything is efficient and
              nothing is yours and the distance between yourself and the world has
              never been wider
            </p>

            <p className="mb-10">
              Our objects are irregular. You might hate one. Good. It wasn&apos;t
              for you. Seventy-two degrees is comfortable for you but it makes
              your friend get sweaty and quiet until their silence makes you
              laugh. Freed from the multi-function look like them. Your nerve
              endings know. Magic is the goal. Soon you will hold something alive
              and shy like a firefly.
            </p>

            {/* Jellyfish — floats right */}
            <img
              src="/assets/jelly.png"
              alt=""
              className="float-right w-2/5 ml-4 mb-4"
            />

            <p>
              This is a story about what happens after everything works. Do you,
              like us, suspect that perfection might be the problem?
            </p>

            <div className="clear-both" />
          </div>
        </div>

        <img
          src="/assets/HOMESICK.png"
          alt="HOMESICK"
          className="w-full block relative z-10"
          style={{ mixBlendMode: "screen" }}
        />
      </section>

      {/* ─── FRAME 4: EAGLES ─── */}
      <section>
        <div className="flex justify-between items-center px-3 py-4 text-body uppercase">
          <span>[CELL PHONE HERE]</span>
          <span>[EXCITED!]&nbsp;→</span>
        </div>

        <video autoPlay loop muted playsInline className="w-full block">
          <source
            src="/assets/freepik_the-two-baby-eagles-yap-their-beaks-then-the-mothe_veo3_1_1080p_9-16_24fps_23600.mp4"
            type="video/mp4"
          />
        </video>

        <div className="px-3 pt-8 pb-10 text-body uppercase leading-tight">
          <nav className="flex flex-col gap-8">
            <span>MAGICAL<br />OBJECTS</span>
            <span>SOME<br />STORY</span>
            <span>PIRATE<br />SHIP</span>
          </nav>
        </div>

        <img
          src="/assets/HOMESICK.png"
          alt="HOMESICK"
          className="w-full block"
          style={{ mixBlendMode: "screen" }}
        />
      </section>

    </main>
  );
}
