// Колонки файла импорта/экспорта товаров. Названия колонок — на русском, как в Excel у владельца.

/** Основные колонки в порядке выгрузки */
export const COLUMNS = [
  { key: "sku", title: "Артикул", aliases: ["артикул", "sku", "код", "код товара"] },
  { key: "name", title: "Название", aliases: ["название", "наименование", "товар"] },
  { key: "category", title: "Категория", aliases: ["категория", "раздел", "группа"] },
  { key: "brand", title: "Бренд", aliases: ["бренд", "производитель", "марка"] },
  { key: "price", title: "Цена", aliases: ["цена", "цена, руб", "цена, ₽", "розничная цена"] },
  { key: "oldPrice", title: "Старая цена", aliases: ["старая цена", "цена до скидки"] },
  { key: "stock", title: "Наличие", aliases: ["наличие", "остаток", "статус"] },
  { key: "unit", title: "Единица", aliases: ["единица", "ед.", "ед. изм.", "ед.изм."] },
  { key: "isHit", title: "Хит", aliases: ["хит", "хит продаж"] },
  { key: "isActive", title: "Показывать", aliases: ["показывать", "активен", "на сайте"] },
  { key: "description", title: "Описание", aliases: ["описание"] },
  { key: "images", title: "Фото", aliases: ["фото", "изображения", "картинки", "изображение"] },
] as const;

export type ColumnKey = (typeof COLUMNS)[number]["key"];

/** Префикс колонок с характеристиками: «Характеристика: Цвет», «Характеристика: Объём, л» */
export const ATTR_PREFIX = "Характеристика: ";
const ATTR_PREFIXES = ["характеристика:", "х:"];

export type HeaderMap = {
  fields: Partial<Record<ColumnKey, string>>; // ключ → заголовок в файле
  attributes: { header: string; name: string }[];
  unknown: string[];
};

/** Сопоставляет заголовки файла с полями товара */
export function mapHeaders(headers: string[]): HeaderMap {
  const result: HeaderMap = { fields: {}, attributes: [], unknown: [] };
  for (const header of headers) {
    const h = header.trim().toLowerCase().replace(/\s+/g, " ");
    if (!h) continue;
    const prefix = ATTR_PREFIXES.find((p) => h.startsWith(p));
    if (prefix) {
      const name = header.trim().slice(prefix.length).trim();
      if (name) result.attributes.push({ header, name });
      continue;
    }
    const col = COLUMNS.find((c) => (c.aliases as readonly string[]).includes(h));
    if (col && !result.fields[col.key]) result.fields[col.key] = header;
    else result.unknown.push(header);
  }
  return result;
}

/** «12 500,00 ₽» → 12500; пусто → null; ошибка → NaN */
export function parsePrice(v: string): number | null {
  const s = v
    .replace(/руб\.?|р\.|₽/gi, "")
    .replace(/[\s\u00a0]/g, "")
    .replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : NaN;
}

/** «в наличии», «есть», «да», «+», число > 0 → IN_STOCK; «под заказ», «нет», «0» → ON_ORDER */
export function parseStock(v: string): "IN_STOCK" | "ON_ORDER" | null {
  const s = v.trim().toLowerCase();
  if (!s) return null;
  if (/заказ|нет|^0$|^-$|ожида/.test(s)) return "ON_ORDER";
  if (/налич|есть|^да$|^\+$|^[1-9]\d*$|склад/.test(s)) return "IN_STOCK";
  return null;
}

/** «да», «1», «+», «true» → true; «нет», «0», «-» → false; пусто → null */
export function parseBool(v: string): boolean | null {
  const s = v.trim().toLowerCase();
  if (!s) return null;
  if (["да", "1", "+", "true", "yes", "x"].includes(s)) return true;
  if (["нет", "0", "-", "false", "no"].includes(s)) return false;
  return null;
}

export const STOCK_TEXT = { IN_STOCK: "в наличии", ON_ORDER: "под заказ" } as const;
