import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Загрузка фото и файлов импорта из админки (по умолчанию лимит 1 МБ)
      bodySizeLimit: "25mb",
    },
  },
  images: {
    // Внешние фото (например, ссылки из файла импорта) показываются без оптимизации,
    // поэтому здесь разрешены только локальные картинки.
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/uploads/**" }],
  },
};

export default nextConfig;
