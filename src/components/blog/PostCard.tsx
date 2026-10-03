import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/content";

type Post = { slug: string; title: string; excerpt: string | null; cover: string | null; publishedAt: Date | null };

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand-200 hover:shadow-md">
      {post.cover && (
        <div className="relative aspect-[16/9] bg-surface">
          <Image src={post.cover} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-4" unoptimized={post.cover.endsWith(".svg")} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <time className="text-xs text-muted">{formatDate(post.publishedAt)}</time>
        <h2 className="mt-1 text-lg font-bold leading-snug group-hover:text-brand-700">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
        </h2>
        {post.excerpt && <p className="mt-2 text-sm text-muted">{post.excerpt}</p>}
      </div>
    </article>
  );
}
