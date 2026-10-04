// Список статей и советов
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getPosts } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = pageMeta({
  title: "Статьи и советы",
  description: "Советы по выбору сантехники: смесители, водонагреватели, трубы и фитинги. Сантехническая лавка «Дело Труба», Тюмень.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Статьи и советы", url: "/blog" }]} />
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">Статьи и советы</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
