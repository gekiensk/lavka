// Страница 404 для адресов, которых нет на сайте вообще.
// Без обращений к базе — чтобы сборка проекта не зависела от неё.
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { NotFoundContent } from "@/components/ui/NotFoundContent";

export default function NotFound() {
  return (
    <>
      <header className="border-b border-line">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link href="/catalog" className="text-sm font-semibold text-brand-700 hover:underline">Каталог</Link>
        </div>
      </header>
      <main className="flex-1">
        <NotFoundContent />
      </main>
    </>
  );
}
