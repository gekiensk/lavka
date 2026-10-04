// Скачивание товаров: /admin/export?format=xlsx | csv, шаблон: /admin/export?template=1
import { getAdmin } from "@/lib/auth";
import { exportCsv, exportXlsx, templateXlsx } from "@/lib/import/export";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function download(body: BodyInit, type: string, filename: string) {
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Нужно войти в админку", { status: 401 });

  const params = new URL(request.url).searchParams;
  const date = new Date().toISOString().slice(0, 10);

  if (params.get("template")) return download(new Uint8Array(await templateXlsx()), XLSX, "шаблон-импорта-товаров.xlsx");
  if (params.get("format") === "csv") return download(await exportCsv(), "text/csv; charset=utf-8", `товары-${date}.csv`);
  return download(new Uint8Array(await exportXlsx()), XLSX, `товары-${date}.xlsx`);
}
