// Страница «Спасибо за заказ»
import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { getSettings } from "@/lib/catalog";
import { phoneHref } from "@/lib/contacts";

export const metadata: Metadata = { title: "Спасибо за заказ", robots: { index: false } };

export default async function ThanksPage({ searchParams }: PageProps<"/checkout/thanks">) {
  const { n } = await searchParams;
  const number = typeof n === "string" ? n.slice(0, 20) : null;
  const settings = await getSettings();

  return (
    <div className="container-page max-w-xl py-12 text-center">
      <CircleCheck className="mx-auto h-14 w-14 text-ok" />
      <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Спасибо за заказ!</h1>
      {number && (
        <p className="mt-3 text-lg">
          Номер заказа: <b>{number}</b>
        </p>
      )}
      <p className="mt-3 text-muted">
        Мы перезвоним в рабочее время ({settings.hours}), чтобы подтвердить наличие, стоимость доставки и удобное время.
      </p>
      {settings.phone && (
        <p className="mt-3 text-muted">
          Есть вопросы? Звоните: <a href={phoneHref(settings.phone)} className="font-semibold text-ink">{settings.phone}</a>
        </p>
      )}
      <Link href="/catalog" className="btn mt-8 bg-brand-600 text-white hover:bg-brand-700">Вернуться в каталог</Link>
    </div>
  );
}
