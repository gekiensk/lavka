import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/fields";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteCategory } from "../../../actions/content";

export const metadata: Metadata = { title: "Категория" };

export default async function EditCategoryPage({ params, searchParams }: PageProps<"/admin/categories/[id]">) {
  const category = await db.category.findUnique({ where: { id: Number((await params).id) || 0 }, include: { attributes: true } });
  if (!category) notFound();
  const { error } = await searchParams;

  return (
    <>
      <PageTitle actions={<ConfirmButton action={deleteCategory.bind(null, category.id)} confirmText={`Удалить категорию «${category.name}»?`}>Удалить</ConfirmButton>}>
        {category.name}
      </PageTitle>
      {error === "not-empty" && (
        <p className="mb-4 rounded-xl bg-sale/10 p-3 text-sm text-sale">Нельзя удалить категорию, в которой есть товары или подкатегории. Сначала перенесите их.</p>
      )}
      <CategoryForm category={category} />
    </>
  );
}
