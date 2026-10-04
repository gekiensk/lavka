// Микроразметка Schema.org в формате JSON-LD.
// Поисковики используют её для «богатых» сниппетов: цена и наличие товара, хлебные крошки, адрес магазина.
import type { SiteSettings } from "@/lib/catalog";
import { absUrl, SITE_NAME, SITE_URL } from "@/lib/site";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Экранируем «<», чтобы текст из базы не мог закрыть тег script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Магазин: название, адрес, телефон, часы работы */
export function storeJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    "@id": `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl("/logo.png"),
    image: absUrl("/og.png"),
    telephone: s.phone || undefined,
    email: s.email || undefined,
    address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: s.city, addressCountry: "RU" },
    // Часы работы в свободной форме понятны людям; для поисковиков их лучше уточнить в Яндекс Бизнесе и Google Business
    description: `Магазин сантехники. Часы работы: ${s.hours}`,
    sameAs: s.telegram ? [`https://t.me/${s.telegram.replace(/^@/, "")}`] : undefined,
    priceRange: "₽₽",
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absUrl(c.url) })),
  };
}

export function productJsonLd(p: {
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  price: number;
  stock: "IN_STOCK" | "ON_ORDER";
  brand: string | null;
  images: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.description ?? undefined,
    image: p.images.map(absUrl),
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: absUrl(`/product/${p.slug}`),
      price: p.price,
      priceCurrency: "RUB",
      availability: p.stock === "IN_STOCK" ? "https://schema.org/InStock" : "https://schema.org/BackOrder",
      seller: { "@id": `${SITE_URL}/#store` },
    },
  };
}

export function articleJsonLd(a: { title: string; slug: string; excerpt: string | null; cover: string | null; publishedAt: Date | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    image: a.cover ? [absUrl(a.cover)] : undefined,
    datePublished: a.publishedAt?.toISOString(),
    mainEntityOfPage: absUrl(`/blog/${a.slug}`),
    publisher: { "@id": `${SITE_URL}/#store` },
  };
}
