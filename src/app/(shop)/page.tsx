// Главная страница: баннеры, популярные разделы, акции, хиты, преимущества, статьи.
import { skipOptimization } from "@/lib/images";
import Link from "next/link";
import Image from "next/image";
import { BadgePercent, PackageCheck, ShieldCheck, Truck, Wrench, Wallet } from "lucide-react";
import { categoryUrl, getCategoryTree, getHits, getSaleProducts, getSettings } from "@/lib/catalog";
import { getBanners, getPosts } from "@/lib/content";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { BannerSlider } from "@/components/home/BannerSlider";
import { PostCard } from "@/components/blog/PostCard";
import { RequestDialog } from "@/components/ui/RequestDialog";

// Преимущества магазина. Поменять текст можно здесь.
const ADVANTAGES = [
  { icon: PackageCheck, title: "Всё в наличии", text: "Популярные товары на складе магазина — можно забрать сегодня" },
  { icon: Truck, title: "Доставка по городу", text: "Привезём заказ в удобный день или соберём к самовывозу" },
  { icon: Wallet, title: "Оплата при получении", text: "Наличными или картой — после того, как проверите товар" },
  { icon: ShieldCheck, title: "Официальная гарантия", text: "Только оригинальная продукция с гарантией производителя" },
  { icon: Wrench, title: "Для мастеров", text: "Трубы, фитинги и расходники всегда в запасе, заказ заранее" },
  { icon: BadgePercent, title: "Честные цены", text: "Регулярные акции и скидки на популярные товары" },
];

export default async function HomePage() {
  const [tree, hits, sale, banners, posts, settings] = await Promise.all([
    getCategoryTree(),
    getHits(8),
    getSaleProducts(8),
    getBanners(),
    getPosts(3),
    getSettings(),
  ]);
  const popular = tree.filter((c) => c.isPopular);
  const city = settings.city === "Тюмень" ? "Тюмени" : settings.city;

  return (
    <div className="container-page space-y-12 pt-4 sm:space-y-16 sm:pt-6">
      {/* Главный заголовок страницы для поисковиков */}
      <h1 className="sr-only">СанТех Лавка — магазин сантехники в {city}</h1>

      {banners.length > 0 && <BannerSlider banners={banners} />}

      <section>
        <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">Популярные разделы</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {popular.map((c) => (
            <Link key={c.id} href={categoryUrl([c.slug])} className="group rounded-2xl border border-line bg-white p-4 transition hover:border-brand-200 hover:shadow-md">
              {c.image && (
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-surface">
                  <Image src={c.image} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-contain p-3" unoptimized={skipOptimization(c.image)} />
                </div>
              )}
              <span className="font-bold group-hover:text-brand-700">{c.name}</span>
              <span className="mt-1 block text-xs text-muted">{c.children.map((ch) => ch.name).join(" · ")}</span>
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
          <ProductGrid products={sale.slice(0, 4)} />
        </section>
      )}

      {hits.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">Хиты продаж</h2>
          <ProductGrid products={hits} />
        </section>
      )}

      <section className="rounded-3xl bg-surface p-6 sm:p-10">
        <h2 className="mb-6 text-xl font-extrabold sm:text-2xl">Почему покупают у нас</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((a) => (
            <div key={a.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
                <a.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold sm:text-2xl">Советы покупателям</h2>
            <Link href="/blog" className="text-sm font-semibold text-brand-700 hover:underline">Все статьи</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col items-start gap-4 rounded-3xl border border-line p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-extrabold">Не нашли нужное или сомневаетесь в выборе?</h2>
          <p className="mt-1 text-muted">Оставьте номер — перезвоним и поможем подобрать. Под заказ привезём то, чего нет в каталоге.</p>
        </div>
        <RequestDialog type="CALLBACK" buttonText="Перезвоните мне" buttonClassName="btn shrink-0 bg-brand-600 text-white hover:bg-brand-700" />
      </section>
    </div>
  );
}
