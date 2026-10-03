// Запросы к каталогу: категории, товары, фильтры, поиск.
// Все страницы магазина берут данные отсюда — так логика не размазывается по компонентам.
import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { SORT_OPTIONS, type SortKey } from "@/lib/sort";

export type { SortKey };

export const PAGE_SIZE = 24;

// ───────────── Настройки магазина ─────────────

export type SiteSettings = {
  city: string;
  address: string;
  hours: string;
  phone: string;
  telegram: string;
  email: string;
};

const DEFAULT_SETTINGS: SiteSettings = {
  city: "Тюмень",
  address: "г. Тюмень",
  hours: "Пн–Сб 9:00–19:00, Вс 10:00–17:00",
  phone: "",
  telegram: "",
  email: "",
};

/** Контакты и часы работы из таблицы Setting (с подстановкой значений по умолчанию) */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.setting.findMany();
  const fromDb = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...fromDb };
});

// ───────────── Категории ─────────────

/** Категории верхнего уровня с подкатегориями — для меню и страницы каталога */
export const getCategoryTree = cache(async () => {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
    },
  });
});

export type CategoryWithPath = NonNullable<Awaited<ReturnType<typeof getCategoryBySlug>>>;

/** Категория по своему slug вместе с цепочкой родителей (для хлебных крошек и адреса) */
export const getCategoryBySlug = cache(async (slug: string) => {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
      attributes: { orderBy: { sortOrder: "asc" }, include: { attribute: true } },
    },
  });
  if (!category) return null;

  // Поднимаемся по родителям, чтобы получить полный путь
  const ancestors: { id: number; name: string; slug: string }[] = [];
  let parentId = category.parentId;
  while (parentId) {
    const parent = await db.category.findUnique({
      where: { id: parentId },
      select: { id: true, name: true, slug: true, parentId: true },
    });
    if (!parent) break;
    ancestors.unshift(parent);
    parentId = parent.parentId;
  }

  return { ...category, ancestors };
});

/** Адрес страницы категории: /catalog/<родитель>/<категория> */
export function categoryUrl(slugs: string[]): string {
  return `/catalog/${slugs.join("/")}`;
}

/** id категории и всех её вложенных подкатегорий — чтобы показывать товары всей ветки */
export async function getDescendantIds(categoryId: number): Promise<number[]> {
  const all = await db.category.findMany({ select: { id: true, parentId: true } });
  const result = [categoryId];
  for (let i = 0; i < result.length; i++) {
    for (const c of all) if (c.parentId === result[i]) result.push(c.id);
  }
  return result;
}

// ───────────── Фильтры из адресной строки ─────────────

