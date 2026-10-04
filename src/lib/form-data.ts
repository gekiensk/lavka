// Удобное чтение полей формы в серверных действиях.

/** Строка без пробелов по краям; пустая строка → null */
export function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

/** Целое число (допускает пробелы и запятую: «12 500,00» → 12500); пусто → null */
export function int(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v === null) return null;
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

/** Галочка: true, если отмечена */
export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

/** Текст ошибки Prisma про дубликат уникального поля → понятное сообщение */
export function uniqueError(e: unknown, messages: Record<string, string>): string | null {
  if (typeof e === "object" && e && "code" in e && e.code === "P2002") {
    // Имя ограничения вида «Product_sku_key» лежит в meta (формат зависит от версии Prisma)
    const meta = JSON.stringify((e as { meta?: unknown }).meta ?? {});
    for (const [field, msg] of Object.entries(messages)) {
      if (meta.includes(`_${field}_key`) || meta.includes(`"${field}"`)) return msg;
    }
    return "Такое значение уже используется";
  }
  return null;
}
