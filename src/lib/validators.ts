// Проверка данных из форм. Одни и те же правила используются на сервере (и при желании в браузере).
import { z } from "zod";

/**
 * Приводит российский номер к виду +7XXXXXXXXXX.
 * Принимает «8 (912) 123-45-67», «+7 912 1234567», «9121234567». Возвращает null, если номер неправильный.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("8") || digits.startsWith("7"))) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  return `+7${digits}`;
}

export const phoneSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const phone = normalizePhone(v);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Введите номер в формате +7 900 000-00-00" });
      return z.NEVER;
    }
    return phone;
  });

/** Галочка согласия на обработку персональных данных (152-ФЗ) */
export const consentSchema = z.literal("on", { error: "Нужно согласие на обработку персональных данных" });

/** Заявка «Узнать наличие» / «Перезвоните мне» */
export const requestSchema = z.object({
  type: z.enum(["CALLBACK", "AVAILABILITY"]),
  name: z.string().trim().max(100).optional(),
  phone: phoneSchema,
  comment: z.string().trim().max(1000).optional(),
  productId: z.coerce.number().int().positive().optional(),
  consent: consentSchema,
});

/** Ошибки по полям для показа под инпутами */
export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
