import type { Metadata } from "next";
import { PRODUCTS } from "../products";

const DESCRIPTION = "Six objects that feel like yours. Each one freed from multi-function to do one thing beautifully.";

export const metadata: Metadata = {
  title: "Magical Objects",
  description: DESCRIPTION,
  alternates: { canonical: "/objects" },
  openGraph: {
    title: "Magical Objects — Homesick",
    description: DESCRIPTION,
    url: "/objects",
    type: "website",
    images: [{ url: "/og.png", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Magical Objects — Homesick",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function ObjectsPage() {
  return (
    <div>
      <h1>Magical Objects</h1>
      <ul>
        {PRODUCTS.map((p) => (
          <li key={p.slug}>
            <a href={`/objects/${p.slug}`}>
              <strong>{p.name}</strong> — {p.description}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
