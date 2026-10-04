"use client";
// Строка поиска с подсказками. Ищет по названию, бренду и артикулу.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/format";

type Suggest = {
  products: { name: string; sku: string; price: number; url: string; image?: string }[];
  categories: { name: string; url: string }[];
};

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Suggest | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Запрашиваем подсказки через 250 мс после того, как пользователь перестал печатать
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (res.ok) setData(await res.json());
      } catch {
        // запрос отменён — пользователь продолжил печатать
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Закрываем подсказки при клике мимо
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const showSuggest = open && query.trim().length >= 2 && data && (data.products.length > 0 || data.categories.length > 0);

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search" action="/search">
        <label htmlFor="site-search" className="sr-only">Поиск по каталогу</label>
        <input
          id="site-search"
          name="q"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Поиск: смеситель, унитаз или артикул"
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-line bg-surface pl-4 pr-12 text-[15px] outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-white"
        />
        <button type="submit" className="absolute right-1 top-1 flex h-9 w-10 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50" aria-label="Найти">
          <Search className="h-5 w-5" />
        </button>
      </form>

      {showSuggest && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          {data.categories.length > 0 && (
            <div className="border-b border-line p-2">
              {data.categories.map((c) => (
                <Link key={c.url} href={c.url} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-surface">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
          <ul className="p-2">
            {data.products.map((p) => (
              <li key={p.url}>
                <Link href={p.url} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- маленькая превью-картинка
                    <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-md bg-surface object-contain" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm text-ink">{p.name}</span>
                    <span className="text-xs text-muted">Арт. {p.sku}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold">{formatPrice(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" onClick={submit} className="block w-full border-t border-line px-5 py-3 text-left text-sm font-semibold text-brand-700 hover:bg-surface">
            Все результаты по запросу «{query.trim()}»
          </button>
        </div>
      )}
    </div>
  );
}
