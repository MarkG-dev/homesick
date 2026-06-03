import type { Metadata } from "next";
import { PRODUCTS } from "../products";

export const metadata: Metadata = {
  title: "Magical Objects",
  description: "Six objects that feel like yours. Each one freed from multi-function to do one thing beautifully.",
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
