// Список товаров с поиском и фильтрами.
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { categoryOptions } from "@/lib/admin-data";
import { getDescendantIds, searchWhere } from "@/lib/catalog";
import { formatPrice, STOCK_LABEL } from "@/lib/format";
import { PageTitle } from "@/components/admin/fields";
import { Pagination } from "@/components/catalog/Pagination";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Товары" };
const PER_PAGE = 50;

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = Number(sp.category) || 0;
  const stock = sp.stock === "IN_STOCK" || sp.stock === "ON_ORDER" ? sp.stock : undefined;
  const hidden = sp.hidden === "1";
  const page = Math.max(1, Number(sp.page) || 1);

  const and: Prisma.ProductWhereInput[] = [];
  if (q) and.push(searchWhere(q));
  if (cat) and.push({ categoryId: { in: await getDescendantIds(cat) } });
  if (stock) and.push({ stock });
  if (hidden) and.push({ isActive: false });
  const where = { AND: and };

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: { select: { name: true } }, images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    db.product.count({ where }),
    categoryOptions(),
  ]);

  return (
    <>
      <PageTitle actions={<Link href="/admin/products/new" className="btn bg-brand-600 text-white hover:bg-brand-700">+ Добавить товар</Link>}>
        Товары <span className="text-base font-semibold text-muted">{total}</span>
      </PageTitle>

      {/* Обычная форма GET — фильтры попадают в адрес страницы */}
      <form className="mb-4 flex flex-wrap gap-2 text-sm">
        <input name="q" defaultValue={q} placeholder="Название или артикул" className="h-10 min-w-48 flex-1 rounded-lg border border-line bg-white px-3 outline-none focus:border-brand-400" />
        <select name="category" defaultValue={cat || ""} className="h-10 rounded-lg border border-line bg-white px-2">
          <option value="">Все категории</option>
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select name="stock" defaultValue={stock ?? ""} className="h-10 rounded-lg border border-line bg-white px-2">
          <option value="">Любое наличие</option>
          <option value="IN_STOCK">В наличии</option>
          <option value="ON_ORDER">Под заказ</option>
        </select>
        <label className="flex items-center gap-1.5 px-2"><input type="checkbox" name="hidden" value="1" defaultChecked={hidden} /> Скрытые</label>
        <button className="btn bg-brand-600 text-white">Найти</button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="w-14 px-3 py-2.5"></th>
              <th className="px-3 py-2.5 font-semibold">Товар</th>
              <th className="px-3 py-2.5 font-semibold">Категория</th>
              <th className="px-3 py-2.5 font-semibold">Цена</th>
              <th className="px-3 py-2.5 font-semibold">Наличие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className={`hover:bg-surface ${p.isActive ? "" : "opacity-50"}`}>
                <td className="px-3 py-2">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element -- превью в админке
                    <img src={p.images[0].url} alt="" className="h-10 w-10 rounded-md bg-surface object-contain" />
                  )}
                </td>
                <td className="px-3 py-2">
                  <Link href={`/admin/products/${p.id}`} className="font-semibold text-brand-700 hover:underline">{p.name}</Link>
                  <div className="text-xs text-muted">Арт. {p.sku}{!p.isActive && " · скрыт"}{p.isHit && " · хит"}</div>
                </td>
                <td className="px-3 py-2 text-muted">{p.category.name}</td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold">
                  {formatPrice(p.price)}
                  {p.oldPrice && <div className="text-xs font-normal text-muted line-through">{formatPrice(p.oldPrice)}</div>}
                </td>
                <td className={`px-3 py-2 ${p.stock === "IN_STOCK" ? "text-ok" : "text-wait"}`}>{STOCK_LABEL[p.stock]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-muted">Ничего не найдено</p>}
      </div>
      <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} searchParams={sp} basePath="/admin/products" />
    </>
  );
}
