"use server";
// Серверное действие: сохраняет заявку «Узнать наличие» или «Перезвоните мне».
import { db } from "@/lib/db";
import { fieldErrors, requestSchema, type FieldErrors } from "@/lib/validators";

export type RequestFormState = {
  ok: boolean;
  errors?: FieldErrors;
  /** Введённые значения — чтобы при ошибке не заполнять форму заново */
  values?: Record<string, string>;
};

export async function createRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  // Ловушка для спам-ботов: скрытое поле, которое человек не видит и не заполняет
  if (formData.get("website")) return { ok: true };

  // Пустые поля превращаем в undefined, чтобы необязательные поля проходили проверку
  const raw = Object.fromEntries([...formData.entries()].filter(([k, v]) => v !== "" && k !== "website"));
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), values: raw as Record<string, string> };
  }

  const { type, name, phone, comment, productId } = parsed.data;
  await db.request.create({ data: { type, name, phone, comment, productId } });

  // Уведомление владельцу в Telegram и на почту подключим на этапе «Корзина и заказ»

  return { ok: true };
}
