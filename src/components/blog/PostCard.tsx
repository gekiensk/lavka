import { skipOptimization } from "@/lib/images";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/content";

type Post = { slug: string; title: string; excerpt: string | null; cover: string | null; publishedAt: Date | null };

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col">
      {post.cover && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-surface transition-colors group-hover:bg-brand-50">
          <Image src={post.cover} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-4" unoptimized={skipOptimization(post.cover)} />
        </div>
      )}
      <div className="flex flex-1 flex-col pt-4">
        <time className="text-xs text-muted">{formatDate(post.publishedAt)}</time>
        <h2 className="mt-1.5 text-xl font-extrabold leading-snug group-hover:text-brand-700">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-[1.5rem]">{post.title}</Link>
        </h2>
        {post.excerpt && <p className="mt-2 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>}
      </div>
    </article>
  );
}
