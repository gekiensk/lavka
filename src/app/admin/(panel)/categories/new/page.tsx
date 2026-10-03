import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/fields";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Новая категория" };

export default function NewCategoryPage() {
  return (
    <>
      <PageTitle>Новая категория</PageTitle>
      <CategoryForm />
    </>
  );
}
