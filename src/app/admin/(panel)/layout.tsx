// Шаблон панели управления: меню и проверка входа.
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions/auth";

export const metadata: Metadata = { title: { default: "Админка", template: "%s — Админка" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [newOrders, newRequests] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.request.count({ where: { isHandled: false } }),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
          <Link href="/admin" className="font-extrabold">СанТех Лавка · админка</Link>
          <Link href="/" target="_blank" className="text-sm text-brand-700 hover:underline">Открыть сайт ↗</Link>
          <form action={logout} className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{admin.login}</span>
            <button className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface">Выйти</button>
          </form>
        </div>
      </header>
      <div className="lg:grid lg:grid-cols-[14rem_1fr]">
        <aside className="border-b border-line bg-white p-4 lg:min-h-[calc(100vh-3.5rem)] lg:border-b-0 lg:border-r">
          <AdminNav counters={{ "/admin/orders": newOrders, "/admin/requests": newRequests }} />
        </aside>
        <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
