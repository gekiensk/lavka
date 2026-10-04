import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Оформление заказа", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Корзина", url: "/cart" }, { name: "Оформление заказа", url: "/checkout" }]} />
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">Оформление заказа</h1>
      <CheckoutForm pickupAddress={settings.address} />
    </div>
  );
}
