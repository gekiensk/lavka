"use client";
// Редактор характеристик товара: строки «название — значение», можно добавлять и удалять.
import { useState } from "react";
import { Plus, X } from "lucide-react";

type Row = { key: number; name: string; value: string };

export function AttributesEditor({ initial, knownNames }: { initial: { name: string; value: string }[]; knownNames: string[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length ? initial : [{ name: "", value: "" }]).map((r, i) => ({ ...r, key: i })),
  );

  return (
    <div className="space-y-2">
      <datalist id="attr-names">
        {knownNames.map((n) => <option key={n} value={n} />)}
      </datalist>
      {rows.map((r) => (
        <div key={r.key} className="flex gap-2">
          <input
            name="attrName"
            list="attr-names"
            defaultValue={r.name}
            placeholder="Характеристика, напр. «Цвет» или «Объём, л»"
            className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-400"
          />
          <input
            name="attrValue"
            defaultValue={r.value}
            placeholder="Значение"
            className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-400"
          />
          <button type="button" onClick={() => setRows(rows.filter((x) => x.key !== r.key))} className="rounded-lg px-2 text-muted hover:text-sale" aria-label="Удалить строку">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows([...rows, { key: Date.now(), name: "", value: "" }])}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
      >
        <Plus className="h-4 w-4" /> Добавить характеристику
      </button>
      <p className="text-xs text-muted">Новые характеристики создаются автоматически. Чтобы они появились в фильтрах, отметьте их в настройках категории.</p>
    </div>
  );
}
