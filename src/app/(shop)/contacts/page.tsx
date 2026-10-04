// Контакты: адрес, часы работы, кнопки связи, карта.
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { getSettings } from "@/lib/catalog";
import { phoneHref, telegramHref } from "@/lib/contacts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RequestDialog } from "@/components/ui/RequestDialog";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Адрес, телефон и часы работы магазина сантехники «СанТех Лавка» в Тюмени. Как проехать.",
  alternates: { canonical: "/contacts" },
};

export default async function ContactsPage() {
  const s = await getSettings();
  // Карта Яндекса по адресу из настроек — без API-ключа
  const mapSrc = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(s.address)}&z=16`;
  const routeHref = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(s.address)}`;

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Контакты", url: "/contacts" }]} />
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">Контакты</h1>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-5">
          <Item icon={<MapPin />} title="Адрес">
            {s.address}
            <a href={routeHref} target="_blank" rel="noopener" className="mt-1 block text-sm font-semibold text-brand-700 hover:underline">
              Построить маршрут
            </a>
          </Item>
          <Item icon={<Clock />} title="Часы работы">{s.hours}</Item>
          {s.phone && (
            <Item icon={<Phone />} title="Телефон">
              <a href={phoneHref(s.phone)} className="text-lg font-bold">{s.phone}</a>
            </Item>
          )}
          {s.telegram && (
            <Item icon={<Send />} title="Telegram">
              <a href={telegramHref(s.telegram)} target="_blank" rel="noopener" className="text-brand-700 hover:underline">
                @{s.telegram.replace(/^@/, "")}
              </a>
            </Item>
          )}
          {s.email && (
            <Item icon={<Mail />} title="Email">
              <a href={`mailto:${s.email}`} className="text-brand-700 hover:underline">{s.email}</a>
            </Item>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {s.phone && <a href={phoneHref(s.phone)} className="btn bg-brand-600 text-white hover:bg-brand-700"><Phone className="h-4 w-4" /> Позвонить</a>}
            {s.telegram && <a href={telegramHref(s.telegram)} target="_blank" rel="noopener" className="btn border border-line"><Send className="h-4 w-4" /> Написать</a>}
            <RequestDialog type="CALLBACK" buttonText="Перезвоните мне" buttonClassName="btn border border-line" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <iframe src={mapSrc} title={`Карта: ${s.address}`} loading="lazy" className="h-80 w-full sm:h-[28rem]" />
        </div>
      </div>
    </div>
  );
}

function Item({ icon, title, children }: { icon: React.ReactElement; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-brand-500 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div>
        <div className="text-sm text-muted">{title}</div>
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}
