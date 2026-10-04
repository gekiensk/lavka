// Страница категории или подкатегории: /catalog/smesiteli и /catalog/smesiteli/smesiteli-dlya-kuhni
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CatalogListing } from "@/components/catalog/CatalogListing";
import { categoryUrl, getCategoryBySlug, getDescendantIds, hasActiveFilters, parseFilters } from "@/lib/catalog";

type Props = PageProps<"/catalog/[...slug]">;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug.at(-1)!);
  if (!category) return {};

  const url = categoryUrl([...category.ancestors.map((a) => a.slug), category.slug]);
  const filtered = hasActiveFilters(parseFilters(await searchParams));

  return {
    title: category.metaTitle ?? `${category.name} — купить в Тюмени`,
    description:
      category.metaDesc ??
      `${category.name}: цены, наличие и характеристики. Доставка по Тюмени и самовывоз из магазина «СанТех Лавка».`,
    alternates: { canonical: url },
    // Страницы с выбранными фильтрами не индексируем — чтобы не плодить дубли в поиске
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug.at(-1)!);
  if (!category) notFound();

  // Если адрес неполный или устаревший — перенаправляем на правильный
  const path = [...category.ancestors.map((a) => a.slug), category.slug];
  if (path.join("/") !== slug.join("/")) permanentRedirect(categoryUrl(path));

  const ids = await getDescendantIds(category.id);
  const basePath = categoryUrl(path);

  return (
    <CatalogListing
      title={category.name}
      crumbs={[
        { name: "Каталог", url: "/catalog" },
        ...category.ancestors.map((a, i) => ({ name: a.name, url: categoryUrl(path.slice(0, i + 1)) })),
        { name: category.name, url: basePath },
      ]}
      basePath={basePath}
      searchParams={await searchParams}
      where={{ categoryId: { in: ids } }}
      facetCategoryIds={ids}
      facetAttributes={category.attributes}
      subcategories={category.children.map((c) => ({ name: c.name, url: categoryUrl([...path, c.slug]) }))}
      description={category.description}
    />
  );
}
