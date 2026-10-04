// Корневой шаблон: язык, шрифт, базовые мета-теги. Шапка и подвал — в app/(shop)/layout.tsx.
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "СанТех Лавка — магазин сантехники в Тюмени",
    template: "%s — СанТех Лавка",
  },
  description:
    "Смесители, унитазы, ванны, трубы и фитинги, водонагреватели и радиаторы в Тюмени. Цены, наличие, заказ онлайн, доставка по городу и самовывоз.",
  openGraph: {
    type: "website",
    siteName: "СанТех Лавка",
    locale: "ru_RU",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#3f5f80",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
