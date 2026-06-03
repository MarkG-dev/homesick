import type { Metadata } from "next";
import { STORY } from "../products";

const DESCRIPTION =
  "A story about what happens after everything works. About objects that feel like yours.";

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Homesick",
    description: DESCRIPTION,
    url: "/about",
    type: "website",
    images: [{ url: "/og.png", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Homesick",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function AboutPage() {
  return (
    <article>
      <h1>About</h1>
      {STORY.map((s) => (
        <section key={s.id} id={s.id}>
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </section>
      ))}
    </article>
  );
}
