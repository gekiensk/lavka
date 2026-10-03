// Сохранение загруженных фото на диск сервера.
// Файлы лежат в папке UPLOAD_DIR (по умолчанию ./uploads) и отдаются по адресу /uploads/...
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

// turbopackIgnore — не включать папку с фото в сборку сервера
export const UPLOAD_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR || "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10 МБ

/** Определяем формат по первым байтам файла, а не по имени — так надёжнее */
function detectImageType(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

/** Сохраняет фото и возвращает его адрес вида /uploads/2026-10/ab12cd34.jpg */
export async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_SIZE) throw new Error(`Файл «${file.name}» больше 10 МБ`);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectImageType(buf);
  if (!ext) throw new Error(`Файл «${file.name}» — не JPG, PNG или WebP`);

  const month = new Date().toISOString().slice(0, 7);
  const dir = path.join(UPLOAD_DIR, month);
  await mkdir(dir, { recursive: true });
  const name = `${randomBytes(8).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${month}/${name}`;
}
