// Проверка и загрузка товаров из файла.
//
// Правила (они же в листе «Инструкция» шаблона):
// - товар ищется по артикулу: есть — обновляем, нет — создаём;
// - для нового товара обязательны Название, Категория и Цена;
// - пустая ячейка не меняет значение у существующего товара.
//   Исключения: «Старая цена» (пусто — скидка снимается) и характеристики (пусто — характеристика удаляется);
// - режим «только цены и наличие» меняет цену, старую цену и наличие у существующих товаров и ничего не создаёт.
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { findAttribute, findOrCreateAttribute, findOrCreateBrand, parseNumber, uniqueProductSlug } from "@/lib/attributes";
import { mapHeaders, parseBool, parsePrice, parseStock, type ColumnKey } from "./columns";
import type { ParsedFile, SheetRow } from "./parse";

export type ImportMode = "full" | "prices";

export type ImportReport = {
  total: number;
  toCreate: number;
  toUpdate: number;
  skipped: number;
  errors: { line: number; message: string }[];
  newCategories: string[];
  unknownColumns: string[];
  attributeColumns: string[];
  applied?: boolean;
};

type Row = {
  line: number; // номер строки в Excel (с заголовком = 1)
  sku: string;
  get: (key: ColumnKey) => string | undefined; // undefined — колонки нет в файле
  attrs: { name: string; value: string }[];
};

/** Путь категории «Смесители / Для кухни» → ["Смесители", "Для кухни"] */
const splitPath = (v: string) => v.split(/\s*[/>\\]\s*/).map((s) => s.trim()).filter(Boolean);

async function prepare(file: ParsedFile, mode: ImportMode) {
  const map = mapHeaders(file.headers);
  const errors: ImportReport["errors"] = [];

  if (!map.fields.sku) {
    errors.push({ line: 1, message: "Не найдена колонка «Артикул»" });
    return { map, rows: [] as Row[], errors };
  }

  const rows: Row[] = [];
  const seen = new Set<string>();
  file.rows.forEach((raw: SheetRow, i) => {
    const line = i + 2;
    const get = (key: ColumnKey) => (map.fields[key] ? (raw[map.fields[key]!] ?? "").trim() : undefined);
    const sku = get("sku") ?? "";
    if (!sku) return errors.push({ line, message: "Пустой артикул — строка пропущена" });
    if (seen.has(sku.toLowerCase())) return errors.push({ line, message: `Артикул ${sku} повторяется — строка пропущена` });
    seen.add(sku.toLowerCase());
    rows.push({ line, sku, get, attrs: mode === "full" ? map.attributes.map((a) => ({ name: a.name, value: (raw[a.header] ?? "").trim() })) : [] });
  });

  return { map, rows, errors };
}

