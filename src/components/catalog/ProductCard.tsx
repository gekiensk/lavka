// Карточка товара в списке: фото, название, цена, наличие.
import { skipOptimization } from "@/lib/images";
import Link from "next/link";
import Image from "next/image";
import type { ProductCardData } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { StockBadge } from "./StockBadge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const discount = discountPercent(product.price, product.oldPrice);
  const url = `/product/${product.slug}`;

  return (
    <article className="group relative flex flex-col">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-[1.5rem] bg-surface transition-colors group-hover:bg-brand-50">
        {image && (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.04]"
            // SVG-заглушки не нужно пережимать; настоящие фото Next.js оптимизирует сам
            unoptimized={skipOptimization(image.url)}
          />
        )}
        <div className="absolute left-3 top-3 flex gap-1">
          {discount && <span className="tabular rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white">−{discount}%</span>}
          {product.isHit && <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">Хит</span>}
        </div>
      </div>

      <StockBadge stock={product.stock} />

      <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-ink sm:text-[15px]">
        {/* Ссылка растянута на всю карточку через after: */}
        <Link href={url} className="after:absolute after:inset-0 after:rounded-[1.5rem] group-hover:text-brand-700">{product.name}</Link>
      </h3>
      <p className="mt-1 text-xs text-muted">Арт. {product.sku}</p>

      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={`tabular font-display text-lg font-extrabold tracking-tight sm:text-xl ${discount ? "text-sale" : "text-ink"}`}>
            {formatPrice(product.price)}
            {product.unit !== "шт" && <span className="text-sm font-semibold text-muted"> / {product.unit}</span>}
          </span>
          {discount && <span className="tabular text-sm text-muted line-through">{formatPrice(product.oldPrice!)}</span>}
        </div>
        <AddToCartButton
          variant="compact"
          className="shrink-0"
          product={{
            id: product.id,
            slug: product.slug,
            sku: product.sku,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: image?.url,
            stock: product.stock,
          }}
        />
      </div>
    </article>
  );
}
