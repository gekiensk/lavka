// Заявки «Перезвоните мне» и «Узнать наличие».
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { phoneHref } from "@/lib/contacts";
import { PageTitle } from "@/components/admin/fields";
import { toggleRequest } from "../../actions/orders";

export const metadata: Metadata = { title: "Заявки" };

export default async function RequestsPage() {
  const requests = await db.request.findMany({ orderBy: [{ isHandled: "asc" }, { createdAt: "desc" }], take: 200 });
  const productIds = requests.map((r) => r.productId).filter((id): id is number => id !== null);
  const products = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true } });

  return (
    <>
      <PageTitle>Заявки</PageTitle>
      {requests.length === 0 && <p className="text-muted">Заявок пока нет.</p>}
      <div className="space-y-3">
        {requests.map((r) => {
          const product = products.find((p) => p.id === r.productId);
          return (
            <div key={r.id} className={`flex flex-wrap items-start gap-4 rounded-2xl border bg-white p-4 ${r.isHandled ? "border-line opacity-60" : "border-brand-300"}`}>
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{r.type === "CALLBACK" ? "Перезвонить" : "Узнать наличие"}</span>
                  <span className="text-muted">{formatDateTime(r.createdAt)}</span>
                </div>
                <div className="mt-1">
                  {r.name || "Без имени"}, <a href={phoneHref(r.phone)} className="font-semibold text-brand-700">{r.phone}</a>
                </div>
                {product && <Link href={`/product/${product.slug}`} target="_blank" className="mt-1 block text-muted hover:text-ink">📦 {product.name}</Link>}
                {r.comment && <p className="mt-1 whitespace-pre-line">{r.comment}</p>}
              </div>
              <form action={toggleRequest.bind(null, r.id)}>
                <button className="btn border border-line bg-white text-sm">{r.isHandled ? "Вернуть в работу" : "Обработана ✓"}</button>
              </form>
            </div>
          );
        })}
      </div>
    </>
  );
}