/** Проверить файл (ничего не меняет) или загрузить товары в базу (apply = true) */
export async function runImport(file: ParsedFile, mode: ImportMode, apply: boolean): Promise<ImportReport> {
  const { map, rows, errors } = await prepare(file, mode);

  const existing = new Map(
    (await db.product.findMany({ where: { sku: { in: rows.map((r) => r.sku) } }, select: { id: true, sku: true } })).map((p) => [p.sku, p.id]),
  );

  // Категории: ищем по пути из названий, недостающие создадим
  const categories = await db.category.findMany({ select: { id: true, name: true, parentId: true } });
  const findCategory = (path: string[]) => {
    let parentId: number | null = null;
    for (const name of path) {
      const c = categories.find((x) => x.parentId === parentId && x.name.toLowerCase() === name.toLowerCase());
      if (!c) return null;
      parentId = c.id;
    }
    return parentId;
  };

  const report: ImportReport = {
    total: rows.length,
    toCreate: 0,
    toUpdate: 0,
    skipped: 0,
    errors,
    newCategories: [],
    unknownColumns: map.unknown,
    attributeColumns: map.attributes.map((a) => a.name),
  };

  // Сначала проверяем все строки
  const valid: (Row & { productId?: number; price: number | null; oldPrice: number | null })[] = [];
  for (const r of rows) {
    const productId = existing.get(r.sku);
    const price = r.get("price") !== undefined ? parsePrice(r.get("price")!) : null;
    const oldPrice = r.get("oldPrice") ? parsePrice(r.get("oldPrice")!) : null;
    const stockRaw = r.get("stock");

    const rowErrors: string[] = [];
    if (Number.isNaN(price)) rowErrors.push(`цена «${r.get("price")}» не число`);
    if (Number.isNaN(oldPrice)) rowErrors.push(`старая цена «${r.get("oldPrice")}» не число`);
    if (stockRaw && !parseStock(stockRaw)) rowErrors.push(`непонятное наличие «${stockRaw}» (пишите «в наличии» или «под заказ»)`);

    if (!productId) {
      if (mode === "prices") rowErrors.push(`товара с артикулом ${r.sku} нет в каталоге`);
      else {
        if (!r.get("name")) rowErrors.push("для нового товара нужно название");
        if (!r.get("category")) rowErrors.push("для нового товара нужна категория");
        if (price === null) rowErrors.push("для нового товара нужна цена");
      }
    }
    if (rowErrors.length) {
      report.errors.push({ line: r.line, message: `${r.sku}: ${rowErrors.join("; ")}` });
      report.skipped++;
      continue;
    }

    const cat = r.get("category");
    if (mode === "full" && cat && findCategory(splitPath(cat)) === null) {
      const label = splitPath(cat).join(" / ");
      if (!report.newCategories.includes(label)) report.newCategories.push(label);
    }

    if (productId) report.toUpdate++;
    else report.toCreate++;
    valid.push({ ...r, productId, price, oldPrice });
  }

  if (!apply) return report;

  // ── Загрузка ──
  const ensureCategory = async (path: string[]) => {
    let parentId: number | null = null;
    for (const name of path) {
      let c = categories.find((x) => x.parentId === parentId && x.name.toLowerCase() === name.toLowerCase());
      if (!c) {
        let slug = slugify(name) || "kategoriya";
        if (await db.category.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
        c = await db.category.create({ data: { name, slug, parentId }, select: { id: true, name: true, parentId: true } });
        categories.push(c);
      }
      parentId = c.id;
    }
    return parentId!;
  };

  // Пачками по 100 строк: если что-то упадёт, уже загруженные пачки сохранятся
  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100);
    // Категории создаём до транзакции (они нужны многим строкам)
    const catIds = new Map<number, number>();
    if (mode === "full") {
      for (const r of chunk) if (r.get("category")) catIds.set(r.line, await ensureCategory(splitPath(r.get("category")!)));
    }

    await db.$transaction(
      async (tx) => {
        for (const r of chunk) {
          const stock = r.get("stock") ? parseStock(r.get("stock")!)! : undefined;
          const priceData = {
            ...(r.price !== null ? { price: r.price } : {}),
            ...(r.get("oldPrice") !== undefined ? { oldPrice: r.oldPrice } : {}),
            ...(stock ? { stock } : {}),
          };

          if (mode === "prices") {
            await tx.product.update({ where: { id: r.productId! }, data: priceData });
            continue;
          }

          const brandName = r.get("brand");
          const brand = brandName ? await findOrCreateBrand(tx, brandName) : undefined;
          const hit = r.get("isHit") ? parseBool(r.get("isHit")!) : null;
          const active = r.get("isActive") ? parseBool(r.get("isActive")!) : null;

          const data = {
            ...priceData,
            ...(r.get("name") ? { name: r.get("name")! } : {}),
            ...(catIds.has(r.line) ? { categoryId: catIds.get(r.line)! } : {}),
            ...(brand ? { brandId: brand.id } : {}),
            ...(r.get("unit") ? { unit: r.get("unit")! } : {}),
            ...(r.get("description") ? { description: r.get("description")! } : {}),
            ...(hit !== null ? { isHit: hit } : {}),
            ...(active !== null ? { isActive: active } : {}),
          };

          let productId = r.productId;
          if (productId) {
            await tx.product.update({ where: { id: productId }, data });
          } else {
            const created = await tx.product.create({
              data: {
                sku: r.sku,
                name: r.get("name")!,
                slug: await uniqueProductSlug(tx, r.get("name")!, r.sku),
                categoryId: catIds.get(r.line)!,
                price: r.price!,
                ...data,
              },
            });
            productId = created.id;
          }

          // Фото: ссылки через «|» или с новой строки. Пусто — фото не трогаем.
          const images = (r.get("images") ?? "").split(/\s*[|\n]\s*/).filter(Boolean);
          if (images.length) {
            await tx.productImage.deleteMany({ where: { productId } });
            await tx.productImage.createMany({ data: images.map((url, k) => ({ productId: productId!, url, sortOrder: k })) });
          }

          // Характеристики из колонок «Характеристика: …»
          for (const a of r.attrs) {
            if (!a.value) {
              const attr = await findAttribute(tx, a.name);
              if (attr) await tx.productAttribute.deleteMany({ where: { productId, attributeId: attr.id } });
              continue;
            }
            const attribute = await findOrCreateAttribute(tx, a.name, a.value);
            const value = { value: a.value, numValue: attribute.isNumeric ? parseNumber(a.value) : null };
            await tx.productAttribute.upsert({
              where: { productId_attributeId: { productId, attributeId: attribute.id } },
              create: { productId, attributeId: attribute.id, ...value },
              update: value,
            });
          }
        }
      },
      { timeout: 60_000 },
    );
  }

  report.applied = true;
  return report;
}
