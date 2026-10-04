import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Страницы" };

export default async function PagesPage() {
  const pages = await db.page.findMany({ orderBy: { id: "asc" } });
  return (
    <>
      <PageTitle>Текстовые страницы</PageTitle>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white text-sm">
        {pages.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-3">
            <Link href={`/admin/pages/${p.id}`} className="font-semibold text-brand-700 hover:underline">{p.title}</Link>
            <span className="text-muted">/{p.slug}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
