// Мета-теги страницы: title, description, канонический адрес и Open Graph (превью в мессенджерах и соцсетях).
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

type Input = {
  title: string;
  description?: string | null;
  path: string;
  /** Картинки для превью; SVG-заглушки пропускаются, вместо них — общая картинка сайта */
  images?: string[];
  type?: "website" | "article";
  noindex?: boolean;
};

export function pageMeta({ title, description, path, images = [], type = "website", noindex }: Input): Metadata {
  const ogImages = images.filter((i) => !i.endsWith(".svg"));
  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "ru_RU",
      title,
      description: description ?? undefined,
      url: path,
      images: ogImages.length ? ogImages : ["/og.png"],
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
