// Шаблон публичной части магазина: шапка, содержимое страницы, подвал.
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd, storeJsonLd } from "@/components/seo/JsonLd";
import { getSettings } from "@/lib/catalog";

// Страницы магазина берут данные из базы при каждом запросе,
// поэтому изменения цен и наличия видны сразу. (Кэширование настроим на этапе SEO.)
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <JsonLd data={storeJsonLd(settings)} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
