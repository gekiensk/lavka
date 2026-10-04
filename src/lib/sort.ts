// Варианты сортировки товаров. Отдельный файл, чтобы его можно было
// подключать и в браузерных компонентах (без кода работы с базой).
export type SortKey = "popular" | "price_asc" | "price_desc" | "new";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
  { value: "new", label: "Новинки" },
];
