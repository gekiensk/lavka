"use client";
// Импорт товаров: сначала «Проверить файл», потом «Загрузить».
import { startTransition, useActionState, useRef, useState } from "react";
import { importProducts, type ImportState } from "@/app/admin/actions/import";

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importProducts, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [fileKey, setFileKey] = useState(0); // смена ключа очищает выбор файла

  const submit = (intent: "preview" | "apply") => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set("intent", intent);
    startTransition(() => action(fd));
  };

  const r = state.report;
  const canApply = r && !r.applied && r.toCreate + r.toUpdate > 0;

  return (
    <div className="space-y-4">
      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); submit("preview"); }} className="space-y-4">
        <input
          key={fileKey}
          type="file"
          name="file"
          accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          required
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700"
        />
        <fieldset className="space-y-1.5 text-sm">
          <label className="flex items-start gap-2">
            <input type="radio" name="mode" value="full" defaultChecked className="mt-1 accent-brand-600" />
            <span><b>Полный импорт</b> — создать новые товары и обновить существующие</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="mode" value="prices" className="mt-1 accent-brand-600" />
            <span><b>Только цены и наличие</b> — для регулярного обновления прайса</span>
          </label>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="btn border border-brand-300 bg-white text-brand-700 disabled:opacity-60">
            {pending ? "Обрабатываем…" : "1. Проверить файл"}
          </button>
          <button type="button" disabled={pending || !canApply} onClick={() => submit("apply")} className="btn bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40">
            2. Загрузить товары
          </button>
        </div>
      </form>

      {state.error && <p className="rounded-xl bg-sale/10 p-3 text-sm text-sale">{state.error}</p>}

      {r && (
        <div className={`space-y-3 rounded-2xl border p-4 text-sm ${r.applied ? "border-ok bg-ok/5" : "border-line bg-white"}`}>
          <p className="text-base font-bold">{r.applied ? "Готово! Товары загружены." : "Проверка файла (в базе пока ничего не изменено)"}</p>
          <ul className="space-y-1">
            <li>Строк с товарами: <b>{r.total}</b></li>
            <li>{r.applied ? "Создано" : "Будет создано"}: <b>{r.toCreate}</b></li>
            <li>{r.applied ? "Обновлено" : "Будет обновлено"}: <b>{r.toUpdate}</b></li>
            {r.skipped > 0 && <li className="text-sale">Пропущено из-за ошибок: <b>{r.skipped}</b></li>}
          </ul>
          {r.newCategories.length > 0 && (
            <p>Новые категории: {r.newCategories.join(", ")}</p>
          )}
          {r.attributeColumns.length > 0 && <p className="text-muted">Характеристики из файла: {r.attributeColumns.join(", ")}</p>}
          {r.unknownColumns.length > 0 && (
            <p className="text-wait">Колонки не распознаны и будут пропущены: {r.unknownColumns.join(", ")}</p>
          )}
          {r.errors.length > 0 && (
            <details open={r.errors.length <= 10}>
              <summary className="cursor-pointer font-semibold text-sale">Ошибки ({r.errors.length})</summary>
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                {r.errors.slice(0, 300).map((e, i) => (
                  <li key={i}>Строка {e.line}: {e.message}</li>
                ))}
              </ul>
            </details>
          )}
          {r.applied && (
            <button type="button" onClick={() => setFileKey((k) => k + 1)} className="text-brand-700 underline">
              Загрузить другой файл
            </button>
          )}
        </div>
      )}
    </div>
  );
}
