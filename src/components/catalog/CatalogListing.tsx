// Общий шаблон списка товаров: заголовок, фильтры слева, сортировка, сетка, страницы.
// Используется на страницах категории, акций и поиска.
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { getFacets, listProducts, parseFilters } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Filters } from "./Filters";
import { SortSelect } from "./SortSelect";
import { ProductGrid } from "./ProductGrid";
import { Pagination } from "./Pagination";

type Props = {
  title: string;
  crumbs: Crumb[];
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  /** Какие товары показывать (категория, акции, поиск) */
  where: Prisma.ProductWhereInput;
  /** Категории, по товарам которых строятся фильтры */
  facetCategoryIds: number[];
  /** Характеристики для фильтров */
  facetAttributes?: Parameters<typeof getFacets>[1];
  /** Ссылки на подкатегории над списком */
  subcategories?: { name: string; url: string }[];
  /** Текст внизу страницы (SEO-описание категории) */
  description?: string | null;
  /** Параметры, которые нужно сохранять при смене фильтров (например, ?q= на странице поиска) */
  keep?: Record<string, string>;
};

export async function CatalogListing(props: Props) {
  const filters = parseFilters(props.searchParams);
  const keepQs = new URLSearchParams(props.keep).toString();
  const resetHref = keepQs ? `${props.basePath}?${keepQs}` : props.basePath;
  const [{ items, total, pages }, facets] = await Promise.all([
    listProducts(props.where, filters),
    getFacets(props.facetCategoryIds, props.facetAttributes ?? []),
  ]);

  return (
    <div className="container-page">
      <Breadcrumbs items={props.crumbs} />

      <div className="mb-4 flex flex-wrap items-baseline gap-x-3">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{props.title}</h1>
        <span className="text-sm text-muted">
          {total} {plural(total, ["товар", "товара", "товаров"])}
        </span>
      </div>

      {props.subcategories && props.subcategories.length > 0 && (
        <ul className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {props.subcategories.map((s) => (
            <li key={s.url} className="shrink-0">
              <Link href={s.url} className="block rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-brand-300 hover:bg-brand-50">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-0 lg:block">
          <Filters facets={facets} filters={filters} total={total} keep={props.keep} resetHref={resetHref} />
          <div className="lg:hidden">
            <SortSelect value={filters.sort} />
          </div>
        </div>

        <section aria-label="Товары">
          <div className="mb-4 hidden justify-end lg:flex">
            <SortSelect value={filters.sort} />
          </div>

          {items.length > 0 ? (
            <ProductGrid products={items} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center">
              <p className="font-semibold">Ничего не нашлось</p>
              <p className="mt-1 text-sm text-muted">Попробуйте изменить или сбросить фильтры.</p>
              <Link href={resetHref} className="btn mt-4 border border-line">Сбросить фильтры</Link>
            </div>
          )}

          <Pagination page={filters.page} pages={pages} searchParams={props.searchParams} basePath={props.basePath} />
        </section>
      </div>

      {props.description && filters.page === 1 && (
        <section className="mt-12 max-w-3xl text-[15px] leading-relaxed text-muted">{props.description}</section>
      )}
    </div>
  );
}
