// Корневой шаблон: язык, шрифт, базовые мета-теги. Шапка и подвал — в app/(shop)/layout.tsx.
import type { Metadata, Viewport } from "next";
import { Manrope, Montserrat } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Плотный шрифт для логотипа и крупных заголовков — как на вывеске
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Дело Труба — сантехническая лавка в Тюмени",
    template: "%s — Дело Труба",
  },
  description:
    "Всё для воды, тепла и ремонта рядом: смесители, унитазы, ванны, трубы и фитинги, водонагреватели и радиаторы в Тюмени. Цены, наличие, заказ онлайн, доставка по городу и самовывоз.",
  openGraph: {
    type: "website",
    siteName: "Дело Труба",
    locale: "ru_RU",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1f2937",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
