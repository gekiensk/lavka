// Карточка товара в списке: фото, название, цена, наличие.
import Link from "next/link";
import Image from "next/image";
import type { ProductCardData } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { StockBadge } from "./StockBadge";

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0];
  const discount = discountPercent(product.price, product.oldPrice);
  const url = `/product/${product.slug}`;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-white p-3 transition hover:border-brand-200 hover:shadow-md sm:p-4">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-surface">
        {image && (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition group-hover:scale-[1.03]"
            // SVG-заглушки не нужно пережимать; настоящие фото Next.js оптимизирует сам
            unoptimized={image.url.endsWith(".svg")}
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount && <span className="rounded-md bg-sale px-2 py-0.5 text-xs font-bold text-white">−{discount}%</span>}
          {product.isHit && <span className="rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">Хит</span>}
        </div>
      </div>

      <StockBadge stock={product.stock} />

      <h3 className="mt-1.5 line-clamp-3 text-sm font-medium leading-snug text-ink sm:text-[15px]">
        {/* Ссылка растянута на всю карточку через after: */}
        <Link href={url} className="after:absolute after:inset-0">{product.name}</Link>
      </h3>
      <p className="mt-1 text-xs text-muted">Арт. {product.sku}</p>

      <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
        <span className={`text-lg font-extrabold ${discount ? "text-sale" : "text-ink"}`}>
          {formatPrice(product.price)}
          {product.unit !== "шт" && <span className="text-sm font-semibold text-muted"> / {product.unit}</span>}
        </span>
        {discount && <span className="text-sm text-muted line-through">{formatPrice(product.oldPrice!)}</span>}
      </div>
    </article>
  );
}
