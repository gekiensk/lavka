// Поля форм админки: подпись + поле ввода. Серверные компоненты, без состояния.
type Base = { label: string; hint?: string; className?: string };

const inputCls = "w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-brand-400";

export function TextField({ label, hint, className = "", ...input }: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-semibold">{label}</span>
      <input {...input} className={`h-10 ${inputCls}`} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, className = "", ...input }: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-semibold">{label}</span>
      <textarea {...input} className={`py-2 ${inputCls}`} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Select({
  label, hint, className = "", options, ...input
}: Base & React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string | number; label: string }[] }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-semibold">{label}</span>
      <select {...input} className={`h-10 ${inputCls}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, className = "", ...input }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex items-center gap-2 text-sm ${className}`}>
      <input type="checkbox" {...input} className="h-4 w-4 accent-brand-600" />
      <span>{label}</span>
    </label>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-4 sm:p-5 ${className}`}>
      {title && <h2 className="mb-4 font-bold">{title}</h2>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function PageTitle({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-extrabold tracking-tight">{children}</h1>
      {actions}
    </div>
  );
}
