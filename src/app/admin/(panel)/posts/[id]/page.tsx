import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/fields";
import { PostForm } from "@/components/admin/PostForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deletePost } from "../../../actions/content";

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  const post = await db.post.findUnique({ where: { id: Number((await params).id) || 0 } });
  if (!post) notFound();
  return (
    <>
      <PageTitle
        actions={
          <div className="flex gap-2">
            {post.isPublished && <Link href={`/blog/${post.slug}`} target="_blank" className="btn border border-line bg-white">Открыть ↗</Link>}
            <ConfirmButton action={deletePost.bind(null, post.id)} confirmText="Удалить статью?">Удалить</ConfirmButton>
          </div>
        }
      >
        {post.title}
      </PageTitle>
      <PostForm post={post} />
    </>
  );
}
