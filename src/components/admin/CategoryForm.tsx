import { db } from "@/lib/db";
import { categoryOptions } from "@/lib/admin-data";
import { AdminForm } from "./AdminForm";
import { ImageField } from "./ImageField";
import { Checkbox, Panel, Select, TextArea, TextField } from "./fields";
import { saveCategory } from "@/app/admin/actions/content";
import type { Prisma } from "@/generated/prisma/client";

type Category = Prisma.CategoryGetPayload<{ include: { attributes: true } }>;

export async function CategoryForm({ category: c }: { category?: Category }) {
  const [parents, attributes] = await Promise.all([categoryOptions(), db.attribute.findMany({ orderBy: { name: "asc" } })]);
  const selected = new Set(c?.attributes.map((a) => a.attributeId));

  return (
    <AdminForm action={saveCategory.bind(null, c?.id ?? null)} submitText={c ? "Сохранить" : "Создать категорию"}>
      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <Panel title="Основное">
            <TextField label="Название *" name="name" defaultValue={c?.name} required />
            <Select
              label="Родительская категория"
              name="parentId"
              defaultValue={c?.parentId ?? ""}
              options={[{ value: "", label: "— нет (раздел верхнего уровня) —" }, ...parents.filter((p) => p.value !== c?.id)]}
            />
            <TextArea label="Описание внизу страницы категории" name="description" rows={4} defaultValue={c?.description ?? ""} hint="Текст для поисковиков: 2–4 предложения о разделе" />
          </Panel>
          <Panel title="Фильтры на странице категории">
            <p className="text-sm text-muted">Отметьте характеристики, по которым покупатели смогут отбирать товары. Цена, бренд и наличие показываются всегда.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {attributes.map((a) => (
                <Checkbox key={a.id} name="filterAttr" value={a.id} label={a.unit ? `${a.name}, ${a.unit}` : a.name} defaultChecked={selected.has(a.id)} />
              ))}
            </div>
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel title="Показ">
            <ImageField label="Картинка" name="image" current={c?.image} />
            <TextField label="Порядок" name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} hint="Меньше — выше в меню" />
            <Checkbox label="Популярная (на главной)" name="isPopular" defaultChecked={c?.isPopular ?? false} />
          </Panel>
          <Panel title="SEO">
            <TextField label="Адрес" name="slug" defaultValue={c?.slug} hint="Пусто — из названия" />
            <TextField label="Заголовок (title)" name="metaTitle" defaultValue={c?.metaTitle ?? ""} />
            <TextArea label="Описание (description)" name="metaDesc" rows={3} defaultValue={c?.metaDesc ?? ""} />
          </Panel>
        </div>
      </div>
    </AdminForm>
  );
}
