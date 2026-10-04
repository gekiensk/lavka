"use client";
// Кнопка опасного действия (удаление) с подтверждением.
export function ConfirmButton({
  action, confirmText, children, className = "",
}: {
  action: () => Promise<void>;
  confirmText: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(confirmText)) e.preventDefault(); }}>
      <button type="submit" className={`btn border border-line text-sale hover:border-sale ${className}`}>{children}</button>
    </form>
  );
}
