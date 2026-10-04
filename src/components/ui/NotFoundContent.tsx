import Link from "next/link";

export function NotFoundContent() {
  return (
    <div className="container-page py-16 text-center">
      <p className="text-5xl font-extrabold text-brand-300">404</p>
      <h1 className="mt-3 text-2xl font-extrabold">Страница не найдена</h1>
      <p className="mt-2 text-muted">Возможно, товар сняли с продажи или адрес изменился.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/catalog" className="btn bg-brand-600 text-white hover:bg-brand-700">В каталог</Link>
        <Link href="/" className="btn border border-line">На главную</Link>
      </div>
    </div>
  );
}
