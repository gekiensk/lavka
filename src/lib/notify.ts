// Уведомления владельцу магазина: Telegram и email.
// Если в .env не заполнены настройки канала, он просто пропускается — сайт продолжает работать.
import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Экранирование для HTML-разметки Telegram и писем */
function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendTelegram(html: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Telegram: ${res.status} ${await res.text()}`);
}

async function sendEmail(subject: string, html: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !NOTIFY_EMAIL) return;

  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  await transport.sendMail({ from: `"СанТех Лавка" <${SMTP_USER}>`, to: NOTIFY_EMAIL, subject, html });
}

/**
 * Отправить уведомление во все настроенные каналы.
 * Ошибки только пишутся в лог: заказ уже сохранён, и клиент не должен видеть сбой из-за Telegram.
 */
async function notify(subject: string, lines: string[]) {
  const html = lines.join("\n");
  const results = await Promise.allSettled([
    sendTelegram(`<b>${esc(subject)}</b>\n\n${html}`),
    sendEmail(subject, `<h2>${esc(subject)}</h2>${lines.map((l) => `<p style="margin:4px 0">${l}</p>`).join("")}`),
  ]);
  for (const r of results) if (r.status === "rejected") console.error("Ошибка уведомления:", r.reason);
}

export type OrderNotice = {
  number: string;
  customerName: string;
  phone: string;
  email?: string | null;
  delivery: "PICKUP" | "DELIVERY";
  address?: string | null;
  comment?: string | null;
  total: number;
  items: { name: string; sku: string; price: number; qty: number }[];
};

export async function notifyNewOrder(o: OrderNotice) {
  await notify(`Новый заказ ${o.number} на ${formatPrice(o.total)}`, [
    `👤 ${esc(o.customerName)}, <a href="tel:${o.phone}">${o.phone}</a>${o.email ? `, ${esc(o.email)}` : ""}`,
    o.delivery === "PICKUP" ? "🏬 Самовывоз" : `🚚 Доставка: ${esc(o.address ?? "")}`,
    ...(o.comment ? [`💬 ${esc(o.comment)}`] : []),
    "",
    ...o.items.map((i) => `• ${esc(i.name)} (арт. ${esc(i.sku)}) — ${i.qty} × ${formatPrice(i.price)}`),
    "",
    `Итого: <b>${formatPrice(o.total)}</b>`,
    `<a href="${SITE_URL}/admin/orders">Открыть в админке</a>`,
  ]);
}

export async function notifyNewRequest(r: { type: "CALLBACK" | "AVAILABILITY"; name?: string; phone: string; comment?: string; productName?: string }) {
  const title = r.type === "CALLBACK" ? "Просьба перезвонить" : "Запрос наличия";
  await notify(title, [
    `👤 ${esc(r.name || "Без имени")}, <a href="tel:${r.phone}">${r.phone}</a>`,
    ...(r.productName ? [`📦 ${esc(r.productName)}`] : []),
    ...(r.comment ? [`💬 ${esc(r.comment)}`] : []),
  ]);
}
