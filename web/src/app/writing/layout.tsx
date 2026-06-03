import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Writing from Homesick — on objects, design, and what happens after everything works.",
  openGraph: {
    title: "Writing — Homesick",
    description: "Writing from Homesick — on objects, design, and what happens after everything works.",
    type: "website",
    images: [{ url: "/og.png", width: 1600, height: 900 }],
  },
};

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-black text-white flex flex-col md:flex-row font-[var(--font-pilat)]">
      <aside className="md:w-[22vw] shrink-0 p-4 border-b md:border-b-0 md:border-r border-white/10 flex flex-col gap-4">
        <a href="/">
          <img
            src="/assets/HOMESICK.png"
            alt="HOMESICK"
            className="w-full block"
            style={{ mixBlendMode: "screen" }}
          />
        </a>
        <nav className="text-body uppercase flex flex-col gap-1">
          <a href="/" className="text-white/40 flex items-center gap-1 hover:text-white/70 transition-colors">
            ← Main site
          </a>
          <a href="/writing" className="text-white flex items-center gap-1">
            Writing
          </a>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
