import type { Metadata } from "next";
import { STORY } from "../products";

export const metadata: Metadata = {
  title: "About",
  description:
    "A story about what happens after everything works. About objects that feel like yours.",
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
