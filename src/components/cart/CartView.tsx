"use client";
// Содержимое страницы корзины: список товаров, количество, итог.
import { skipOptimization } from "@/lib/images";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { getCartProducts } from "@/app/actions/orders";
import { cartCount, cartTotal, useCart, useHydrated } from "@/store/cart";
import { formatPrice, plural } from "@/lib/format";
import { StockBadge } from "@/components/catalog/StockBadge";

export function CartView() {
  const { items, setQty, remove, sync } = useCart();
  const hydrated = useHydrated();

  // При открытии корзины подтягиваем актуальные цены и наличие
  const ids = items.map((i) => i.id).join(",");
  useEffect(() => {
    if (!ids) return;
    getCartProducts(ids.split(",").map(Number)).then(sync).catch(() => {});
  }, [ids, sync]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-2xl bg-surface" />;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-lg font-semibold">В корзине пока пусто</p>
        <p className="mt-1 text-muted">Загляните в каталог — там много полезного.</p>
        <Link href="/catalog" className="btn mt-5 bg-brand-600 text-white hover:bg-brand-700">Перейти в каталог</Link>
      </div>
    );
  }

  const total = cartTotal(items);
  const count = cartCount(items);
  const hasOnOrder = items.some((i) => i.stock === "ON_ORDER");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((i) => (
          <li key={i.id} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
            <Link href={`/product/${i.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface sm:h-24 sm:w-24">
              {i.image && <Image src={i.image} alt="" fill sizes="96px" className="object-contain p-1" unoptimized={skipOptimization(i.image)} />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Link href={`/product/${i.slug}`} className="line-clamp-2 text-[15px] font-medium hover:text-brand-700">{i.name}</Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                  <span>Арт. {i.sku}</span>
                  <StockBadge stock={i.stock} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="flex items-center rounded-full border border-line">
                  <button type="button" onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1} className="flex h-9 w-9 items-center justify-center disabled:opacity-30" aria-label="Меньше">
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={i.qty}
                    onChange={(e) => setQty(i.id, Number(e.target.value))}
                    className="h-9 w-12 border-x border-line text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Количество"
                  />
                  <button type="button" onClick={() => setQty(i.id, i.qty + 1)} className="flex h-9 w-9 items-center justify-center" aria-label="Больше">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="w-28 text-right">
                  <div className="font-extrabold">{formatPrice(i.price * i.qty)}</div>
                  {i.qty > 1 && <div className="text-xs text-muted">{formatPrice(i.price)} / {i.unit}</div>}
                </div>
                <button type="button" onClick={() => remove(i.id)} className="rounded-full p-2 text-muted hover:bg-surface hover:text-sale" aria-label="Удалить">
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="rounded-[1.75rem] bg-surface p-6 lg:sticky lg:top-40">
        <div className="flex justify-between text-muted">
          <span>{count} {plural(count, ["товар", "товара", "товаров"])}</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mt-2 flex justify-between text-lg font-extrabold">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>
        <p className="mt-2 text-sm text-muted">Стоимость доставки менеджер сообщит при подтверждении заказа.</p>
        {hasOnOrder && <p className="mt-2 text-sm text-wait">В корзине есть товары под заказ — уточним срок поставки по телефону.</p>}
        <Link href="/checkout" className="btn mt-4 w-full bg-brand-600 text-white hover:bg-brand-700">Оформить заказ</Link>
        <p className="mt-3 text-center text-xs text-muted">Оплата при получении — наличными или картой</p>
      </aside>
    </div>
  );
}
