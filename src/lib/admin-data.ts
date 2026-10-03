// Справочники для форм админки.
import { db } from "@/lib/db";

/** Категории списком для выпадающего меню: подкатегории с отступом «— » */
export async function categoryOptions() {
  const all = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const result: { value: number; label: string }[] = [];
  const walk = (parentId: number | null, depth: number) => {
    for (const c of all.filter((x) => x.parentId === parentId)) {
      result.push({ value: c.id, label: `${"— ".repeat(depth)}${c.name}` });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return result;
}
