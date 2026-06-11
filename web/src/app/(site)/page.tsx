import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Homesick" },
  description: "Homesick makes magical objects. Things that feel like yours.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Homesick",
    description: "Homesick makes magical objects. Things that feel like yours.",
    url: "/",
    type: "website",
    images: [{ url: "/og.png", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homesick",
    description: "Homesick makes magical objects. Things that feel like yours.",
    images: ["/og.png"],
  },
};

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.homesick.dev/#org",
      name: "Homesick",
      url: "https://www.homesick.dev",
      logo: "https://www.homesick.dev/mask.png",
      sameAs: ["https://www.homesick.dev"],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.homesick.dev/#site",
      url: "https://www.homesick.dev",
      name: "Homesick",
      description: "Homesick makes magical objects. Things that feel like yours.",
      publisher: { "@id": "https://www.homesick.dev/#org" },
    },
  ],
};

export default function HomePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <h1>Homesick</h1>
      <p>Homesick makes magical objects. Things that feel like yours.</p>
      <nav>
        <a href="/objects">Magical Objects</a>
        <a href="/about">About</a>
        <a href="/follow">Follow</a>
        <a href="https://www.gentlefuture.net">Writing</a>
      </nav>
    </div>
  );
}
