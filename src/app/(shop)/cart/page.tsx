import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Корзина", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Корзина", url: "/cart" }]} />
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">Корзина</h1>
      <CartView />
    </div>
  );
}
