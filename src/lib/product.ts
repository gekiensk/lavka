// Запросы для страницы товара.
import { cache } from "react";
import { db } from "@/lib/db";
import { getCategoryBySlug, productCardSelect, type ProductCardData } from "@/lib/catalog";

/** Товар со всеми данными для карточки + путь категорий для хлебных крошек */
export const getProductBySlug = cache(async (slug: string) => {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: { select: { slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
      attributes: {
        include: { attribute: true },
        orderBy: { attribute: { name: "asc" } },
      },
    },
  });
  if (!product || !product.isActive) return null;

  const category = await getCategoryBySlug(product.category.slug);
  const categoryPath = category
    ? [...category.ancestors, { id: category.id, name: category.name, slug: category.slug }]
    : [];

  return { ...product, categoryPath };
});

/** Похожие товары: та же категория, ближе всего по цене */
export async function getSimilarProducts(product: { id: number; categoryId: number; price: number }, limit = 4) {
  const candidates = await db.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    select: { ...productCardSelect, price: true },
    take: 50,
  });
  return candidates
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
    .slice(0, limit);
}

/**
 * «С этим товаром покупают». Порядок источников:
 * 1) связи, заданные вручную в админке;
 * 2) товары, которые чаще всего оказывались в одном заказе с этим;
 * 3) популярные недорогие товары из других разделов (расходники и комплектующие).
 */
export async function getBoughtTogether(product: { id: number; categoryId: number; price: number }, limit = 4) {
  const result: ProductCardData[] = [];
  const seen = new Set<number>([product.id]);
  const push = (items: ProductCardData[]) => {
    for (const p of items) {
      if (result.length >= limit || seen.has(p.id)) continue;
      seen.add(p.id);
      result.push(p);
    }
  };

  // 1. Ручные связи
  const manual = await db.productRelation.findMany({
    where: { fromId: product.id, to: { isActive: true } },
    select: { to: { select: productCardSelect } },
  });
  push(manual.map((r) => r.to));

  // 2. Совместные покупки
  if (result.length < limit) {
    const orders = await db.orderItem.findMany({
      where: { productId: product.id },
      select: { orderId: true },
      orderBy: { id: "desc" },
      take: 200,
    });
    if (orders.length) {
      const together = await db.orderItem.groupBy({
        by: ["productId"],
        where: { orderId: { in: orders.map((o) => o.orderId) }, productId: { notIn: [...seen] } },
        _count: true,
        orderBy: { _count: { productId: "desc" } },
        take: limit,
      });
      const ids = together.map((t) => t.productId!).filter(Boolean);
      const items = await db.product.findMany({ where: { id: { in: ids }, isActive: true }, select: productCardSelect });
      push(ids.map((id) => items.find((i) => i.id === id)).filter((i) => i !== undefined));
    }
  }

  // 3. Недорогие популярные товары из других категорий
  if (result.length < limit) {
    const extra = await db.product.findMany({
      where: {
        isActive: true,
        id: { notIn: [...seen] },
        categoryId: { not: product.categoryId },
        price: { lte: Math.max(1000, Math.round(product.price * 0.3)) },
      },
      select: productCardSelect,
      orderBy: [{ popularity: "desc" }, { id: "asc" }],
      take: limit,
    });
    push(extra);
  }

  return result;
}
