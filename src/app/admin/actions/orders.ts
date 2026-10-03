"use server";
// Действия с заказами и заявками.
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/components/admin/AdminForm";

const STATUSES = ["NEW", "IN_PROGRESS", "DONE", "CANCELLED"] as const;

export async function updateOrder(id: number, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) return { ok: false, error: "Неизвестный статус" };
  await db.order.update({
    where: { id },
    data: { status: status as (typeof STATUSES)[number], adminNote: String(formData.get("adminNote") ?? "").trim() || null },
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function toggleRequest(id: number) {
  await requireAdmin();
  const r = await db.request.findUniqueOrThrow({ where: { id } });
  await db.request.update({ where: { id }, data: { isHandled: !r.isHandled } });
  revalidatePath("/admin", "layout");
}
