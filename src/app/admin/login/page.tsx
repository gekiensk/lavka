import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Вход в админку", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-extrabold">СанТех Лавка</h1>
        <p className="mb-5 text-sm text-muted">Вход в панель управления</p>
        <LoginForm />
      </div>
    </div>
  );
}
