// Статья блога
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost } from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Markdown } from "@/components/ui/Markdown";

type Props = PageProps<"/blog/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDesc ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt ?? undefined, publishedTime: post.publishedAt?.toISOString() },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Статьи и советы", url: "/blog" }, { name: post.title, url: `/blog/${post.slug}` }]} />
      <article className="max-w-3xl">
        <time className="text-sm text-muted">{formatDate(post.publishedAt)}</time>
        <h1 className="mb-6 mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{post.title}</h1>
        <Markdown>{post.content}</Markdown>
        <div className="mt-10 rounded-2xl bg-surface p-5">
          <p className="font-semibold">Остались вопросы?</p>
          <p className="mt-1 text-sm text-muted">Подскажем по телефону, в Telegram или в магазине.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/catalog" className="btn bg-brand-600 text-white hover:bg-brand-700">В каталог</Link>
            <Link href="/contacts" className="btn border border-line bg-white">Контакты</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
