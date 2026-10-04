// Отдаёт загруженные через админку фото: /uploads/2026-10/ab12cd34.jpg
// На VPS эту работу лучше поручить nginx (см. README), но и так всё работает.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const parts = (await ctx.params).path;
  const file = path.resolve(UPLOAD_DIR, ...parts);
  // Защита от выхода за пределы папки (../../etc/passwd)
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });

  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(file);
    return new Response(data, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
