import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Категории" };

export default async function CategoriesPage() {
  const all = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  const render = (parentId: number | null, depth: number): React.ReactNode[] =>
    all
      .filter((c) => c.parentId === parentId)
      .flatMap((c) => [
        <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ paddingLeft: `${1 + depth * 1.5}rem` }}>
          <Link href={`/admin/categories/${c.id}`} className={`text-brand-700 hover:underline ${depth === 0 ? "font-bold" : ""}`}>{c.name}</Link>
          <span className="text-xs text-muted">товаров: {c._count.products}{c.isPopular && " · на главной"}</span>
        </li>,
        ...render(c.id, depth + 1),
      ]);

  return (
    <>
      <PageTitle actions={<Link href="/admin/categories/new" className="btn bg-brand-600 text-white hover:bg-brand-700">+ Добавить категорию</Link>}>Категории</PageTitle>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white text-sm">{render(null, 0)}</ul>
    </>
  );
}
