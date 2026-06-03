import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Follow",
  description: "Follow Homesick for updates on magical objects, or reach out directly.",
  alternates: { canonical: "/follow" },
};

export default function FollowPage() {
  return (
    <div>
      <h1>Follow</h1>
      <p>Follow along for updates, or reach out directly.</p>
    </div>
  );
}
