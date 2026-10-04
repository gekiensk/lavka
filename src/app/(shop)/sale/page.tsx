// Акции: все товары со старой ценой.
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CatalogListing } from "@/components/catalog/CatalogListing";
import { db } from "@/lib/db";

export const metadata: Metadata = pageMeta({
  title: "Акции и скидки",
  description: "Товары со скидкой в магазине сантехники «СанТех Лавка», Тюмень.",
  path: "/sale",
});

export default async function SalePage({ searchParams }: PageProps<"/sale">) {
  const where = { oldPrice: { not: null } };
  // Фильтры строим по всем категориям, где есть акционные товары
  const cats = await db.product.findMany({ where: { ...where, isActive: true }, select: { categoryId: true }, distinct: ["categoryId"] });

  return (
    <CatalogListing
      title="Акции"
      crumbs={[{ name: "Акции", url: "/sale" }]}
      basePath="/sale"
      searchParams={await searchParams}
      where={where}
      facetCategoryIds={cats.map((c) => c.categoryId)}
    />
  );
}
