"use server";
// Проверка и загрузка файла с товарами.
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { parseFile } from "@/lib/import/parse";
import { runImport, type ImportMode, type ImportReport } from "@/lib/import/run";

export type ImportState = { error?: string; report?: ImportReport };

export async function importProducts(_prev: ImportState, fd: FormData): Promise<ImportState> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Выберите файл .xlsx или .csv" };
  if (file.size > 20 * 1024 * 1024) return { error: "Файл больше 20 МБ — разбейте его на части" };

  const mode: ImportMode = fd.get("mode") === "prices" ? "prices" : "full";
  const apply = fd.get("intent") === "apply";

  try {
    const parsed = await parseFile(file);
    if (parsed.rows.length === 0) return { error: "В файле нет строк с товарами" };
    const report = await runImport(parsed, mode, apply);
    if (apply) revalidatePath("/", "layout");
    return { report };
  } catch (e) {
    console.error("Ошибка импорта:", e);
    return { error: `Не удалось обработать файл: ${(e as Error).message}` };
  }
}
