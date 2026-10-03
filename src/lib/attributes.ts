// Сохранение характеристик товара (используется в редакторе товара и при импорте).
import type { Prisma } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";

type Tx = Prisma.TransactionClient;

/** «12,5» → 12.5; не число → null */
export function parseNumber(value: string): number | null {
  const n = Number(value.replace(/\s/g, "").replace(",", "."));
  return value.trim() !== "" && Number.isFinite(n) ? n : null;
}

/** Найти существующую характеристику по названию («Объём, л» найдёт «Объём») */
export async function findAttribute(tx: Tx, rawName: string) {
  const name = rawName.trim();
  const exact = await tx.attribute.findUnique({ where: { name } });
  if (exact) return exact;
  const m = name.match(/^(.+),\s*([^,]{1,10})$/);
  return m ? tx.attribute.findUnique({ where: { name: m[1].trim() } }) : null;
}

/**
 * Находит характеристику по названию или создаёт новую.
 * Название может содержать единицу через запятую: «Объём, л» → название «Объём», единица «л».
 */
export async function findOrCreateAttribute(tx: Tx, rawName: string, sampleValue: string) {
  let name = rawName.trim();
  let unit: string | null = null;
  const existing = await tx.attribute.findUnique({ where: { name } });
  if (existing) return existing;

  const m = name.match(/^(.+),\s*([^,]{1,10})$/);
  if (m) {
    const byBase = await tx.attribute.findUnique({ where: { name: m[1].trim() } });
    if (byBase) return byBase;
    name = m[1].trim();
    unit = m[2].trim();
  }

  let slug = slugify(name) || "attr";
  if (await tx.attribute.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  return tx.attribute.create({ data: { name, slug, unit, isNumeric: parseNumber(sampleValue) !== null } });
}

/** Заменить все характеристики товара на переданные */
export async function setProductAttributes(tx: Tx, productId: number, attrs: { name: string; value: string }[]) {
  await tx.productAttribute.deleteMany({ where: { productId } });
  const seen = new Set<number>();
  for (const a of attrs) {
    if (!a.name.trim() || !a.value.trim()) continue;
    const attribute = await findOrCreateAttribute(tx, a.name, a.value);
    if (seen.has(attribute.id)) continue;
    seen.add(attribute.id);
    await tx.productAttribute.create({
      data: {
        productId,
        attributeId: attribute.id,
        value: a.value.trim(),
        numValue: attribute.isNumeric ? parseNumber(a.value) : null,
      },
    });
  }
}

/** Найти бренд по названию (без учёта регистра) или создать */
export async function findOrCreateBrand(tx: Tx, name: string) {
  const existing = await tx.brand.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) return existing;
  let slug = slugify(name) || "brand";
  if (await tx.brand.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  return tx.brand.create({ data: { name, slug } });
}

/** Уникальный slug товара: если занят — добавляем артикул */
export async function uniqueProductSlug(tx: Tx, base: string, sku: string, exceptId?: number) {
  let slug = slugify(base) || slugify(sku) || "tovar";
  const taken = await tx.product.findFirst({ where: { slug, id: exceptId ? { not: exceptId } : undefined } });
  if (taken) slug = `${slug}-${slugify(sku)}`;
  return slug;
}
