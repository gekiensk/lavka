# СанТех Лавка

Сайт-магазин сантехники в Тюмени: каталог с ценами и наличием, заказ онлайн, информационные страницы, админка.

Стек: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · PostgreSQL · Prisma 7.

> Подробная инструкция по развёртыванию на VPS появится на последнем этапе.

## Быстрый старт (локально)

Нужны Node.js 20.9+ и Docker.

```bash
npm install                 # зависимости (+ генерация клиента Prisma)
cp .env.example .env        # настройки; значения по умолчанию подходят для локальной базы
docker compose up -d        # база PostgreSQL в Docker
npm run db:migrate          # создать таблицы
npm run db:seed             # тестовые данные: 4 раздела, 29 товаров
npm run dev                 # сайт на http://localhost:3000
```

## Полезные команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Режим разработки с автообновлением |
| `npm run build && npm start` | Сборка и запуск как на сервере |
| `npm run lint` / `npm run typecheck` | Проверка кода |
| `npm run db:migrate` | Применить изменения `prisma/schema.prisma` к базе |
| `npm run db:seed` | Заново заполнить каталог тестовыми данными |
| `npm run db:studio` | Веб-интерфейс для просмотра базы |

## Где что лежит

```
prisma/schema.prisma        схема базы данных (с комментариями)
prisma/seed.ts              тестовые товары, категории, настройки магазина
src/app/(shop)/             страницы магазина
src/app/api/                серверные обработчики (подсказки поиска и т.п.)
src/components/             компоненты интерфейса
src/lib/catalog.ts          все запросы к каталогу: категории, фильтры, поиск
src/app/globals.css         фирменные цвета и общие стили
```
