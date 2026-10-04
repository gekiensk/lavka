"use client";
import { startTransition, useActionState } from "react";
import { login } from "../actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { ok: false });
  return (
    <form
      // Отправка вручную: при неверном пароле логин не стирается
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-4"
    >
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Логин</span>
        <input name="login" autoComplete="username" required className="h-11 w-full rounded-lg border border-line px-3 outline-none focus:border-brand-400" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Пароль</span>
        <input name="password" type="password" autoComplete="current-password" required className="h-11 w-full rounded-lg border border-line px-3 outline-none focus:border-brand-400" />
      </label>
      {state.error && <p className="text-sm text-sale">{state.error}</p>}
      <button disabled={pending} className="btn w-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
