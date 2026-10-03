"use client";
// Обёртка для форм админки: отправляет форму в серверное действие
// и показывает результат («Сохранено» или текст ошибки).
import { startTransition, useActionState, useEffect, useRef } from "react";

export type ActionResult = { ok: boolean; error?: string; message?: string };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

type Props = {
  action: Action;
  children: React.ReactNode;
  submitText?: string;
  className?: string;
  /** Дополнительные кнопки рядом с «Сохранить» */
  extraButtons?: React.ReactNode;
};

export function AdminForm({ action, children, submitText = "Сохранить", className = "", extraButtons }: Props) {
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);

  // После успешного сохранения очищаем выбор файлов, чтобы не загрузить их второй раз
  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((i) => (i.value = ""));
  }, [state]);

  return (
    <form
      ref={formRef}
      // Отправляем вручную, а не через action={...}: так React не очищает форму после сохранения
      // и при ошибке введённые данные остаются на месте
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className={`space-y-5 ${className}`}
    >
      {children}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <button type="submit" disabled={pending} className="btn bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Сохраняем…" : submitText}
        </button>
        {extraButtons}
        <span aria-live="polite" className="text-sm">
          {state.error && <span className="text-sale">{state.error}</span>}
          {state.ok && <span className="text-ok">{state.message ?? "Сохранено"}</span>}
        </span>
      </div>
    </form>
  );
}
