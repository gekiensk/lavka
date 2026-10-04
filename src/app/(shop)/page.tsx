// Главная страница. Пока упрощённая: баннер, популярные разделы, хиты и акции.
// Полноценная главная (баннеры из админки, преимущества) — на этапе информационных страниц.
import Link from "next/link";
import Image from "next/image";
import { categoryUrl, getCategoryTree, getHits, getSaleProducts, getSettings } from "@/lib/catalog";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export default async function HomePage() {
  const [tree, hits, sale, settings] = await Promise.all([getCategoryTree(), getHits(8), getSaleProducts(4), getSettings()]);
  const popular = tree.filter((c) => c.isPopular);

  return (
    <div className="container-page space-y-12 pt-4 sm:pt-6">
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Сантехника в {settings.city === "Тюмень" ? "Тюмени" : settings.city} — в наличии и под заказ
        </h1>
        <p className="mt-3 max-w-lg text-brand-100">
          Смесители, унитазы, ванны, трубы и фитинги, водонагреватели и радиаторы. Доставка по городу и самовывоз из магазина.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/catalog" className="btn bg-white text-brand-800 hover:bg-brand-50">Перейти в каталог</Link>
          <Link href="/sale" className="btn border border-white/40 text-white hover:bg-white/10">Акции</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">Популярные разделы</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {popular.map((c) => (
            <Link key={c.id} href={categoryUrl([c.slug])} className="group rounded-2xl border border-line bg-white p-4 transition hover:border-brand-200 hover:shadow-md">
              {c.image && (
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-surface">
                  <Image src={c.image} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-contain p-3" unoptimized={c.image.endsWith(".svg")} />
                </div>
              )}
              <span className="font-bold group-hover:text-brand-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {sale.length > 0 && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold sm:text-2xl">Акции</h2>
            <Link href="/sale" className="text-sm font-semibold text-brand-700 hover:underline">Все акции</Link>
          </div>
          <ProductGrid products={sale} />
        </section>
      )}

      {hits.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">Хиты продаж</h2>
          <ProductGrid products={hits} />
        </section>
      )}
    </div>
  );
}
