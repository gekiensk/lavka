// Подвал сайта: разделы каталога, информация для покупателей, контакты.
import Link from "next/link";
import { getCategoryTree, getSettings, categoryUrl } from "@/lib/catalog";
import { phoneHref, telegramHref } from "@/lib/contacts";
import { Logo } from "./Logo";
import { RequestDialog } from "@/components/ui/RequestDialog";

export async function Footer() {
  const [settings, tree] = await Promise.all([getSettings(), getCategoryTree()]);

  return (
    <footer className="mt-16 bg-ink text-sm text-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo inverse />
          {/* Слоган с вертикальной чертой, как в брендбуке */}
          <p className="border-l-2 border-brand-500 pl-3 text-base font-semibold leading-snug">
            Всё для воды, тепла
            <br />и ремонта рядом
          </p>
          <p className="text-gray">
            Сантехническая лавка в {settings.city === "Тюмень" ? "Тюмени" : settings.city}. Для частных покупателей и мастеров.
          </p>
        </div>

        <div>
          <h2 className="mb-3 font-display font-extrabold uppercase tracking-wide text-white">Каталог</h2>
          <ul className="space-y-2">
            {tree.map((c) => (
              <li key={c.id}>
                <Link href={categoryUrl([c.slug])} className="text-gray hover:text-white">{c.name}</Link>
              </li>
            ))}
            <li><Link href="/sale" className="text-gray hover:text-white">Акции</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-display font-extrabold uppercase tracking-wide text-white">Покупателям</h2>
          <ul className="space-y-2">
            {[
              ["/delivery", "Доставка и оплата"],
              ["/warranty", "Гарантия и возврат"],
              ["/blog", "Статьи и советы"],
              ["/about", "О магазине"],
              ["/privacy", "Политика конфиденциальности"],
            ].map(([href, label]) => (
              <li key={href}><Link href={href} className="text-gray hover:text-white">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="mb-3 font-display font-extrabold uppercase tracking-wide text-white">Контакты</h2>
          {settings.phone && (
            <a href={phoneHref(settings.phone)} className="block text-base font-bold text-white">{settings.phone}</a>
          )}
          {settings.telegram && (
            <a href={telegramHref(settings.telegram)} target="_blank" rel="noopener" className="block text-brand-300 hover:underline">
              Telegram: @{settings.telegram.replace(/^@/, "")}
            </a>
          )}
          <p className="text-gray">{settings.address}</p>
          <p className="text-gray">{settings.hours}</p>
          <RequestDialog type="CALLBACK" buttonText="Перезвоните мне" buttonClassName="btn mt-2 bg-brand-600 text-white hover:bg-brand-500" />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-1 py-4 text-xs text-gray sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Дело Труба</span>
          <span>Информация на сайте не является публичной офертой</span>
        </div>
      </div>
    </footer>
  );
}
