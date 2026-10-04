// Метка наличия: «В наличии» (зелёная) или «Под заказ» (жёлтая).
import { STOCK_LABEL } from "@/lib/format";

export function StockBadge({ stock }: { stock: keyof typeof STOCK_LABEL }) {
  const inStock = stock === "IN_STOCK";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${inStock ? "text-ok" : "text-wait"}`}>
      <span className={`h-2 w-2 rounded-full ${inStock ? "bg-ok" : "bg-wait"}`} aria-hidden />
      {STOCK_LABEL[stock]}
    </span>
  );
}
