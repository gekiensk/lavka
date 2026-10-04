// Адрес сайта (из NEXT_PUBLIC_SITE_URL) — для sitemap, Open Graph и микроразметки.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Дело Труба";

/** Абсолютная ссылка: «/catalog» → «https://delo-truba.ru/catalog» */
export const absUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);
