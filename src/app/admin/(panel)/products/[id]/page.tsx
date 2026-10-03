import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/fields";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteProduct } from "../../../actions/products";

export const metadata: Metadata = { title: "Товар" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const product = await db.product.findUnique({
    where: { id: Number((await params).id) || 0 },
    include: { brand: true, images: true, attributes: { include: { attribute: true } } },
  });
  if (!product) notFound();

  return (
    <>
      <PageTitle
        actions={
          <div className="flex gap-2">
            <Link href={`/product/${product.slug}`} target="_blank" className="btn border border-line bg-white">Открыть на сайте ↗</Link>
            <ConfirmButton action={deleteProduct.bind(null, product.id)} confirmText={`Удалить «${product.name}»? Это нельзя отменить. Чтобы просто скрыть товар, снимите галочку «Показывать на сайте».`}>
              Удалить
            </ConfirmButton>
          </div>
        }
      >
        {product.name}
      </PageTitle>
      <ProductForm product={product} />
    </>
  );
}
