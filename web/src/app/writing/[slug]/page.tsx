import { notFound } from "next/navigation";

interface GhostPost {
  slug: string;
  title: string;
  html: string;
  feature_image: string | null;
  published_at: string;
}

const GHOST_URL = process.env.GHOST_API_URL;
const GHOST_KEY = process.env.GHOST_CONTENT_API_KEY;

async function getPost(slug: string): Promise<GhostPost | null> {
  const url = `${GHOST_URL}/ghost/api/content/posts/slug/${slug}/?key=${GHOST_KEY}&fields=title,html,feature_image,published_at,slug`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.posts?.[0] ?? null;
}

export async function generateStaticParams() {
  const url = `${GHOST_URL}/ghost/api/content/posts/?key=${GHOST_KEY}&limit=all&fields=slug`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.posts ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="p-6 max-w-prose">
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
