import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/fields";

export const metadata: Metadata = { title: "Баннеры" };

export default async function BannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageTitle actions={<Link href="/admin/banners/new" className="btn bg-brand-600 text-white hover:bg-brand-700">+ Добавить баннер</Link>}>Баннеры на главной</PageTitle>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white text-sm">
        {banners.map((b) => (
          <li key={b.id} className={`flex items-center gap-3 px-4 py-3 ${b.isActive ? "" : "opacity-50"}`}>
            <span className="w-6 text-muted">{b.sortOrder}</span>
            <div className="flex-1">
              <Link href={`/admin/banners/${b.id}`} className="font-semibold text-brand-700 hover:underline">{b.title}</Link>
              {b.subtitle && <div className="text-xs text-muted">{b.subtitle}</div>}
            </div>
            {!b.isActive && <span className="text-xs text-muted">скрыт</span>}
          </li>
        ))}
      </ul>
      {banners.length === 0 && <p className="text-muted">Баннеров нет.</p>}
    </>
  );
}
