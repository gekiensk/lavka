"use client";
// Панель фильтров категории.
// Работает как обычная форма с методом GET: выбранные значения попадают в адрес страницы
// (?brand=grohe&price_max=10000), поэтому ссылку с фильтрами можно отправить другу.
// С включённым JavaScript фильтр применяется сразу при изменении.
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Facets, ProductFilters } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";

type Props = {
  facets: Facets;
  filters: ProductFilters;
  total: number;
  /** Параметры адреса, которые сохраняются при смене фильтров */
  keep?: Record<string, string>;
  /** Куда ведёт кнопка «Сбросить» */
  resetHref: string;
};

export function Filters({ facets, filters, total, keep, resetHref }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false); // панель на телефоне

  // Собираем параметры из формы и переходим на новый адрес
  function apply() {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value.trim() !== "") params.append(key, value.trim());
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Событие change срабатывает при клике по галочке и при уходе из поля цены
  useEffect(() => {
    const form = formRef.current;
    form?.addEventListener("change", apply);
    return () => form?.removeEventListener("change", apply);
  });

  const isChecked = (list: string[] | undefined, v: string) => list?.includes(v) ?? false;

  const panel = (
    <form
      // Пересоздаём форму при смене фильтров в адресе, чтобы поля показывали актуальные значения
      key={JSON.stringify(filters)}
      ref={formRef}
      method="get"
      action={pathname}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
        setOpen(false);
      }}
      className="space-y-6"
    >
      {/* Сортировку сохраняем при смене фильтров */}
      {filters.sort !== "popular" && <input type="hidden" name="sort" value={filters.sort} />}
      {Object.entries(keep ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      <fieldset>
        <legend className="mb-2 font-bold">Цена, ₽</legend>
        <div className="flex gap-2">
          <input
            type="number" name="price_min" inputMode="numeric" min={0}
            defaultValue={filters.priceMin}
            placeholder={`от ${facets.price.min}`}
            className="h-10 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-ink/40"
          />
          <input
            type="number" name="price_max" inputMode="numeric" min={0}
            defaultValue={filters.priceMax}
            placeholder={`до ${facets.price.max}`}
            className="h-10 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <p className="mt-1 text-xs text-muted">
          {formatPrice(facets.price.min)} — {formatPrice(facets.price.max)}
        </p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-bold">Наличие</legend>
        <Check name="stock" value="IN_STOCK" label="В наличии" checked={isChecked(filters.stock, "IN_STOCK")} />
        <Check name="stock" value="ON_ORDER" label="Под заказ" checked={isChecked(filters.stock, "ON_ORDER")} />
        <Check name="sale" value="1" label="Со скидкой" checked={filters.sale} />
      </fieldset>

      {facets.brands.length > 1 && (
        <fieldset>
          <legend className="mb-2 font-bold">Бренд</legend>
          {facets.brands.map((b) => (
            <Check key={b.slug} name="brand" value={b.slug} label={b.name} count={b.count} checked={isChecked(filters.brands, b.slug)} />
          ))}
        </fieldset>
      )}

      {facets.attributes.map((a) =>
        a.kind === "range" ? (
          <fieldset key={a.slug}>
            <legend className="mb-2 font-bold">
              {a.name}
              {a.unit && `, ${a.unit}`}
            </legend>
            <div className="flex gap-2">
              <input
                type="number" name={`f_${a.slug}_min`} step="any"
                defaultValue={filters.attrRanges[a.slug]?.min}
                placeholder={`от ${a.min}`}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-ink/40"
              />
              <input
                type="number" name={`f_${a.slug}_max`} step="any"
                defaultValue={filters.attrRanges[a.slug]?.max}
                placeholder={`до ${a.max}`}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-ink/40"
              />
            </div>
          </fieldset>
        ) : (
          <fieldset key={a.slug}>
            <legend className="mb-2 font-bold">{a.name}</legend>
            {a.values.map((v) => (
              <Check
                key={v.value}
                name={`f_${a.slug}`}
                value={v.value}
                label={v.value}
                count={v.count}
                checked={isChecked(filters.attrValues[a.slug], v.value)}
              />
            ))}
          </fieldset>
        ),
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn flex-1 bg-brand-600 text-white hover:bg-brand-700">
          Показать {total} {plural(total, ["товар", "товара", "товаров"])}
        </button>
        <a
          href={resetHref}
          onClick={(e) => {
            e.preventDefault();
            router.push(resetHref, { scroll: false });
            setOpen(false);
          }}
          className="btn border border-line text-muted hover:text-ink"
        >
          Сбросить
        </a>
      </div>
    </form>
  );

  return (
    <>
      {/* Кнопка открытия на телефоне */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn border border-line bg-white text-ink lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" /> Фильтры
      </button>

      {/* На компьютере панель всегда видна слева */}
      <aside className="hidden lg:block">{panel}</aside>

      {/* На телефоне — полноэкранная панель */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Фильтры">
          <div className="flex h-14 items-center justify-between border-b border-line px-4">
            <span className="text-lg font-bold">Фильтры</span>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-surface" aria-label="Закрыть">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{panel}</div>
        </div>
      )}
    </>
  );
}

function Check(props: { name: string; value: string; label: string; count?: number; checked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
      <input
        type="checkbox"
        name={props.name}
        value={props.value}
        defaultChecked={props.checked}
        className="h-4.5 w-4.5 rounded border-line accent-brand-600"
      />
      <span className="flex-1">{props.label}</span>
      {props.count !== undefined && <span className="text-xs text-muted">{props.count}</span>}
    </label>
  );
}
