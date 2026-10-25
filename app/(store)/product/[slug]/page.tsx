import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { getApprovedReviews, getCategories, getProductBySlug, getRelatedProducts } from "@/lib/data";
import { getSettings } from "@/lib/models/Settings";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  const title = p.seoTitle || p.name;
  const description = p.seoDescription || p.shortDescription;
  // Share the product's own photo; pages without one fall back to the site-wide logo image.
  const images = p.images[0] ? [p.images[0]] : undefined;
  return { title, description, openGraph: { title, description, images }, twitter: { title, description, images } };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const [reviews, related, categories, settings] = await Promise.all([getApprovedReviews(p._id), getRelatedProducts(p._id, p.category), getCategories(), getSettings()]);
  return <ProductView p={p} reviews={reviews} related={related} category={categories.find((c) => c._id === p.category)} freeShippingThreshold={settings.freeShippingThreshold} />;
}
