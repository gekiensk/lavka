// Шапка сайта. Серверный компонент: берёт контакты и категории из базы.
import Link from "next/link";
import { Clock, MapPin, Phone, Send } from "lucide-react";
import { getCategoryTree, getSettings, categoryUrl } from "@/lib/catalog";
import { phoneHref, telegramHref } from "@/lib/contacts";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { MobileMenu } from "./MobileMenu";
import { CartLink } from "@/components/cart/CartLink";
import { RequestDialog } from "@/components/ui/RequestDialog";

export async function Header() {
  const [settings, tree] = await Promise.all([getSettings(), getCategoryTree()]);

  const menu = tree.map((c) => ({
    name: c.name,
    url: categoryUrl([c.slug]),
    children: c.children.map((ch) => ({ name: ch.name, url: categoryUrl([c.slug, ch.slug]) })),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      {/* Верхняя полоска с адресом и часами — только на планшетах и компьютерах */}
      <div className="hidden bg-ink text-sm text-gray md:block">
        <div className="container-page flex h-9 items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {settings.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {settings.hours}
          </span>
          <nav className="ml-auto flex items-center gap-5">
            <RequestDialog type="CALLBACK" buttonText="Перезвоните мне" buttonClassName="font-semibold text-brand-300 hover:text-white" />
            <Link href="/delivery" className="hover:text-white">Доставка и оплата</Link>
            <Link href="/about" className="hover:text-white">О магазине</Link>
            <Link href="/contacts" className="hover:text-white">Контакты</Link>
          </nav>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
        <MobileMenu menu={menu} settings={settings} />
        <Logo />

        <div className="hidden flex-1 md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-3">
          {settings.phone && (
            <a href={phoneHref(settings.phone)} className="hidden flex-col items-end leading-tight lg:flex">
              <span className="font-bold text-ink">{settings.phone}</span>
              <span className="text-xs text-muted">звоните, подскажем</span>
            </a>
          )}
          {settings.phone && (
            <a
              href={phoneHref(settings.phone)}
              className="rounded-lg p-2.5 text-brand-700 hover:bg-brand-50 lg:hidden"
              aria-label="Позвонить"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
          {settings.telegram && (
            <a
              href={telegramHref(settings.telegram)}
              target="_blank"
              rel="noopener"
              className="rounded-lg p-2.5 text-brand-700 hover:bg-brand-50"
              aria-label="Написать в Telegram"
            >
              <Send className="h-5 w-5" />
            </a>
          )}
          <CartLink />
        </div>
      </div>

      {/* Поиск на телефоне — отдельной строкой под логотипом */}
      <div className="container-page pb-3 md:hidden">
        <SearchBox />
      </div>

      {/* Меню категорий на компьютере */}
      <nav className="hidden border-t border-line lg:block" aria-label="Категории">
        <ul className="container-page flex h-12 items-center gap-1 text-[15px] font-semibold">
          <li>
            <Link href="/catalog" className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
              Каталог
            </Link>
          </li>
          {menu.map((c) => (
            <li key={c.url} className="group relative">
              <Link href={c.url} className="block rounded-lg px-3 py-2 text-ink hover:bg-surface">
                {c.name}
              </Link>
              {c.children.length > 0 && (
                <ul className="invisible absolute left-0 top-full z-50 min-w-60 rounded-xl border border-line bg-white p-2 font-medium opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {c.children.map((ch) => (
                    <li key={ch.url}>
                      <Link href={ch.url} className="block rounded-lg px-3 py-2 text-ink hover:bg-surface">
                        {ch.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li className="ml-auto">
            <Link href="/sale" className="rounded-lg px-3 py-2 text-sale hover:bg-surface">
              Акции
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
