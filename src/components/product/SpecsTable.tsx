// Таблица характеристик товара.
type Row = { name: string; value: string };

export function SpecsTable({ rows }: { rows: Row[] }) {
  return (
    <dl className="divide-y divide-line rounded-2xl border border-line text-[15px]">
      {rows.map((r) => (
        <div key={r.name} className="grid grid-cols-2 gap-4 px-4 py-2.5 odd:bg-surface/60">
          <dt className="text-muted">{r.name}</dt>
          <dd className="font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
