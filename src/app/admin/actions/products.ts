"use server";
// Создание, изменение и удаление товаров.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { bool, int, str, uniqueError } from "@/lib/form-data";
import { findOrCreateBrand, setProductAttributes, uniqueProductSlug } from "@/lib/attributes";
import { saveImage } from "@/lib/uploads";
import type { ActionResult } from "@/components/admin/AdminForm";

export async function saveProduct(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();

  const name = str(fd, "name");
  const sku = str(fd, "sku");
  const categoryId = int(fd, "categoryId");
  const price = int(fd, "price");
  const oldPrice = int(fd, "oldPrice");
  const stock = fd.get("stock") === "ON_ORDER" ? "ON_ORDER" : "IN_STOCK";

  if (!name) return { ok: false, error: "Укажите название" };
  if (!sku) return { ok: false, error: "Укажите артикул" };
  if (!categoryId) return { ok: false, error: "Выберите категорию" };
  if (price === null || Number.isNaN(price) || price < 0) return { ok: false, error: "Проверьте цену" };
  if (oldPrice !== null && (Number.isNaN(oldPrice) || oldPrice <= price)) {
    return { ok: false, error: "Старая цена должна быть больше текущей (или оставьте поле пустым)" };
  }

  // Новые фото сохраняем до транзакции: запись файлов на диск — долгая операция
  let newImages: string[] = [];
  try {
    const files = fd.getAll("newImages").filter((f): f is File => f instanceof File && f.size > 0);
    newImages = await Promise.all(files.map(saveImage));
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  // Характеристики приходят парами attrName / attrValue
  const attrNames = fd.getAll("attrName").map(String);
  const attrValues = fd.getAll("attrValue").map(String);
  const attrs = attrNames.map((n, i) => ({ name: n, value: attrValues[i] ?? "" }));

  // Оставшиеся фото — в новом порядке, с подписями
  const keepImageIds = fd.getAll("imageId").map(Number);

  let productId = id;
  try {
    productId = await db.$transaction(async (tx) => {
      const brandName = str(fd, "brand");
      const brand = brandName ? await findOrCreateBrand(tx, brandName) : null;
      const slug = await uniqueProductSlug(tx, str(fd, "slug") ?? name, sku, id ?? undefined);

      const data = {
        name, sku, slug, categoryId, price, oldPrice, stock,
        brandId: brand?.id ?? null,
        unit: str(fd, "unit") ?? "шт",
        description: str(fd, "description"),
        isHit: bool(fd, "isHit"),
        isActive: bool(fd, "isActive"),
        metaTitle: str(fd, "metaTitle"),
        metaDesc: str(fd, "metaDesc"),
      } as const;

      const product = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });

      await setProductAttributes(tx, product.id, attrs);

      // Фото: удаляем убранные, обновляем порядок и подписи, добавляем новые
      if (id) {
        await tx.productImage.deleteMany({ where: { productId: id, id: { notIn: keepImageIds } } });
        for (const [order, imageId] of keepImageIds.entries()) {
          await tx.productImage.updateMany({
            where: { id: imageId, productId: id },
            data: { sortOrder: order, alt: str(fd, `imageAlt_${imageId}`) },
          });
        }
      }
      await tx.productImage.createMany({
        data: newImages.map((url, i) => ({ productId: product.id, url, sortOrder: keepImageIds.length + i })),
      });

      return product.id;
    });
  } catch (e) {
    const msg = uniqueError(e, { sku: "Товар с таким артикулом уже есть", slug: "Такой адрес страницы уже занят" });
    if (msg) return { ok: false, error: msg };
    throw e;
  }

  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/products/${productId}`);
  return { ok: true, message: newImages.length ? `Сохранено, добавлено фото: ${newImages.length}` : "Сохранено" };
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  // Позиции старых заказов сохранятся: в них записаны название и цена
  await db.product.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
