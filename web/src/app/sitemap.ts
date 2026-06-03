import type { MetadataRoute } from "next";

const BASE = "https://homesick.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/writing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const base = process.env.GHOST_API_URL;
  const key = process.env.GHOST_CONTENT_API_KEY;
  if (!base || !key) return staticRoutes;

  try {
    const res = await fetch(
      `${base}/ghost/api/content/posts/?key=${key}&limit=all&fields=slug,updated_at`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return staticRoutes;
    const data = await res.json();
    const articleRoutes: MetadataRoute.Sitemap = (data.posts ?? []).map(
      (p: { slug: string; updated_at: string }) => ({
        url: `${BASE}/writing/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })
    );
    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
