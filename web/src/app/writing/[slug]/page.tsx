import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface GhostPost {
  slug: string;
  title: string;
  html: string;
  excerpt: string | null;
  feature_image: string | null;
  published_at: string;
  updated_at: string;
}

async function getPost(slug: string): Promise<GhostPost | null> {
  const base = process.env.GHOST_API_URL;
  const key = process.env.GHOST_CONTENT_API_KEY;
  if (!base || !key) return null;
  try {
    const res = await fetch(
      `${base}/ghost/api/content/posts/slug/${slug}/?key=${key}&fields=title,html,excerpt,feature_image,published_at,updated_at,slug`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.posts?.[0] ?? null;
  } catch {
    return null;
  }
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const base = process.env.GHOST_API_URL;
  const key = process.env.GHOST_CONTENT_API_KEY;
  if (!base || !key) return [];
  try {
    const res = await fetch(
      `${base}/ghost/api/content/posts/?key=${key}&limit=all&fields=slug`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };

  const description = post.excerpt ?? undefined;
  const images = post.feature_image ? [post.feature_image] : [];

  return {
    title: post.title,
    description,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      url: `/writing/${post.slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.feature_image ?? undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    publisher: { "@type": "Organization", name: "Homesick" },
  };

  return (
    <article className="p-6 max-w-prose">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="/writing"
        className="inline-block text-body uppercase text-white/40 hover:text-white transition-colors mb-6"
      >
        ← Writing
      </a>
      {post.feature_image && (
        <img
          src={post.feature_image}
          alt={post.title}
          className="w-full object-cover mb-6"
        />
      )}
      <p className="text-body text-white/40 uppercase mb-2">{date}</p>
      <h1 className="text-display uppercase leading-tight mb-6">{post.title}</h1>
      <div
        className="text-body text-white/80 normal-case leading-relaxed [&_p]:mb-4 [&_h2]:uppercase [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:uppercase [&_h3]:text-white/70 [&_h3]:mt-4 [&_h3]:mb-1 [&_a]:underline [&_a]:text-white/60 [&_a:hover]:text-white [&_img]:w-full [&_img]:my-4 [&_blockquote]:border-l [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-white/50 [&_blockquote]:my-4"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
