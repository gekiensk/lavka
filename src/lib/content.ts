// Запросы к контенту: текстовые страницы, статьи, баннеры.
import { cache } from "react";
import { db } from "@/lib/db";

export const getPage = cache((slug: string) => db.page.findUnique({ where: { slug } }));

export const getBanners = () =>
  db.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

export const getPosts = (limit?: number) =>
  db.post.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { slug: true, title: true, excerpt: true, cover: true, publishedAt: true },
  });

export const getPost = cache((slug: string) =>
  db.post.findFirst({ where: { slug, isPublished: true } }),
);

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
export const formatDate = (d: Date | null) => (d ? dateFormat.format(d) : "");
