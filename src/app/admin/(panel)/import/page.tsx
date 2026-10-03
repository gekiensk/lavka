import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/admin/fields";
import { ImportForm } from "@/components/admin/ImportForm";

export const metadata: Metadata = { title: "Импорт и экспорт" };

export default function ImportPage() {
  return (
    <>
      <PageTitle>Импорт и экспорт товаров</PageTitle>
      <div className="grid max-w-5xl gap-5 xl:grid-cols-[1fr_20rem]">
        <Panel title="Загрузить товары из Excel или CSV">
          <ImportForm />
        </Panel>
        <div className="space-y-5">
          <Panel title="Скачать">
            <a download href="/admin/export?template=1" className="btn w-full border border-line">Шаблон с инструкцией (.xlsx)</a>
            <a download href="/admin/export?format=xlsx" className="btn w-full border border-line">Все товары (.xlsx)</a>
            <a download href="/admin/export?format=csv" className="btn w-full border border-line">Все товары (.csv)</a>
          </Panel>
          <Panel title="Как обновлять цены">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
              <li>Скачайте «Все товары (.xlsx)».</li>
              <li>Поменяйте цены и наличие в Excel.</li>
              <li>Загрузите файл в режиме «Только цены и наличие».</li>
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
