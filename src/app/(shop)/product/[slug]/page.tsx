// Карточка товара: /product/smesitel-dlya-kuhni-grohe-eurosmart-33281003
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ShieldCheck, Store, Truck } from "lucide-react";
import { categoryUrl, getSettings } from "@/lib/catalog";
import { getBoughtTogether, getProductBySlug, getSimilarProducts } from "@/lib/product";
import { discountPercent, formatPrice } from "@/lib/format";
import { telegramHref } from "@/lib/contacts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RequestDialog } from "@/components/ui/RequestDialog";
import { Gallery } from "@/components/product/Gallery";
import { SpecsTable } from "@/components/product/SpecsTable";
import { StockBadge } from "@/components/catalog/StockBadge";
import { ProductGrid } from "@/components/catalog/ProductGrid";

type Props = PageProps<"/product/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description =
    product.metaDesc ??
    `${product.name} за ${formatPrice(product.price)}. ${product.stock === "IN_STOCK" ? "В наличии" : "Под заказ"} в Тюмени. Арт. ${product.sku}. Доставка и самовывоз.`;

  return {
    title: product.metaTitle ?? product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      images: product.images.filter((i) => !i.url.endsWith(".svg")).map((i) => i.url),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [similar, together, settings] = await Promise.all([
    getSimilarProducts(product),
    getBoughtTogether(product),
    getSettings(),
  ]);

  const discount = discountPercent(product.price, product.oldPrice);
  const path = product.categoryPath;
  const specs = [
    ...(product.brand ? [{ name: "Бренд", value: product.brand.name }] : []),
    { name: "Артикул", value: product.sku },
    ...product.attributes.map((a) => ({
      name: a.attribute.name,
      value: a.attribute.unit ? `${a.value} ${a.attribute.unit}` : a.value,
    })),
  ];
  const paragraphs = (product.description ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="container-page">
      <Breadcrumbs
        items={[
          { name: "Каталог", url: "/catalog" },
          ...path.map((c, i) => ({ name: c.name, url: categoryUrl(path.slice(0, i + 1).map((p) => p.slug)) })),
          { name: product.name, url: `/product/${product.slug}` },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <Gallery images={product.images} name={product.name} />

        <div>
          {product.brand && <p className="text-sm font-semibold text-brand-600">{product.brand.name}</p>}
          <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span>Арт. {product.sku}</span>
            <StockBadge stock={product.stock} />
          </div>

          {/* Цена и действия */}
          <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className={`text-3xl font-extrabold ${discount ? "text-sale" : ""}`}>{formatPrice(product.price)}</span>
              {product.unit !== "шт" && <span className="text-muted">за {product.unit}</span>}
              {discount && (
                <>
                  <span className="text-lg text-muted line-through">{formatPrice(product.oldPrice!)}</span>
                  <span className="rounded-md bg-sale px-2 py-0.5 text-sm font-bold text-white">−{discount}%</span>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {product.stock === "ON_ORDER" ? (
                <RequestDialog
                  type="AVAILABILITY"
                  productId={product.id}
                  productName={product.name}
                  buttonText="Узнать наличие и срок"
                  buttonClassName="btn flex-1 bg-brand-600 text-white hover:bg-brand-700"
                />
              ) : (
                <RequestDialog
                  type="CALLBACK"
                  productId={product.id}
                  productName={product.name}
                  buttonText="Заказать звонок"
                  buttonClassName="btn flex-1 bg-brand-600 text-white hover:bg-brand-700"
                />
              )}
              {settings.telegram && (
                <a href={telegramHref(settings.telegram)} target="_blank" rel="noopener" className="btn flex-1 border border-line bg-white text-brand-700 hover:border-brand-300">
                  <MessageCircle className="h-4 w-4" /> Спросить в Telegram
                </a>
              )}
            </div>
            {product.stock === "ON_ORDER" && (
              <p className="mt-3 text-sm text-muted">Товара нет на складе. Оставьте заявку — уточним срок поставки и перезвоним.</p>
            )}
          </div>

          {/* Коротко о получении */}
          <ul className="mt-5 space-y-3 text-[15px]">
            <li className="flex gap-3">
              <Store className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <span>Самовывоз из магазина: {settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <span>
                Доставка по {settings.city === "Тюмень" ? "Тюмени" : settings.city}.{" "}
                <Link href="/delivery" className="text-brand-700 underline-offset-2 hover:underline">Условия</Link>
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <span>Официальная гарантия производителя, оплата при получении</span>
            </li>
          </ul>

          {/* Несколько главных характеристик сразу под ценой */}
          {specs.length > 2 && (
            <div className="mt-6">
              <SpecsTable rows={specs.slice(0, 5)} />
              {specs.length > 5 && (
                <a href="#specs" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">Все характеристики</a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {paragraphs.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-extrabold">Описание</h2>
            <div className="space-y-3 text-[15px] leading-relaxed text-ink/90">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}
        <section id="specs" className="scroll-mt-40">
          <h2 className="mb-3 text-xl font-extrabold">Характеристики</h2>
          <SpecsTable rows={specs} />
        </section>
      </div>

      {together.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">С этим товаром покупают</h2>
          <ProductGrid products={together} />
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">Похожие товары</h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}
