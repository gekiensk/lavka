// Переключение страниц списка товаров. Ссылки обычные — поисковики их видят.
import Link from "next/link";

type Props = {
  page: number;
  pages: number;
  /** Текущие параметры адреса (фильтры, сортировка) */
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
};

export function Pagination({ page, pages, searchParams, basePath }: Props) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v === undefined) continue;
      for (const item of Array.isArray(v) ? v : [v]) params.append(k, item);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Показываем первую, последнюю и соседние страницы: 1 … 4 5 6 … 12
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  return (
    <nav aria-label="Страницы" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
              n === page ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink hover:border-brand-300"
            }`}
          >
            {n}
          </Link>
        </span>
      ))}
    </nav>
  );
}
