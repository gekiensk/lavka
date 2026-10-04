"use client";
// Всплывающая форма заявки: «Узнать наличие» (для товаров под заказ) или «Перезвоните мне».
import { useActionState, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { createRequest, type RequestFormState } from "@/app/actions/requests";

type Props = {
  type: "AVAILABILITY" | "CALLBACK";
  productId?: number;
  productName?: string;
  /** Текст и оформление кнопки, открывающей форму */
  buttonText: string;
  buttonClassName?: string;
};

const TITLES = {
  AVAILABILITY: "Узнать наличие и срок поставки",
  CALLBACK: "Перезвоните мне",
};

export function RequestDialog({ type, productId, productName, buttonText, buttonClassName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState<RequestFormState, FormData>(createRequest, { ok: false });

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={buttonClassName}>
        {buttonText}
      </button>

      <dialog
        ref={dialogRef}
        // Клик по затемнённому фону закрывает окно
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 backdrop:bg-ink/40"
      >
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-lg font-extrabold">{TITLES[type]}</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="-m-1 rounded-lg p-1 hover:bg-surface" aria-label="Закрыть">
              <X className="h-5 w-5" />
            </button>
          </div>

          {state.ok ? (
            <div className="space-y-4">
              <p>Спасибо! Мы получили заявку и перезвоним вам в рабочее время.</p>
              <button type="button" onClick={() => dialogRef.current?.close()} className="btn w-full bg-brand-600 text-white hover:bg-brand-700">
                Хорошо
              </button>
            </div>
          ) : (
            // key: после ответа сервера форма пересоздаётся с введёнными значениями
            <form key={JSON.stringify(state.values)} action={formAction} className="space-y-3">
              {productName && <p className="rounded-lg bg-surface px-3 py-2 text-sm text-muted">{productName}</p>}
              <input type="hidden" name="type" value={type} />
              {productId && <input type="hidden" name="productId" value={productId} />}
              {/* Ловушка для спам-ботов: поле скрыто от людей */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <Field label="Имя" name="name" autoComplete="name" defaultValue={state.values?.name} />
              <Field label="Телефон *" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+7 900 000-00-00" error={state.errors?.phone} defaultValue={state.values?.phone} required />
              {type === "AVAILABILITY" && <Field label="Комментарий" name="comment" placeholder="Например, нужно 2 штуки" defaultValue={state.values?.comment} />}

              <label className="flex items-start gap-2 text-xs text-muted">
                <input type="checkbox" name="consent" required defaultChecked={state.values?.consent === "on"} className="mt-0.5 h-4 w-4 accent-brand-600" />
                <span>
                  Согласен на{" "}
                  <Link href="/consent" target="_blank" className="underline">обработку персональных данных</Link>
                </span>
              </label>
              {state.errors?.consent && <p className="text-xs text-sale">{state.errors.consent}</p>}

              <button type="submit" disabled={pending} className="btn w-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60">
                {pending ? "Отправляем…" : "Отправить"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

function Field({ label, error, ...input }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <input
        {...input}
        aria-invalid={!!error}
        className={`h-11 w-full rounded-lg border px-3 outline-none focus:border-brand-400 ${error ? "border-sale" : "border-line"}`}
      />
      {error && <span className="mt-1 block text-xs text-sale">{error}</span>}
    </label>
  );
}
