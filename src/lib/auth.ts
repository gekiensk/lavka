// Проверка входа в админку на сервере.
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/** Текущий администратор или null */
export const getAdmin = cache(async () => {
  const session = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  // Убеждаемся, что пользователь не удалён
  return db.adminUser.findUnique({ where: { id: session.id }, select: { id: true, login: true } });
});

/**
 * Вызывать в начале каждой страницы и каждого действия админки.
 * Если вход не выполнен — перенаправляет на страницу входа.
 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
