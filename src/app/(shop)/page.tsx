// Главная страница: баннеры, популярные разделы, акции, хиты, преимущества, статьи.
import { skipOptimization } from "@/lib/images";
import Link from "next/link";
import Image from "next/image";
import { BadgePercent, Clock, MapPin, PackageCheck, Phone, ShieldCheck, Truck, Wrench, Wallet } from "lucide-react";
import { categoryUrl, getCategoryTree, getHits, getSaleProducts, getSettings } from "@/lib/catalog";
import { getBanners, getPosts } from "@/lib/content";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { BannerSlider } from "@/components/home/BannerSlider";
import { PostCard } from "@/components/blog/PostCard";
import { RequestDialog } from "@/components/ui/RequestDialog";
import { phoneHref } from "@/lib/contacts";

// Преимущества магазина. Поменять текст можно здесь.
const ADVANTAGES = [
  { icon: PackageCheck, title: "Всё в наличии", text: "Популярные товары на складе магазина — можно забрать сегодня" },
  { icon: Truck, title: "Доставка по городу", text: "Привезём заказ в удобный день или соберём к самовывозу" },
  { icon: Wallet, title: "Оплата при получении", text: "Наличными или картой — после того, как проверите товар" },
  { icon: ShieldCheck, title: "Официальная гарантия", text: "Только оригинальная продукция с гарантией производителя" },
  { icon: Wrench, title: "Для мастеров", text: "Трубы, фитинги и расходники всегда в запасе, заказ заранее" },
  { icon: BadgePercent, title: "Честные цены", text: "Регулярные акции и скидки на популярные товары" },
];

// Раскладка популярных разделов, когда их ровно четыре: один крупный, один широкий, два обычных
const BENTO = [
  "col-span-2 lg:row-span-2",
  "col-span-2",
  "",
  "",
];

// Заголовок раздела со ссылкой «Все …» справа
function SectionHead({ title, href, linkText }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
      <h2 className="section-title">{title}</h2>
      {href && (
        <Link href={href} className="btn min-h-10 shrink-0 border border-line px-4 text-sm hover:border-ink">
          {linkText}
        </Link>
      )}
    </div>
  );
}

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

  const bento = popular.length === 4;
  // Если баннеров нет, на их месте — слоган лавки
  const slides = banners.length
    ? banners
    : [{ id: 0, title: "Всё для воды, тепла и ремонта рядом", subtitle: `Сантехническая лавка в ${city}: смесители, трубы, отопление и всё, что к ним нужно.`, image: null, link: "/catalog" }];

  return (
    <div className="container-page space-y-16 pt-4 sm:space-y-24 sm:pt-6">
      {/* Главный заголовок страницы для поисковиков */}
      <h1 className="sr-only">Дело Труба — сантехническая лавка в {city}</h1>

      <div className="grid gap-3 lg:grid-cols-[1fr_19rem]">
        <BannerSlider banners={slides} />

        {/* Карточка лавки: куда прийти и как связаться */}
        <aside className="flex flex-col rounded-[2rem] bg-surface p-6 sm:p-7">
          <h2 className="text-xl font-extrabold">Приходите в лавку</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <span>{settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <span>{settings.hours}</span>
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-2 lg:mt-auto lg:pt-6">
            {settings.phone && (
              <a href={phoneHref(settings.phone)} className="btn bg-ink text-white hover:bg-ink-soft">
                <Phone className="h-4 w-4" aria-hidden /> <span className="tabular">{settings.phone}</span>
              </a>
            )}
            <RequestDialog type="CALLBACK" buttonText="Перезвоните мне" buttonClassName="btn border border-ink/15 bg-white text-ink hover:border-ink" />
            <Link href="/contacts" className="mt-1 text-center text-sm font-semibold text-brand-700 hover:underline">Как добраться</Link>
          </div>
        </aside>
      </div>

      <section>
        <SectionHead title="Популярные разделы" href="/catalog" linkText="Весь каталог" />
        <div className={`grid grid-cols-2 gap-3 ${bento ? "lg:grid-cols-4 lg:grid-rows-2" : "lg:grid-cols-4"}`}>
          {popular.map((c, i) => {
            const big = bento && i === 0;
            const wide = bento && i < 2;
            return (
              <Link
                key={c.id}
                href={categoryUrl([c.slug])}
                className={`group relative flex min-h-44 flex-col overflow-hidden rounded-[1.75rem] bg-surface p-5 transition-colors hover:bg-brand-50 sm:p-6 ${bento ? BENTO[i] : ""} ${big ? "lg:min-h-[26rem]" : ""}`}
              >
                <span className={`relative z-10 hyphens-auto break-words font-display font-extrabold leading-tight tracking-tight ${big ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>
                  {c.name}
                </span>
                <span className={`relative z-10 mt-2 text-sm text-muted ${big ? "max-w-[60%] sm:max-w-xs" : wide ? "line-clamp-2 max-w-[60%]" : "hidden max-w-[60%] sm:line-clamp-2"}`}>
                  {c.children.map((ch) => ch.name).join(", ")}
                </span>
                {c.image && (
                  <span
                    className={`absolute transition-transform duration-300 group-hover:-translate-y-1 ${
                      big ? "bottom-3 right-3 h-24 w-24 sm:h-28 sm:w-28 lg:bottom-4 lg:right-4 lg:h-3/5 lg:w-3/5" : "bottom-3 right-3 h-16 w-16 sm:h-28 sm:w-28"
                    }`}
                  >
                    <Image src={c.image} alt="" fill sizes={big ? "(max-width: 1024px) 60vw, 25vw" : "112px"} className="object-contain" unoptimized={skipOptimization(c.image)} />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {sale.length > 0 && (
        <section>
          <SectionHead title="Акции" href="/sale" linkText="Все акции" />
          <ProductGrid products={sale.slice(0, 4)} />
        </section>
      )}

      {hits.length > 0 && (
        <section>
          <SectionHead title="Хиты продаж" />
          <ProductGrid products={hits} />
        </section>
      )}

      <section className="rounded-[2rem] bg-ink p-6 text-white sm:p-10 lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-14">
          <div>
            <h2 className="section-title">Почему покупают у нас</h2>
            {/* Слоган с вертикальной чертой, как в брендбуке */}
            <p className="mt-5 border-l-2 border-brand-500 pl-3 text-gray">Всё для воды, тепла и ремонта рядом</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((a) => (
              <div key={a.title} className="bg-ink p-5 sm:p-6">
                <a.icon className="h-6 w-6 text-brand-400" aria-hidden />
                <h3 className="mt-4 font-bold">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section>
          <SectionHead title="Советы покупателям" href="/blog" linkText="Все статьи" />
          <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-brand-500 p-6 text-ink sm:p-10 lg:p-14">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="section-title">Не нашли нужное или сомневаетесь в выборе?</h2>
            <p className="mt-3 text-lg text-ink/80">Оставьте номер — перезвоним и поможем подобрать. Под заказ привезём то, чего нет в каталоге.</p>
          </div>
          <RequestDialog type="CALLBACK" buttonText="Перезвоните мне" buttonClassName="btn shrink-0 bg-ink px-7 text-white hover:bg-ink-soft" />
        </div>
      </section>
    </div>
  );
}
