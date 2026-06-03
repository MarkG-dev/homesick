interface GhostPost {
  slug: string;
  title: string;
  excerpt: string | null;
  feature_image: string | null;
  published_at: string;
}

async function getPosts(): Promise<GhostPost[]> {
  try {
    const base = process.env.GHOST_API_URL;
    const key = process.env.GHOST_CONTENT_API_KEY;
    if (!base || !key) return [];
    const url = `${base}/ghost/api/content/posts/?key=${key}&limit=all&fields=title,excerpt,feature_image,published_at,slug`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts ?? [];
  } catch {
    return [];
  }
}

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <main className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/writing/${post.slug}`}
            className="flex flex-col gap-2 group"
          >
            {post.feature_image ? (
              <div className="aspect-[4/3] overflow-hidden bg-white/5">
                <img
                  src={post.feature_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-white/5" />
            )}
            <h2 className="text-body uppercase leading-snug text-white">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-body text-white/50 normal-case leading-snug line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </a>
        ))}
      </div>
    </main>
  );
}
