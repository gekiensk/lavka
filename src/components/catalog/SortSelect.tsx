"use client";
// Выпадающий список сортировки. Меняет параметр sort в адресе, остальные фильтры сохраняет.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS, type SortKey } from "@/lib/sort";

export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Сортировка:</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === "popular") next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page"); // после смены сортировки — на первую страницу
          const qs = next.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="h-10 rounded-full border border-line bg-white px-4 font-medium outline-none hover:border-ink/40 focus:border-ink/40"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
