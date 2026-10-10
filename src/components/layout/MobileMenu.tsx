"use client";
// Выезжающее меню для телефона: категории, ссылки на страницы и контакты.
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Phone, Send, X } from "lucide-react";
import type { SiteSettings } from "@/lib/catalog";
import { phoneHref, telegramHref } from "@/lib/contacts";

type MenuItem = { name: string; url: string; children: { name: string; url: string }[] };

export function MobileMenu({ menu, settings }: { menu: MenuItem[]; settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  // Пока меню открыто, страница под ним не прокручивается
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-2 rounded-full p-2.5 text-ink hover:bg-surface lg:hidden"
        aria-label="Открыть меню"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col rounded-r-[2rem] bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <span className="font-display text-lg font-extrabold">Меню</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-surface" aria-label="Закрыть меню">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Клик по любой ссылке закрывает меню */}
            <nav
              className="flex-1 overflow-y-auto p-2"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              <Link href="/catalog" className="mb-1 flex items-center justify-center rounded-full bg-ink px-3 py-3 font-bold text-white">
                Весь каталог
              </Link>
              {menu.map((c) => (
                <details key={c.url} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 font-semibold hover:bg-surface">
                    {c.name}
                    <ChevronDown className="h-5 w-5 text-muted transition group-open:rotate-180" />
                  </summary>
                  <div className="pb-2 pl-4">
                    <Link href={c.url} className="block rounded-xl px-3 py-2 text-brand-700">
                      Все товары раздела
                    </Link>
                    {c.children.map((ch) => (
                      <Link key={ch.url} href={ch.url} className="block rounded-xl px-3 py-2 text-ink hover:bg-surface">
                        {ch.name}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
              <Link href="/sale" className="block rounded-xl px-3 py-3 font-semibold text-sale">Акции</Link>
              <hr className="my-2 border-line" />
              {[
                ["/about", "О магазине"],
                ["/delivery", "Доставка и оплата"],
                ["/warranty", "Гарантия и возврат"],
                ["/blog", "Статьи и советы"],
                ["/contacts", "Контакты"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-ink hover:bg-surface">
                  {label}
                </Link>
              ))}
            </nav>

            <div className="space-y-2 border-t border-line p-4 text-sm">
              <p className="text-muted">{settings.hours}</p>
              <div className="flex gap-2">
                {settings.phone && (
                  <a href={phoneHref(settings.phone)} className="btn flex-1 bg-ink text-white">
                    <Phone className="h-4 w-4" /> Позвонить
                  </a>
                )}
                {settings.telegram && (
                  <a href={telegramHref(settings.telegram)} target="_blank" rel="noopener" className="btn flex-1 border border-line text-ink">
                    <Send className="h-4 w-4" /> Telegram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
