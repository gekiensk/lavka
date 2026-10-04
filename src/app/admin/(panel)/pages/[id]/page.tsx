import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminForm } from "@/components/admin/AdminForm";
import { PageTitle, Panel, TextArea, TextField } from "@/components/admin/fields";
import { MarkdownHelp } from "@/components/admin/MarkdownHelp";
import { savePage } from "../../../actions/content";

export default async function EditPagePage({ params }: PageProps<"/admin/pages/[id]">) {
  const page = await db.page.findUnique({ where: { id: Number((await params).id) || 0 } });
  if (!page) notFound();
  return (
    <>
      <PageTitle actions={<Link href={`/${page.slug}`} target="_blank" className="btn border border-line bg-white">Открыть на сайте ↗</Link>}>{page.title}</PageTitle>
      <AdminForm action={savePage.bind(null, page.id)} className="max-w-4xl">
        <Panel>
          <TextField label="Заголовок" name="title" defaultValue={page.title} required />
          <TextArea label="Текст" name="content" rows={20} defaultValue={page.content} className="font-mono" required />
          <MarkdownHelp />
        </Panel>
        <Panel title="SEO">
          <TextField label="Заголовок (title)" name="metaTitle" defaultValue={page.metaTitle ?? ""} />
          <TextArea label="Описание (description)" name="metaDesc" rows={2} defaultValue={page.metaDesc ?? ""} />
        </Panel>
      </AdminForm>
    </>
  );
}
