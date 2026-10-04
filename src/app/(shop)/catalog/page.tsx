// Весь каталог: разделы и их подразделы.
import { skipOptimization } from "@/lib/images";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { categoryUrl, getCategoryTree } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "Каталог сантехники",
  description: "Каталог магазина «СанТех Лавка»: смесители, унитазы, раковины, ванны, трубы и фитинги, водонагреватели и радиаторы.",
  path: "/catalog",
});

export default async function CatalogPage() {
  const tree = await getCategoryTree();

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Каталог", url: "/catalog" }]} />
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">Каталог</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {tree.map((c) => (
          <section key={c.id} className="flex gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
            {c.image && (
              <Link href={categoryUrl([c.slug])} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface sm:h-24 sm:w-24">
                <Image src={c.image} alt="" fill sizes="96px" className="object-contain p-1" unoptimized={skipOptimization(c.image)} />
              </Link>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-bold">
                <Link href={categoryUrl([c.slug])} className="hover:text-brand-700">{c.name}</Link>
              </h2>
              <ul className="mt-2 space-y-1 text-[15px]">
                {c.children.map((ch) => (
                  <li key={ch.id}>
                    <Link href={categoryUrl([c.slug, ch.slug])} className="text-muted hover:text-ink">{ch.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
