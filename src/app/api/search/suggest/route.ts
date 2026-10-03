// Подсказки для строки поиска: GET /api/search/suggest?q=грое
import { searchSuggest } from "@/lib/catalog";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const result = await searchSuggest(q.slice(0, 100));
  return Response.json(result);
}
