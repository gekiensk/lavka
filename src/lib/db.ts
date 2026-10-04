// Единый экземпляр Prisma Client на всё приложение.
// В режиме разработки Next.js перезагружает модули — сохраняем клиент в globalThis,
// чтобы не открывать новое подключение к базе при каждом изменении файла.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
