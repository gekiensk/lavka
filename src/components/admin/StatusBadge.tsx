import { ORDER_STATUS_LABEL } from "@/lib/format";

const COLORS = {
  NEW: "bg-sale/10 text-sale",
  IN_PROGRESS: "bg-wait/10 text-wait",
  DONE: "bg-ok/10 text-ok",
  CANCELLED: "bg-line text-muted",
};

export function StatusBadge({ status }: { status: keyof typeof ORDER_STATUS_LABEL }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${COLORS[status]}`}>{ORDER_STATUS_LABEL[status]}</span>;
}
