// Форматирование цен, телефонов и слов для интерфейса.

const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

/** 12500 → «12 500 ₽» */
export function formatPrice(value: number): string {
  return rub.format(value);
}

/** Процент скидки по старой и новой цене */
export function discountPercent(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round((1 - price / oldPrice) * 100);
}

/**
 * Склонение слова по числу: plural(5, ["товар", "товара", "товаров"]) → «товаров»
 */
export function plural(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
  return forms[2];
}

export const STOCK_LABEL = {
  IN_STOCK: "В наличии",
  ON_ORDER: "Под заказ",
} as const;

export const ORDER_STATUS_LABEL = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  DONE: "Выполнен",
  CANCELLED: "Отменён",
} as const;

export const DELIVERY_LABEL = {
  PICKUP: "Самовывоз",
  DELIVERY: "Доставка",
} as const;

const dateTime = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Yekaterinburg",
});
/** Дата и время по Тюмени: «03.10.2026, 17:45» */
export const formatDateTime = (d: Date) => dateTime.format(d);
