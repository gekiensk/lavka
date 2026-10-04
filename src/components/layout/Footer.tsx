// Подвал сайта: разделы каталога, информация для покупателей, контакты.
import Link from "next/link";
import { getCategoryTree, getSettings, categoryUrl } from "@/lib/catalog";
import { phoneHref, telegramHref } from "@/lib/contacts";
import { Logo } from "./Logo";

export async function Footer() {
  const [settings, tree] = await Promise.all([getSettings(), getCategoryTree()]);

  return (
    <footer className="mt-16 border-t border-line bg-surface text-sm">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-muted">
            Магазин сантехники в {settings.city === "Тюмень" ? "Тюмени" : settings.city}. Товары для частных покупателей и мастеров.
          </p>
        </div>

        <div>
          <h2 className="mb-3 font-bold">Каталог</h2>
          <ul className="space-y-2">
            {tree.map((c) => (
              <li key={c.id}>
                <Link href={categoryUrl([c.slug])} className="text-muted hover:text-ink">{c.name}</Link>
              </li>
            ))}
            <li><Link href="/sale" className="text-muted hover:text-ink">Акции</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-bold">Покупателям</h2>
          <ul className="space-y-2">
            {[
              ["/delivery", "Доставка и оплата"],
              ["/warranty", "Гарантия и возврат"],
              ["/blog", "Статьи и советы"],
              ["/about", "О магазине"],
              ["/privacy", "Политика конфиденциальности"],
            ].map(([href, label]) => (
              <li key={href}><Link href={href} className="text-muted hover:text-ink">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="mb-3 font-bold">Контакты</h2>
          {settings.phone && (
            <a href={phoneHref(settings.phone)} className="block text-base font-bold text-ink">{settings.phone}</a>
          )}
          {settings.telegram && (
            <a href={telegramHref(settings.telegram)} target="_blank" rel="noopener" className="block text-brand-700 hover:underline">
              Telegram: @{settings.telegram.replace(/^@/, "")}
            </a>
          )}
          <p className="text-muted">{settings.address}</p>
          <p className="text-muted">{settings.hours}</p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-1 py-4 text-xs text-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} СанТех Лавка</span>
          <span>Информация на сайте не является публичной офертой</span>
        </div>
      </div>
    </footer>
  );
}
