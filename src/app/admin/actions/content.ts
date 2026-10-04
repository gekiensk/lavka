"use server";
// Категории, баннеры, страницы, статьи и настройки.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { bool, int, str, uniqueError } from "@/lib/form-data";
import { slugify } from "@/lib/slug";
import { saveImage } from "@/lib/uploads";
import type { ActionResult } from "@/components/admin/AdminForm";
import { SETTING_FIELDS } from "@/lib/setting-fields";

/** Загрузить одно фото из поля формы, если оно выбрано; иначе — текущее значение (или null, если отмечено «удалить») */
async function imageField(fd: FormData, field: string, current: string | null) {
  const file = fd.get(field);
  if (file instanceof File && file.size > 0) return saveImage(file);
  if (bool(fd, `${field}Remove`)) return null;
  return current;
}

function done(message?: string): ActionResult {
  revalidatePath("/", "layout");
  return { ok: true, message };
}

function fail(e: unknown, messages: Record<string, string>): ActionResult {
  const msg = uniqueError(e, messages);
  if (msg) return { ok: false, error: msg };
  if (e instanceof Error && !("digest" in e)) return { ok: false, error: e.message };
  throw e;
}

// ───────────── Категории ─────────────

export async function saveCategory(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Укажите название" };
  const parentId = int(fd, "parentId") || null;
  if (id && parentId === id) return { ok: false, error: "Категория не может быть вложена сама в себя" };

  let savedId = id;
  try {
    const current = id ? await db.category.findUniqueOrThrow({ where: { id } }) : null;
    const data = {
      name,
      slug: slugify(str(fd, "slug") ?? name),
      parentId,
      description: str(fd, "description"),
      sortOrder: int(fd, "sortOrder") || 0,
      isPopular: bool(fd, "isPopular"),
      metaTitle: str(fd, "metaTitle"),
      metaDesc: str(fd, "metaDesc"),
      image: await imageField(fd, "image", current?.image ?? null),
    };
    const attrIds = fd.getAll("filterAttr").map(Number);

    savedId = await db.$transaction(async (tx) => {
      const c = id ? await tx.category.update({ where: { id }, data }) : await tx.category.create({ data });
      await tx.categoryAttribute.deleteMany({ where: { categoryId: c.id } });
      await tx.categoryAttribute.createMany({ data: attrIds.map((attributeId, i) => ({ categoryId: c.id, attributeId, sortOrder: i })) });
      return c.id;
    });
  } catch (e) {
    return fail(e, { slug: "Такой адрес категории уже занят" });
  }
  if (!id) redirect(`/admin/categories/${savedId}`);
  return done();
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const [products, children] = await Promise.all([
    db.product.count({ where: { categoryId: id } }),
    db.category.count({ where: { parentId: id } }),
  ]);
  if (products || children) {
    // Удалять можно только пустую категорию — иначе товары «потеряются»
    redirect(`/admin/categories/${id}?error=not-empty`);
  }
  await db.category.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

// ───────────── Баннеры ─────────────

export async function saveBanner(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const title = str(fd, "title");
  if (!title) return { ok: false, error: "Укажите заголовок" };
  try {
    const current = id ? await db.banner.findUniqueOrThrow({ where: { id } }) : null;
    const data = {
      title,
      subtitle: str(fd, "subtitle"),
      link: str(fd, "link"),
      sortOrder: int(fd, "sortOrder") || 0,
      isActive: bool(fd, "isActive"),
      image: await imageField(fd, "image", current?.image ?? null),
    };
    if (id) await db.banner.update({ where: { id }, data });
    else await db.banner.create({ data });
  } catch (e) {
    return fail(e, {});
  }
  if (!id) redirect("/admin/banners");
  return done();
}

export async function deleteBanner(id: number) {
  await requireAdmin();
  await db.banner.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/banners");
}

// ───────────── Страницы ─────────────

export async function savePage(id: number, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const title = str(fd, "title");
  const content = str(fd, "content");
  if (!title || !content) return { ok: false, error: "Заполните заголовок и текст" };
  await db.page.update({
    where: { id },
    data: { title, content, metaTitle: str(fd, "metaTitle"), metaDesc: str(fd, "metaDesc") },
  });
  return done();
}

// ───────────── Статьи ─────────────

export async function savePost(id: number | null, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const title = str(fd, "title");
  const content = str(fd, "content");
  if (!title || !content) return { ok: false, error: "Заполните заголовок и текст" };
  try {
    const current = id ? await db.post.findUniqueOrThrow({ where: { id } }) : null;
    const isPublished = bool(fd, "isPublished");
    const data = {
      title,
      content,
      slug: slugify(str(fd, "slug") ?? title),
      excerpt: str(fd, "excerpt"),
      metaTitle: str(fd, "metaTitle"),
      metaDesc: str(fd, "metaDesc"),
      isPublished,
      // Дата публикации ставится при первой публикации
      publishedAt: current?.publishedAt ?? (isPublished ? new Date() : null),
      cover: await imageField(fd, "cover", current?.cover ?? null),
    };
    if (id) await db.post.update({ where: { id }, data });
    else {
      const p = await db.post.create({ data });
      id = p.id;
      revalidatePath("/", "layout");
      redirect(`/admin/posts/${p.id}`);
    }
  } catch (e) {
    return fail(e, { slug: "Статья с таким адресом уже есть" });
  }
  return done();
}

export async function deletePost(id: number) {
  await requireAdmin();
  await db.post.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

// ───────────── Настройки ─────────────

export async function saveSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  for (const { key } of SETTING_FIELDS) {
    const value = str(fd, key) ?? "";
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  return done();
}
