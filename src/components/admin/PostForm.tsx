import { AdminForm } from "./AdminForm";
import { ImageField } from "./ImageField";
import { MarkdownHelp } from "./MarkdownHelp";
import { Checkbox, Panel, TextArea, TextField } from "./fields";
import { savePost } from "@/app/admin/actions/content";
import type { Post } from "@/generated/prisma/client";

export function PostForm({ post: p }: { post?: Post }) {
  return (
    <AdminForm action={savePost.bind(null, p?.id ?? null)} submitText={p ? "Сохранить" : "Создать статью"}>
      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <Panel>
          <TextField label="Заголовок *" name="title" defaultValue={p?.title} required />
          <TextArea label="Краткое описание" name="excerpt" rows={2} defaultValue={p?.excerpt ?? ""} hint="Показывается в списке статей" />
          <TextArea label="Текст *" name="content" rows={22} defaultValue={p?.content} className="font-mono" required />
          <MarkdownHelp />
        </Panel>
        <div className="space-y-5">
          <Panel title="Публикация">
            <Checkbox label="Опубликована" name="isPublished" defaultChecked={p?.isPublished ?? false} />
            <ImageField label="Обложка" name="cover" current={p?.cover} />
          </Panel>
          <Panel title="SEO">
            <TextField label="Адрес" name="slug" defaultValue={p?.slug} hint="Пусто — из заголовка" />
            <TextField label="Заголовок (title)" name="metaTitle" defaultValue={p?.metaTitle ?? ""} />
            <TextArea label="Описание (description)" name="metaDesc" rows={3} defaultValue={p?.metaDesc ?? ""} />
          </Panel>
        </div>
      </div>
    </AdminForm>
  );
}
