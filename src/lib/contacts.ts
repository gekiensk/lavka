// Ссылки для кнопок связи.

/** «+7 (3452) 00-00-00» → «tel:+73452000000» */
export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** «santeh_lavka» или «@santeh_lavka» → ссылка на Telegram */
export function telegramHref(username: string): string {
  return `https://t.me/${username.replace(/^@/, "")}`;
}
