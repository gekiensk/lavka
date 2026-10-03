import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/fields";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Новый товар" };

export default function NewProductPage() {
  return (
    <>
      <PageTitle>Новый товар</PageTitle>
      <ProductForm />
    </>
  );
}
