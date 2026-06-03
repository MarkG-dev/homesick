import type { Metadata } from "next";

const DESCRIPTION = "Follow Homesick for updates on magical objects, or reach out directly.";

export const metadata: Metadata = {
  title: "Follow",
  description: DESCRIPTION,
  alternates: { canonical: "/follow" },
  openGraph: {
    title: "Follow — Homesick",
    description: DESCRIPTION,
    url: "/follow",
    type: "website",
    images: [{ url: "/og.png", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Follow — Homesick",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function FollowPage() {
  return (
    <div>
      <h1>Follow</h1>
      <p>Follow along for updates, or reach out directly.</p>
    </div>
  );
}
