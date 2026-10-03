// Сводка: новые заказы и заявки, цифры по каталогу.
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PageTitle } from "@/components/admin/fields";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function Dashboard() {
  const [newOrders, newRequests, products, onOrder, latest] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.request.count({ where: { isHandled: false } }),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: true, stock: "ON_ORDER" } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const tiles = [
    { label: "Новые заказы", value: newOrders, href: "/admin/orders?status=NEW", alert: newOrders > 0 },
    { label: "Необработанные заявки", value: newRequests, href: "/admin/requests", alert: newRequests > 0 },
    { label: "Товаров на сайте", value: products, href: "/admin/products" },
    { label: "Из них под заказ", value: onOrder, href: "/admin/products?stock=ON_ORDER" },
  ];

  return (
    <>
      <PageTitle>Сводка</PageTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl border border-line bg-white p-4 hover:border-brand-300">
            <div className="text-sm text-muted">{t.label}</div>
            <div className={`mt-1 text-3xl font-extrabold ${t.alert ? "text-sale" : ""}`}>{t.value}</div>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-bold">Последние заказы</h2>
      {latest.length === 0 ? (
        <p className="text-muted">Заказов пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {latest.map((o) => (
                <tr key={o.id} className="hover:bg-surface">
                  <td className="px-4 py-3 font-semibold"><Link href={`/admin/orders/${o.id}`} className="text-brand-700 hover:underline">{o.number}</Link></td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
