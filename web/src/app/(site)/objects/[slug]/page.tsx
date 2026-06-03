import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "../../products";

const WWW = "https://www.homesick.dev";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Not Found" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/objects/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      url: `/objects/${product.slug}`,
      type: "website",
      images: [{ url: product.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ObjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${WWW}${product.image}`,
    brand: { "@type": "Brand", name: "Homesick" },
    url: `${WWW}/objects/${product.slug}`,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <img src={product.image} alt={product.name} />
    </div>
  );
}
