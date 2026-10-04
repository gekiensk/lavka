// Карточка заказа: состав, контакты клиента, смена статуса.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, formatDateTime, formatPrice, ORDER_STATUS_LABEL } from "@/lib/format";
import { phoneHref } from "@/lib/contacts";
import { AdminForm } from "@/components/admin/AdminForm";
import { PageTitle, Panel, Select, TextArea } from "@/components/admin/fields";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { updateOrder } from "../../../actions/orders";

export const metadata: Metadata = { title: "Заказ" };

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const order = await db.order.findUnique({
    where: { id: Number((await params).id) || 0 },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!order) notFound();

  return (
    <>
      <PageTitle actions={<StatusBadge status={order.status} />}>Заказ {order.number}</PageTitle>
      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <Panel title="Состав заказа">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 pr-3">
                      {i.product ? <Link href={`/product/${i.product.slug}`} target="_blank" className="hover:text-brand-700">{i.name}</Link> : i.name}
                      <div className="text-xs text-muted">Арт. {i.sku}</div>
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 text-muted">{i.qty} × {formatPrice(i.price)}</td>
                    <td className="whitespace-nowrap py-2 text-right font-semibold">{formatPrice(i.qty * i.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold">
            <span>Итого</span><span>{formatPrice(order.total)}</span>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Клиент">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-muted">Имя</dt><dd className="font-semibold">{order.customerName}</dd></div>
              <div><dt className="text-muted">Телефон</dt><dd><a href={phoneHref(order.phone)} className="font-semibold text-brand-700">{order.phone}</a></dd></div>
              {order.email && <div><dt className="text-muted">Email</dt><dd>{order.email}</dd></div>}
              <div><dt className="text-muted">Получение</dt><dd>{DELIVERY_LABEL[order.delivery]}{order.address && `: ${order.address}`}</dd></div>
              {order.comment && <div><dt className="text-muted">Комментарий</dt><dd className="whitespace-pre-line">{order.comment}</dd></div>}
              <div><dt className="text-muted">Создан</dt><dd>{formatDateTime(order.createdAt)}</dd></div>
              <div><dt className="text-muted">Согласие на обработку ПДн</dt><dd>{formatDateTime(order.consentAt)}</dd></div>
            </dl>
          </Panel>
          <AdminForm action={updateOrder.bind(null, order.id)}>
            <Panel title="Обработка">
              <Select label="Статус" name="status" defaultValue={order.status} options={Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }))} />
              <TextArea label="Заметка (видна только в админке)" name="adminNote" rows={3} defaultValue={order.adminNote ?? ""} />
            </Panel>
          </AdminForm>
        </div>
      </div>
    </>
  );
}