export type ProductFilters = {
  priceMin?: number;
  priceMax?: number;
  brands: string[]; // slug брендов
  stock: string[]; // IN_STOCK / ON_ORDER
  sale: boolean; // только со скидкой
  /** Текстовые характеристики: slug → выбранные значения */
  attrValues: Record<string, string[]>;
  /** Числовые характеристики: slug → диапазон */
  attrRanges: Record<string, { min?: number; max?: number }>;
  sort: SortKey;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const toArray = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const toNumber = (v: string | string[] | undefined) => {
  const n = Number(toArray(v)[0]);
  return toArray(v)[0] && Number.isFinite(n) ? n : undefined;
};

/**
 * Разбирает параметры адреса в объект фильтров.
 * Формат: ?price_min=1000&brand=grohe&brand=lemark&stock=IN_STOCK&f_cvet=хром&f_dlina-izliva_min=200&sort=price_asc&page=2
 */
export function parseFilters(sp: SearchParams): ProductFilters {
  const attrValues: ProductFilters["attrValues"] = {};
  const attrRanges: ProductFilters["attrRanges"] = {};

  for (const [key, value] of Object.entries(sp)) {
    if (!key.startsWith("f_")) continue;
    const name = key.slice(2);
    if (name.endsWith("_min") || name.endsWith("_max")) {
      const slug = name.slice(0, -4);
      const n = toNumber(value);
      if (n === undefined) continue;
      attrRanges[slug] ??= {};
      attrRanges[slug][name.endsWith("_min") ? "min" : "max"] = n;
    } else {
      attrValues[name] = toArray(value).filter(Boolean);
    }
  }

  const sort = toArray(sp.sort)[0] as SortKey;
  return {
    priceMin: toNumber(sp.price_min),
    priceMax: toNumber(sp.price_max),
    brands: toArray(sp.brand),
    stock: toArray(sp.stock).filter((s) => s === "IN_STOCK" || s === "ON_ORDER"),
    sale: toArray(sp.sale)[0] === "1",
    attrValues,
    attrRanges,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "popular",
    page: Math.max(1, Math.floor(toNumber(sp.page) ?? 1)),
  };
}

/** Есть ли выбранные фильтры (страницы с фильтрами закрываем от индексации) */
export function hasActiveFilters(f: ProductFilters): boolean {
  return (
    f.priceMin !== undefined ||
    f.priceMax !== undefined ||
    f.brands.length > 0 ||
    f.stock.length > 0 ||
    f.sale ||
    Object.values(f.attrValues).some((v) => v.length > 0) ||
    Object.keys(f.attrRanges).length > 0
  );
}

// ───────────── Товары ─────────────

/** Поля товара, нужные для карточки в списке */
export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  price: true,
  oldPrice: true,
  stock: true,
  unit: true,
  isHit: true,
  brand: { select: { name: true } },
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

const ORDER_BY: Record<SortKey, Prisma.ProductOrderByWithRelationInput[]> = {
  popular: [{ popularity: "desc" }, { id: "asc" }],
  price_asc: [{ price: "asc" }, { id: "asc" }],
  price_desc: [{ price: "desc" }, { id: "asc" }],
  new: [{ createdAt: "desc" }, { id: "asc" }],
};

/** Условие отбора по выбранным фильтрам */
function buildWhere(base: Prisma.ProductWhereInput, f: ProductFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [base, { isActive: true }];

  if (f.priceMin !== undefined) and.push({ price: { gte: f.priceMin } });
  if (f.priceMax !== undefined) and.push({ price: { lte: f.priceMax } });
  if (f.brands.length) and.push({ brand: { slug: { in: f.brands } } });
  if (f.stock.length) and.push({ stock: { in: f.stock as ("IN_STOCK" | "ON_ORDER")[] } });
  if (f.sale) and.push({ oldPrice: { not: null } });

  for (const [slug, values] of Object.entries(f.attrValues)) {
    if (!values.length) continue;
    and.push({ attributes: { some: { attribute: { slug }, value: { in: values } } } });
  }
  for (const [slug, range] of Object.entries(f.attrRanges)) {
    and.push({
      attributes: {
        some: { attribute: { slug }, numValue: { gte: range.min, lte: range.max } },
      },
    });
  }

  return { AND: and };
}

/** Список товаров с фильтрами, сортировкой и постраничным выводом */
export async function listProducts(base: Prisma.ProductWhereInput, f: ProductFilters) {
  const where = buildWhere(base, f);
  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productCardSelect,
      orderBy: ORDER_BY[f.sort],
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);
  return { items, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Хиты продаж для главной */
export async function getHits(limit = 8) {
  return db.product.findMany({
    where: { isActive: true, isHit: true },
    select: productCardSelect,
    orderBy: ORDER_BY.popular,
    take: limit,
  });
}

/** Товары со скидкой для главной */
export async function getSaleProducts(limit = 8) {
  return db.product.findMany({
    where: { isActive: true, oldPrice: { not: null } },
    select: productCardSelect,
    orderBy: ORDER_BY.popular,
    take: limit,
  });
}

// ───────────── Варианты для фильтров ─────────────

export type Facets = Awaited<ReturnType<typeof getFacets>>;

/**
 * Что показывать в панели фильтров для набора категорий:
 * диапазон цен, бренды, значения характеристик (только те, что реально есть у товаров).
 */
export async function getFacets(
  categoryIds: number[],
  attributes: { attribute: { id: number; name: string; slug: string; unit: string | null; isNumeric: boolean } }[],
) {
  const where: Prisma.ProductWhereInput = { categoryId: { in: categoryIds }, isActive: true };

  const [price, brandGroups, values] = await Promise.all([
    db.product.aggregate({ where, _min: { price: true }, _max: { price: true } }),
    db.product.groupBy({ by: ["brandId"], where: { ...where, brandId: { not: null } }, _count: true }),
    db.productAttribute.findMany({
      where: { product: where, attributeId: { in: attributes.map((a) => a.attribute.id) } },
      select: { attributeId: true, value: true, numValue: true },
    }),
  ]);

  const brands = await db.brand.findMany({
    where: { id: { in: brandGroups.map((b) => b.brandId!) } },
    orderBy: { name: "asc" },
  });
  const brandCount = new Map(brandGroups.map((b) => [b.brandId, b._count]));

  const attrFacets = attributes
    .map(({ attribute: a }) => {
      const own = values.filter((v) => v.attributeId === a.id);
      if (a.isNumeric) {
        const nums = own.map((v) => v.numValue).filter((n): n is number => n !== null);
        if (nums.length < 2 || Math.min(...nums) === Math.max(...nums)) return null;
        return { ...a, kind: "range" as const, min: Math.min(...nums), max: Math.max(...nums), values: [] };
      }
      const counts = new Map<string, number>();
      for (const v of own) counts.set(v.value, (counts.get(v.value) ?? 0) + 1);
      if (counts.size < 2) return null; // фильтр из одного варианта бесполезен
      const list = [...counts.entries()]
        .sort((x, y) => x[0].localeCompare(y[0], "ru"))
        .map(([value, count]) => ({ value, count }));
      return { ...a, kind: "values" as const, min: 0, max: 0, values: list };
    })
    .filter((a) => a !== null);

  return {
    price: { min: price._min.price ?? 0, max: price._max.price ?? 0 },
    brands: brands.map((b) => ({ slug: b.slug, name: b.name, count: brandCount.get(b.id) ?? 0 })),
    attributes: attrFacets,
  };
}

// ───────────── Поиск ─────────────

/** Условие поиска по названию и артикулу. Каждое слово запроса должно встретиться. */
export function searchWhere(query: string): Prisma.ProductWhereInput {
  const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  return {
    AND: words.map((w) => ({
      OR: [
        { name: { contains: w, mode: "insensitive" as const } },
        { sku: { contains: w, mode: "insensitive" as const } },
        { brand: { name: { contains: w, mode: "insensitive" as const } } },
      ],
    })),
  };
}

/** Подсказки для строки поиска: несколько товаров и подходящих категорий */
export async function searchSuggest(query: string) {
  const q = query.trim();
  if (q.length < 2) return { products: [], categories: [] };

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { AND: [searchWhere(q), { isActive: true }] },
      select: { name: true, slug: true, sku: true, price: true, images: { select: { url: true }, take: 1 } },
      orderBy: ORDER_BY.popular,
      take: 6,
    }),
    db.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { name: true, slug: true, parent: { select: { slug: true } } },
      take: 3,
    }),
  ]);

  return {
    products: products.map((p) => ({ name: p.name, sku: p.sku, price: p.price, url: `/product/${p.slug}`, image: p.images[0]?.url })),
    categories: categories.map((c) => ({
      name: c.name,
      url: categoryUrl(c.parent ? [c.parent.slug, c.slug] : [c.slug]),
    })),
  };
}
