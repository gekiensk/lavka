// Карта сайта для поисковиков: /sitemap.xml. Строится из базы при каждом запросе.
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { categoryUrl } from "@/lib/catalog";
import { absUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, pages, posts] = await Promise.all([
    db.category.findMany({ select: { id: true, slug: true, parentId: true } }),
    db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ select: { slug: true, updatedAt: true } }),
    db.post.findMany({ where: { isPublished: true }, select: { slug: true, publishedAt: true } }),
  ]);

  const pathOf = (id: number): string[] => {
    const c = categories.find((x) => x.id === id)!;
    return c.parentId ? [...pathOf(c.parentId), c.slug] : [c.slug];
  };

  return [
    { url: absUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absUrl("/catalog"), changeFrequency: "daily", priority: 0.9 },
    { url: absUrl("/sale"), changeFrequency: "daily", priority: 0.8 },
    { url: absUrl("/contacts"), changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/blog"), changeFrequency: "weekly", priority: 0.6 },
    ...categories.map((c) => ({ url: absUrl(categoryUrl(pathOf(c.id))), changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: absUrl(`/product/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...pages.map((p) => ({ url: absUrl(`/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...posts.map((p) => ({ url: absUrl(`/blog/${p.slug}`), lastModified: p.publishedAt ?? undefined, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
