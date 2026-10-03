// Сессия администратора: подписанный токен в cookie (httpOnly — недоступен из JavaScript страницы).
// Этот файл без обращений к базе, поэтому его можно использовать и в proxy.ts.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "lavka_admin";
const MAX_AGE_DAYS = 14;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("Задайте SESSION_SECRET в .env (не короче 16 символов)");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(adminId: number, login: string) {
  return new SignJWT({ login })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_DAYS}d`)
    .sign(secretKey());
}

/** Проверяет токен; возвращает данные администратора или null */
export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { id: Number(payload.sub), login: String(payload.login) };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https"),
  path: "/",
  maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
};
