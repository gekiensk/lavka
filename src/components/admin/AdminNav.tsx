"use client";
// Меню админки: слева на компьютере, горизонтальная лента на телефоне.
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Сводка" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/requests", label: "Заявки" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/import", label: "Импорт и экспорт" },
  { href: "/admin/banners", label: "Баннеры" },
  { href: "/admin/pages", label: "Страницы" },
  { href: "/admin/posts", label: "Статьи" },
  { href: "/admin/settings", label: "Настройки" },
];

export function AdminNav({ counters }: { counters: Record<string, number> }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
            isActive(i.href) ? "bg-brand-600 text-white" : "text-ink hover:bg-surface"
          }`}
        >
          {i.label}
          {counters[i.href] > 0 && (
            <span className={`rounded-full px-2 text-xs ${isActive(i.href) ? "bg-white/20" : "bg-sale text-white"}`}>{counters[i.href]}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
