// Результаты поиска: /search?q=смеситель
import type { Metadata } from "next";
import { CatalogListing } from "@/components/catalog/CatalogListing";
import { db } from "@/lib/db";
import { searchWhere } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Поиск по каталогу",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";

  if (!q) {
    return (
      <div className="container-page py-10">
        <h1 className="text-2xl font-extrabold">Поиск</h1>
        <p className="mt-2 text-muted">Введите название товара, бренд или артикул в строке поиска.</p>
      </div>
    );
  }

  const where = searchWhere(q);
  const cats = await db.product.findMany({ where: { AND: [where, { isActive: true }] }, select: { categoryId: true }, distinct: ["categoryId"] });

  return (
    <CatalogListing
      title={`Поиск: «${q}»`}
      crumbs={[{ name: "Поиск", url: `/search?q=${encodeURIComponent(q)}` }]}
      basePath="/search"
      keep={{ q }}
      searchParams={sp}
      where={where}
      facetCategoryIds={cats.map((c) => c.categoryId)}
    />
  );
}
