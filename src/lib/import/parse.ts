// Чтение файла Excel (.xlsx) или CSV в список строк «заголовок → значение».
import ExcelJS from "exceljs";
import Papa from "papaparse";

export type SheetRow = Record<string, string>;
export type ParsedFile = { headers: string[]; rows: SheetRow[] };

const MAX_ROWS = 20_000;

/** CSV из Excel в России часто сохраняется в кодировке Windows-1251 — определяем автоматически */
function decodeText(buf: Buffer): string {
  const utf8 = new TextDecoder("utf-8").decode(buf);
  if (!utf8.includes("�")) return utf8.replace(/^﻿/, "");
  return new TextDecoder("windows-1251").decode(buf);
}

function parseCsv(buf: Buffer): ParsedFile {
  const text = decodeText(buf);
  const res = Papa.parse<string[]>(text, { skipEmptyLines: "greedy", delimiter: "" }); // "" — определить разделитель (; или ,) автоматически
  const [head = [], ...body] = res.data;
  const headers = head.map((h) => String(h).trim());
  const rows = body.slice(0, MAX_ROWS).map((cells) => Object.fromEntries(headers.map((h, i) => [h, String(cells[i] ?? "").trim()])));
  return { headers, rows };
}

/** Значение ячейки Excel → строка (формулы, ссылки, даты, «богатый» текст) */
function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleDateString("ru-RU");
  if (typeof value === "object") {
    if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
    if ("richText" in value) return value.richText.map((r) => r.text).join("");
    if ("text" in value) return String(value.text);
    if ("hyperlink" in value) return String(value.hyperlink);
    return "";
  }
  return String(value).trim();
}

async function parseXlsx(buf: Buffer): Promise<ParsedFile> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const ws = wb.worksheets[0];
  if (!ws) return { headers: [], rows: [] };

  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, col) => (headers[col - 1] = cellText(cell.value)));

  const rows: SheetRow[] = [];
  ws.eachRow((row, n) => {
    if (n === 1 || rows.length >= MAX_ROWS) return;
    const r: SheetRow = {};
    headers.forEach((h, i) => (r[h] = cellText(row.getCell(i + 1).value)));
    if (Object.values(r).some((v) => v !== "")) rows.push(r);
  });
  return { headers: headers.map((h) => h ?? ""), rows };
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  // XLSX — это ZIP-архив, начинается с «PK»
  if (name.endsWith(".xlsx") || buf.subarray(0, 2).toString() === "PK") return parseXlsx(buf);
  if (name.endsWith(".xls")) throw new Error("Старый формат .xls не поддерживается — сохраните файл как .xlsx или CSV");
  return parseCsv(buf);
}
