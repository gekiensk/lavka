// Хлебные крошки: «Главная › Каталог › Смесители». Последний пункт — текущая страница, без ссылки.
// Заодно выводят микроразметку BreadcrumbList для поисковиков.
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";

export type Crumb = { name: string; url: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Главная", url: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(all)} />
      <nav aria-label="Хлебные крошки" className="overflow-x-auto py-3 text-sm text-muted">
        <ol className="flex items-center gap-1 whitespace-nowrap">
          {all.map((c, i) => (
            <li key={c.url} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {i < all.length - 1 ? (
                <Link href={c.url} className="hover:text-ink">{c.name}</Link>
              ) : (
                <span className="text-ink" aria-current="page">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
