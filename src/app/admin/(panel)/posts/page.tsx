import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/content";
import { PageTitle } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Статьи" };

export default async function PostsPage() {
  const posts = await db.post.findMany({ orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }] });
  return (
    <>
      <PageTitle actions={<Link href="/admin/posts/new" className="btn bg-brand-600 text-white hover:bg-brand-700">+ Новая статья</Link>}>Статьи</PageTitle>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white text-sm">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <Link href={`/admin/posts/${p.id}`} className="font-semibold text-brand-700 hover:underline">{p.title}</Link>
            <span className="shrink-0 text-muted">{p.isPublished ? formatDate(p.publishedAt) : "черновик"}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
