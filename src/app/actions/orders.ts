"use server";
// Серверные действия корзины и заказа.
import { after } from "next/server";
import { db } from "@/lib/db";
import { notifyNewOrder } from "@/lib/notify";
import { fieldErrors, orderSchema, type FieldErrors } from "@/lib/validators";

/** Свежие цены и наличие для товаров из корзины (корзина хранится в браузере и могла устареть) */
export async function getCartProducts(ids: number[]) {
  const products = await db.product.findMany({
    where: { id: { in: ids.slice(0, 100) }, isActive: true },
    select: {
      id: true, slug: true, sku: true, name: true, price: true, unit: true, stock: true,
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
  return products.map(({ images, ...p }) => ({ ...p, image: images[0]?.url }));
}

export type OrderFormState = {
  ok: boolean;
  orderNumber?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
};

/** Оформить заказ. Цены берутся из базы, а не из браузера. */
export async function createOrder(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  if (formData.get("website")) return { ok: false, errors: { form: "Не удалось отправить заказ" } };

  const raw = Object.fromEntries([...formData.entries()].filter(([k, v]) => v !== "" && k !== "website")) as Record<string, string>;
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: raw };
  const data = parsed.data;

  // Актуальные товары из базы
  const products = await db.product.findMany({
    where: { id: { in: data.items.map((i) => i.id) }, isActive: true },
    select: { id: true, sku: true, name: true, price: true },
  });
  const items = data.items.flatMap((i) => {
    const p = products.find((x) => x.id === i.id);
    return p ? [{ productId: p.id, sku: p.sku, name: p.name, price: p.price, qty: i.qty }] : [];
  });
  if (items.length === 0) {
    return { ok: false, errors: { form: "Товары из корзины больше не продаются. Обновите страницу." }, values: raw };
  }
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        // Временный номер; ниже заменим на «ДТ-000123» по id заказа
        number: `tmp-${crypto.randomUUID()}`,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        delivery: data.delivery,
        address: data.delivery === "DELIVERY" ? data.address : null,
        comment: data.comment,
        total,
        consentAt: new Date(),
        items: { create: items },
      },
    });
    // Популярность товаров растёт с каждым заказом — влияет на сортировку «по популярности»
    for (const i of items) {
      await tx.product.update({ where: { id: i.productId }, data: { popularity: { increment: i.qty } } });
    }
    return tx.order.update({
      where: { id: created.id },
      data: { number: `ДТ-${String(created.id).padStart(6, "0")}` },
    });
  });

  after(() =>
    notifyNewOrder({
      number: order.number,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email,
      delivery: order.delivery,
      address: order.address,
      comment: order.comment,
      total: order.total,
      items,
    }),
  );

  return { ok: true, orderNumber: order.number };
}
