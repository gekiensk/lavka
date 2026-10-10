"use client";
// Кнопка «В корзину». После добавления превращается в ссылку «В корзине — перейти».
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, useHydrated, type CartItem } from "@/store/cart";

type Props = {
  product: Omit<CartItem, "qty">;
  /** compact — маленькая кнопка-значок для карточки в списке */
  variant?: "full" | "compact";
  className?: string;
};

export function AddToCartButton({ product, variant = "full", className = "" }: Props) {
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.items.some((i) => i.id === product.id));
  const hydrated = useHydrated();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => add(product)}
        aria-label={hydrated && inCart ? "Добавить ещё" : "В корзину"}
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition ${
          hydrated && inCart ? "bg-brand-100 text-brand-700" : "bg-ink text-white hover:bg-brand-600"
        } ${className}`}
      >
        {hydrated && inCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
      </button>
    );
  }

  if (hydrated && inCart) {
    return (
      <Link href="/cart" className={`btn border border-brand-300 bg-brand-50 text-brand-700 ${className}`}>
        <Check className="h-4 w-4" /> В корзине — оформить
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => add(product)} className={`btn bg-brand-600 text-white hover:bg-brand-700 ${className}`}>
      <ShoppingCart className="h-4 w-4" /> В корзину
    </button>
  );
}
