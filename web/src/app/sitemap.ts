import type { MetadataRoute } from "next";
import { PRODUCTS } from "./(site)/products";

const BASE = "https://homesick.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/objects`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...PRODUCTS.map((p) => ({
      url: `${BASE}/objects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${BASE}/story`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/follow`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/writing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const base = process.env.GHOST_API_URL;
  const key = process.env.GHOST_CONTENT_API_KEY;
  if (!base || !key) return staticRoutes;

  try {
    const res = await fetch(
      `${base}/ghost/api/content/posts/?key=${key}&limit=all&fields=slug,updated_at`,
      { next: { revalidate: 60 } }
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
