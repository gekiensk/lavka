"use server";
// Вход и выход из админки.
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/components/admin/AdminForm";

// Простая защита от подбора пароля: не больше 10 неудачных попыток за 15 минут с одного логина
const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const loginName = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const a = attempts.get(loginName);
  if (a && a.count >= 10 && a.until > Date.now()) {
    return { ok: false, error: "Слишком много попыток. Попробуйте через 15 минут." };
  }

  const admin = await db.adminUser.findUnique({ where: { login: loginName } });
  const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    const prev = a && a.until > Date.now() ? a.count : 0;
    attempts.set(loginName, { count: prev + 1, until: Date.now() + 15 * 60_000 });
    return { ok: false, error: "Неверный логин или пароль" };
  }

  attempts.delete(loginName);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(admin.id, admin.login), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { ok: false, error: "Новый пароль — не короче 8 символов" };

  const admin = await db.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(current, admin.passwordHash))) return { ok: false, error: "Текущий пароль неверный" };

  await db.adminUser.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true, message: "Пароль изменён" };
}
