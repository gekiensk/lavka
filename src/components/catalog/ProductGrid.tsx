import type { ProductCardData } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

/** Сетка карточек: 2 колонки на телефоне, до 4 на компьютере */
export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
