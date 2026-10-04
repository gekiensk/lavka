// Выгрузка товаров в Excel/CSV в том же формате, что и загрузка:
// можно выгрузить, поправить цены в Excel и загрузить обратно.
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { ATTR_PREFIX, COLUMNS, STOCK_TEXT } from "./columns";

async function buildTable() {
  const [products, categories] = await Promise.all([
    db.product.findMany({
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
      include: {
        brand: true,
        images: { orderBy: { sortOrder: "asc" } },
        attributes: { include: { attribute: true } },
      },
    }),
    db.category.findMany({ select: { id: true, name: true, parentId: true } }),
  ]);

  const pathOf = (id: number): string => {
    const c = categories.find((x) => x.id === id);
    if (!c) return "";
    return c.parentId ? `${pathOf(c.parentId)} / ${c.name}` : c.name;
  };

  // Все характеристики, которые есть у товаров, — отдельными колонками
  const attrNames = [
    ...new Set(products.flatMap((p) => p.attributes.map((a) => (a.attribute.unit ? `${a.attribute.name}, ${a.attribute.unit}` : a.attribute.name)))),
  ].sort((a, b) => a.localeCompare(b, "ru"));

  const headers = [...COLUMNS.map((c) => c.title), ...attrNames.map((n) => ATTR_PREFIX + n)];
  const rows = products.map((p) => {
    const attr = Object.fromEntries(
      p.attributes.map((a) => [ATTR_PREFIX + (a.attribute.unit ? `${a.attribute.name}, ${a.attribute.unit}` : a.attribute.name), a.value]),
    );
    return [
      p.sku,
      p.name,
      pathOf(p.categoryId),
      p.brand?.name ?? "",
      p.price,
      p.oldPrice ?? "",
      STOCK_TEXT[p.stock],
      p.unit,
      p.isHit ? "да" : "нет",
      p.isActive ? "да" : "нет",
      p.description ?? "",
      p.images.map((i) => i.url).join(" | "),
      ...attrNames.map((n) => attr[ATTR_PREFIX + n] ?? ""),
    ];
  });
  return { headers, rows };
}

export async function exportCsv(): Promise<string> {
  const { headers, rows } = await buildTable();
  // BOM и «;» — чтобы Excel сразу правильно открыл русский текст
  return "﻿" + Papa.unparse([headers, ...rows], { delimiter: ";" });
}

function styleHeader(ws: ExcelJS.Worksheet) {
  const row = ws.getRow(1);
  row.font = { bold: true };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE6EF" } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

export async function exportXlsx(): Promise<Buffer> {
  const { headers, rows } = await buildTable();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Товары");
  ws.addRow(headers);
  rows.forEach((r) => ws.addRow(r));
  ws.columns.forEach((col, i) => (col.width = i === 1 ? 50 : i === 10 ? 60 : 18));
  styleHeader(ws);
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** Пустой шаблон с примерами и инструкцией */
export async function templateXlsx(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Товары");
  ws.addRow([...COLUMNS.map((c) => c.title), `${ATTR_PREFIX}Цвет`, `${ATTR_PREFIX}Длина излива, мм`]);
  ws.addRow(["LM3071C", "Смеситель для кухни Lemark Comfort", "Смесители / Смесители для кухни", "Lemark", 6490, 7990, "в наличии", "шт", "да", "да", "Описание товара", "", "хром", 220]);
  ws.addRow(["VLT-PPR20", "Труба полипропиленовая 20 мм", "Трубы и фитинги / Трубы", "Valtec", 160, "", "под заказ", "шт", "нет", "да", "", "", "", ""]);
  ws.columns.forEach((col, i) => (col.width = i === 1 || i === 2 ? 40 : 16));
  styleHeader(ws);

  const help = wb.addWorksheet("Инструкция");
  help.getColumn(1).width = 110;
  [
    "Как заполнять файл импорта товаров «Дело Труба»",
    "",
    "• Каждая строка — один товар. Первая строка — заголовки, их не меняйте. Лишние колонки можно удалить.",
    "• Артикул — обязательный. По нему товар ищется на сайте: если есть — обновится, если нет — создастся.",
    "• Для нового товара обязательны Название, Категория и Цена.",
    "• Категория — путь через «/», например «Смесители / Смесители для кухни». Недостающие категории создадутся сами.",
    "• Цена и Старая цена — числа в рублях. Старая цена больше цены → товар попадает в «Акции». Пустая старая цена снимает скидку.",
    "• Наличие — «в наличии» или «под заказ».",
    "• Хит и Показывать — «да» или «нет».",
    "• Фото — ссылки на картинки через «|». Пустая ячейка не трогает уже загруженные фото.",
    "• Характеристики — колонки с заголовком «Характеристика: Название» или «Характеристика: Название, единица».",
    "  Новые характеристики создадутся сами. Пустая ячейка удаляет характеристику у товара.",
    "• В остальных колонках пустая ячейка ничего не меняет у существующего товара.",
    "",
    "Режим «Только цены и наличие» обновляет цену, старую цену и наличие у существующих товаров и ничего не создаёт.",
    "Перед загрузкой сайт покажет проверку: сколько товаров создастся, обновится и какие строки с ошибками.",
  ].forEach((t, i) => {
    const row = help.addRow([t]);
    if (i === 0) row.font = { bold: true, size: 14 };
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}
