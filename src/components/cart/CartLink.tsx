"use client";
// Значок корзины в шапке с количеством товаров.
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cartCount, useCart, useHydrated } from "@/store/cart";

export function CartLink() {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <Link href="/cart" className="relative rounded-lg p-2.5 text-brand-700 hover:bg-brand-50" aria-label={`Корзина, товаров: ${count}`}>
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
