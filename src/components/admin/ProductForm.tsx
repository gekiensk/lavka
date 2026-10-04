// Форма товара (создание и редактирование).
import { db } from "@/lib/db";
import { categoryOptions } from "@/lib/admin-data";
import { AdminForm } from "./AdminForm";
import { AttributesEditor } from "./AttributesEditor";
import { ImagesEditor } from "./ImagesEditor";
import { Checkbox, Panel, Select, TextArea, TextField } from "./fields";
import { saveProduct } from "@/app/admin/actions/products";
import type { Prisma } from "@/generated/prisma/client";

type Product = Prisma.ProductGetPayload<{ include: { brand: true; images: true; attributes: { include: { attribute: true } } } }>;

export async function ProductForm({ product }: { product?: Product }) {
  const [categories, brands, attributes] = await Promise.all([
    categoryOptions(),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    db.attribute.findMany({ orderBy: { name: "asc" }, select: { name: true, unit: true } }),
  ]);
  const p = product;

  return (
    <AdminForm action={saveProduct.bind(null, p?.id ?? null)} submitText={p ? "Сохранить" : "Создать товар"}>
      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <Panel title="Основное">
            <TextField label="Название *" name="name" defaultValue={p?.name} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Артикул *" name="sku" defaultValue={p?.sku} required />
              <TextField label="Бренд" name="brand" list="brands" defaultValue={p?.brand?.name ?? ""} hint="Новый бренд создастся сам" />
            </div>
            <datalist id="brands">{brands.map((b) => <option key={b.name} value={b.name} />)}</datalist>
            <Select label="Категория *" name="categoryId" defaultValue={p?.categoryId} options={[{ value: "", label: "— выберите —" }, ...categories]} required />
            <TextArea label="Описание" name="description" rows={7} defaultValue={p?.description ?? ""} hint="Абзацы разделяйте пустой строкой" />
          </Panel>

          <Panel title="Фото">
            <ImagesEditor key={p?.images.map((i) => i.id).join(",")} initial={p ? [...p.images].sort((a, b) => a.sortOrder - b.sortOrder) : []} />
          </Panel>

          <Panel title="Характеристики">
            <AttributesEditor
              key={p?.updatedAt.toISOString()}
              initial={p?.attributes.map((a) => ({ name: a.attribute.name, value: a.value })) ?? []}
              knownNames={attributes.map((a) => a.name)}
            />
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Цена и наличие">
            <TextField label="Цена, ₽ *" name="price" inputMode="numeric" defaultValue={p?.price} required />
            <TextField label="Старая цена, ₽" name="oldPrice" inputMode="numeric" defaultValue={p?.oldPrice ?? ""} hint="Заполните — и товар попадёт в «Акции»" />
            <Select label="Наличие" name="stock" defaultValue={p?.stock ?? "IN_STOCK"} options={[{ value: "IN_STOCK", label: "В наличии" }, { value: "ON_ORDER", label: "Под заказ" }]} />
            <TextField label="Единица" name="unit" defaultValue={p?.unit ?? "шт"} hint="шт, м, компл." />
            <Checkbox label="Показывать на сайте" name="isActive" defaultChecked={p?.isActive ?? true} />
            <Checkbox label="Хит продаж (на главной)" name="isHit" defaultChecked={p?.isHit ?? false} />
          </Panel>
          <Panel title="SEO">
            <TextField label="Адрес страницы" name="slug" defaultValue={p?.slug} hint="Пусто — создастся из названия" />
            <TextField label="Заголовок (title)" name="metaTitle" defaultValue={p?.metaTitle ?? ""} hint="Пусто — название товара" />
            <TextArea label="Описание (description)" name="metaDesc" rows={3} defaultValue={p?.metaDesc ?? ""} />
          </Panel>
        </div>
      </div>
    </AdminForm>
  );
}
