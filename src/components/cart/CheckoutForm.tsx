"use client";
// Форма оформления заказа.
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Store, Truck } from "lucide-react";
import { createOrder, type OrderFormState } from "@/app/actions/orders";
import { cartTotal, useCart, useHydrated } from "@/store/cart";
import { formatPrice } from "@/lib/format";

export function CheckoutForm({ pickupAddress }: { pickupAddress: string }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const hydrated = useHydrated();
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(createOrder, { ok: false });
  const [delivery, setDelivery] = useState<"PICKUP" | "DELIVERY">(
    state.values?.delivery === "DELIVERY" ? "DELIVERY" : "PICKUP",
  );

  // Заказ принят: очищаем корзину и переходим на страницу «Спасибо»
  useEffect(() => {
    if (state.ok && state.orderNumber) {
      clear();
      router.replace(`/checkout/thanks?n=${encodeURIComponent(state.orderNumber)}`);
    }
  }, [state, clear, router]);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-2xl bg-surface" />;

  if (items.length === 0 && !state.ok) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-lg font-semibold">Корзина пуста</p>
        <Link href="/catalog" className="btn mt-5 bg-brand-600 text-white hover:bg-brand-700">Перейти в каталог</Link>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.errors ?? {};

  return (
    <form key={JSON.stringify(v)} action={formAction} className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start" noValidate>
      <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ id: i.id, qty: i.qty })))} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="space-y-6">
        <section className="rounded-2xl border border-line p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-extrabold">Контактные данные</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Имя *" name="customerName" autoComplete="name" defaultValue={v.customerName} error={e.customerName} />
            <Field label="Телефон *" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" defaultValue={v.phone} error={e.phone} />
            <Field label="Email" name="email" type="email" autoComplete="email" placeholder="Необязательно" defaultValue={v.email} error={e.email} className="sm:col-span-2" />
          </div>
        </section>

        <section className="rounded-2xl border border-line p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-extrabold">Способ получения</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DeliveryOption value="PICKUP" current={delivery} onChange={setDelivery} icon={<Store className="h-5 w-5" />} title="Самовывоз" note={pickupAddress} />
            <DeliveryOption value="DELIVERY" current={delivery} onChange={setDelivery} icon={<Truck className="h-5 w-5" />} title="Доставка по городу" note="Стоимость сообщит менеджер" />
          </div>
          {delivery === "DELIVERY" && (
            <Field label="Адрес доставки *" name="address" autoComplete="street-address" placeholder="Улица, дом, квартира" defaultValue={v.address} error={e.address} className="mt-4" />
          )}
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-semibold">Комментарий к заказу</span>
            <textarea name="comment" rows={3} defaultValue={v.comment} placeholder="Удобное время звонка, подъезд, этаж…" className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand-400" />
          </label>
        </section>
      </div>

      <aside className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-40">
        <h2 className="mb-3 text-lg font-extrabold">Ваш заказ</h2>
        <ul className="max-h-72 space-y-3 overflow-y-auto">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 text-sm">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                {i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-contain p-0.5" unoptimized={i.image.endsWith(".svg")} />}
              </div>
              <span className="line-clamp-2 flex-1">{i.name}</span>
              <span className="shrink-0 text-right">
                <span className="block font-semibold">{formatPrice(i.price * i.qty)}</span>
                <span className="text-xs text-muted">× {i.qty}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-extrabold">
          <span>Итого</span>
          <span>{formatPrice(cartTotal(items))}</span>
        </div>
        <p className="mt-1 text-xs text-muted">Оплата при получении. Итог может измениться, если цена товара обновилась.</p>

        <label className="mt-4 flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" name="consent" defaultChecked={v.consent === "on"} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
          <span>
            Я согласен на <Link href="/consent" target="_blank" className="underline">обработку персональных данных</Link> и принимаю{" "}
            <Link href="/privacy" target="_blank" className="underline">политику конфиденциальности</Link>
          </span>
        </label>
        {e.consent && <p className="mt-1 text-xs text-sale">{e.consent}</p>}
        {(e.form || e.items) && <p className="mt-3 rounded-lg bg-white p-3 text-sm text-sale">{e.form ?? e.items}</p>}

        <button type="submit" disabled={pending || state.ok} className="btn mt-4 w-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60">
          {pending || state.ok ? "Отправляем…" : "Подтвердить заказ"}
        </button>
      </aside>
    </form>
  );
}

function DeliveryOption(props: {
  value: "PICKUP" | "DELIVERY";
  current: string;
  onChange: (v: "PICKUP" | "DELIVERY") => void;
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  const active = props.current === props.value;
  return (
    <label className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition ${active ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200"}`}>
      <input type="radio" name="delivery" value={props.value} checked={active} onChange={() => props.onChange(props.value)} className="sr-only" />
      <span className={active ? "text-brand-600" : "text-muted"}>{props.icon}</span>
      <span>
        <span className="block font-semibold">{props.title}</span>
        <span className="text-sm text-muted">{props.note}</span>
      </span>
    </label>
  );
}

function Field({ label, error, className = "", ...input }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-semibold">{label}</span>
      <input
        {...input}
        aria-invalid={!!error}
        className={`h-11 w-full rounded-lg border px-3 outline-none focus:border-brand-400 ${error ? "border-sale" : "border-line"}`}
      />
      {error && <span className="mt-1 block text-xs text-sale">{error}</span>}
    </label>
  );
}
