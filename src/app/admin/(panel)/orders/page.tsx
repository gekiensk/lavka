// Список заказов с фильтром по статусу.
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, formatDateTime, formatPrice, ORDER_STATUS_LABEL } from "@/lib/format";
import { PageTitle } from "@/components/admin/fields";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/catalog/Pagination";
import type { OrderStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Заказы" };
const PER_PAGE = 30;

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in ORDER_STATUS_LABEL ? (sp.status as OrderStatus) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { _count: { select: { items: true } } } }),
    db.order.count({ where }),
  ]);

  return (
    <>
      <PageTitle>Заказы</PageTitle>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/orders" className={`rounded-full border px-3 py-1 ${!status ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white"}`}>Все</Link>
        {Object.entries(ORDER_STATUS_LABEL).map(([k, label]) => (
          <Link key={k} href={`/admin/orders?status=${k}`} className={`rounded-full border px-3 py-1 ${status === k ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white"}`}>{label}</Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-muted">Заказов нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Номер</th>
                <th className="px-4 py-2.5 font-semibold">Дата</th>
                <th className="px-4 py-2.5 font-semibold">Клиент</th>
                <th className="px-4 py-2.5 font-semibold">Получение</th>
                <th className="px-4 py-2.5 font-semibold">Сумма</th>
                <th className="px-4 py-2.5 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface">
                  <td className="px-4 py-3 font-semibold"><Link href={`/admin/orders/${o.id}`} className="text-brand-700 hover:underline">{o.number}</Link></td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.customerName}<div className="text-xs text-muted">{o.phone}</div></td>
                  <td className="px-4 py-3">{DELIVERY_LABEL[o.delivery]}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}<div className="text-xs font-normal text-muted">позиций: {o._count.items}</div></td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} searchParams={sp} basePath="/admin/orders" />
    </>
  );
}
