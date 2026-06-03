import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Homesick" },
  description: "Homesick makes magical objects. Things that feel like yours.",
};

export default function HomePage() {
  return (
    <div>
      <h1>Homesick</h1>
      <p>Homesick makes magical objects. Things that feel like yours.</p>
    </div>
  );
}
