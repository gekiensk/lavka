// Текстовые страницы из базы: /about, /delivery, /warranty, /privacy, /consent.
// Тексты редактируются в админке (раздел «Страницы»).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Markdown } from "@/components/ui/Markdown";

type Props = PageProps<"/[page]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).page);
  if (!page) return {};
  return pageMeta({ title: page.metaTitle ?? page.title, description: page.metaDesc, path: `/${page.slug}` });
}

export default async function TextPage({ params }: Props) {
  const page = await getPage((await params).page);
  if (!page) notFound();

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: page.title, url: `/${page.slug}` }]} />
      <article className="max-w-3xl">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{page.title}</h1>
        <Markdown>{page.content}</Markdown>
      </article>
    </div>
  );
}
