// Создать администратора или сменить ему пароль:
//   npm run admin:create -- логин пароль
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const [login, password] = process.argv.slice(2);
if (!login || !password || password.length < 8) {
  console.error("Использование: npm run admin:create -- логин пароль (пароль не короче 8 символов)");
  process.exit(1);
}

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({ where: { login }, create: { login, passwordHash }, update: { passwordHash } });
  console.log(`Готово: администратор «${login}» может войти на /admin/login`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
