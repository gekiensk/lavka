// Тестовые данные: категории, бренды, характеристики, ~30 товаров, настройки магазина.
// Запуск: `npm run db:seed`. Скрипт можно запускать повторно — он очищает каталог и создаёт заново.
// На сервере: `SEED_CONTENT_ONLY=1 npm run db:seed` — только тексты и настройки, каталог не трогается.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Stock } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slug";
import { BANNERS, PAGES, POSTS } from "./seed-content";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ── Дерево категорий ──
// image — картинка-заглушка из public/images/products
const CATEGORIES = [
  {
    name: "Смесители",
    image: "faucet",
    popular: true,
    description:
      "Смесители для кухни, ванной и раковины от проверенных брендов. Поможем подобрать модель под вашу мойку и подключение.",
    children: [
      { name: "Смесители для кухни", image: "faucet" },
      { name: "Смесители для ванной", image: "faucet" },
      { name: "Смесители для раковины", image: "faucet" },
    ],
    attributes: ["Материал корпуса", "Цвет", "Тип управления", "Длина излива"],
  },
  {
    name: "Сантехника",
    image: "toilet",
    popular: true,
    description: "Унитазы, раковины, ванны и душевые кабины для квартиры и частного дома.",
    children: [
      { name: "Унитазы", image: "toilet" },
      { name: "Раковины", image: "sink" },
      { name: "Ванны", image: "bath" },
      { name: "Душевые кабины", image: "shower" },
    ],
    attributes: ["Материал", "Тип монтажа", "Ширина"],
  },
  {
    name: "Трубы и фитинги",
    image: "pipe",
    popular: true,
    description: "Полипропиленовые и металлопластиковые трубы, фитинги и комплектующие для монтажа водопровода и отопления.",
    children: [
      { name: "Трубы", image: "pipe" },
      { name: "Фитинги", image: "fitting" },
    ],
    attributes: ["Материал", "Диаметр"],
  },
  {
    name: "Отопление и водонагреватели",
    image: "heater",
    popular: true,
    description: "Накопительные водонагреватели и радиаторы отопления. Расскажем, какой объём и мощность нужны именно вам.",
    children: [
      { name: "Водонагреватели", image: "heater" },
      { name: "Радиаторы", image: "radiator" },
    ],
    attributes: ["Объём", "Мощность", "Материал", "Количество секций"],
  },
];

// ── Справочник характеристик ──
const ATTRIBUTES: { name: string; unit?: string; numeric?: boolean }[] = [
  { name: "Материал корпуса" },
  { name: "Цвет" },
  { name: "Тип управления" },
  { name: "Длина излива", unit: "мм", numeric: true },
  { name: "Материал" },
  { name: "Тип монтажа" },
  { name: "Ширина", unit: "мм", numeric: true },
  { name: "Диаметр", unit: "мм", numeric: true },
  { name: "Объём", unit: "л", numeric: true },
  { name: "Мощность", unit: "кВт", numeric: true },
  { name: "Количество секций", unit: "шт", numeric: true },
  { name: "Гарантия", unit: "лет", numeric: true },
];

type SeedProduct = {
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  stock?: Stock;
  unit?: string;
  hit?: boolean;
  image: string;
  attrs: Record<string, string | number>;
  description: string;
};

const PRODUCTS: SeedProduct[] = [
  // ─ Смесители для кухни ─
  {
    sku: "LM3071C", name: "Смеситель для кухни Lemark Comfort LM3071C", category: "Смесители для кухни", brand: "Lemark",
    price: 6490, oldPrice: 7990, hit: true, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "хром", "Тип управления": "однорычажный", "Длина излива": 220, Гарантия: 5 },
    description: "Однорычажный смеситель с высоким поворотным изливом — удобно наполнять большие кастрюли.\n\nКерамический картридж 35 мм, аэратор с защитой от известкового налёта. Гибкая подводка в комплекте.",
  },
  {
    sku: "IDS-KITSB00", name: "Смеситель для кухни Iddis Kitchen KITSB00i05", category: "Смесители для кухни", brand: "Iddis",
    price: 3290, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "хром", "Тип управления": "однорычажный", "Длина излива": 200, Гарантия: 3 },
    description: "Недорогой и надёжный смеситель для кухонной мойки. Латунный корпус, поворот излива на 360°.",
  },
  {
    sku: "GR-33281003", name: "Смеситель для кухни Grohe Eurosmart 33281003", category: "Смесители для кухни", brand: "Grohe",
    price: 11900, oldPrice: 13500, hit: true, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "хром", "Тип управления": "однорычажный", "Длина излива": 210, Гарантия: 5 },
    description: "Немецкое качество и технология SilkMove — плавный ход рычага на долгие годы. Покрытие StarLight не тускнеет.",
  },
  {
    sku: "LM-ELB-BLK", name: "Смеситель для кухни Lemark Expert с выдвижным изливом, чёрный", category: "Смесители для кухни", brand: "Lemark",
    price: 12750, stock: "ON_ORDER", image: "faucet",
    attrs: { "Материал корпуса": "нержавеющая сталь", Цвет: "чёрный матовый", "Тип управления": "однорычажный", "Длина излива": 230, Гарантия: 5 },
    description: "Выдвижная лейка с двумя режимами — струя и душ. Стильный матовый чёрный цвет для современной кухни.",
  },
  // ─ Смесители для ванной ─
  {
    sku: "IDS-VLS-BTH", name: "Смеситель для ванны Iddis Vane с длинным изливом", category: "Смесители для ванной", brand: "Iddis",
    price: 4890, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "хром", "Тип управления": "однорычажный", "Длина излива": 350, Гарантия: 3 },
    description: "Универсальный смеситель для ванны и раковины. Длинный излив 350 мм, лейка и шланг 1,5 м в комплекте.",
  },
  {
    sku: "HG-71400", name: "Смеситель для ванны Hansgrohe Logis 71400000", category: "Смесители для ванной", brand: "Hansgrohe",
    price: 14600, hit: true, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "хром", "Тип управления": "однорычажный", "Длина излива": 194, Гарантия: 5 },
    description: "Настенный смеситель для ванны с автоматическим переключателем ванна/душ. Лаконичный дизайн, экономия воды.",
  },
  {
    sku: "RS-2V-BTH", name: "Смеситель для ванны Rossinka двухвентильный", category: "Смесители для ванной", brand: "Rossinka",
    price: 2950, oldPrice: 3400, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "хром", "Тип управления": "двухвентильный", "Длина излива": 300, Гарантия: 3 },
    description: "Классический двухвентильный смеситель с керамическими кран-буксами. Подходит для старых и новых ванных.",
  },
  // ─ Смесители для раковины ─
  {
    sku: "GR-BAU-23", name: "Смеситель для раковины Grohe BauEdge 23328000", category: "Смесители для раковины", brand: "Grohe",
    price: 7990, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "хром", "Тип управления": "однорычажный", "Длина излива": 106, Гарантия: 5 },
    description: "Компактный смеситель для раковины с ограничителем температуры и донным клапаном.",
  },
  {
    sku: "LM-BASIS-SAT", name: "Смеситель для раковины Lemark Basis, сатин", category: "Смесители для раковины", brand: "Lemark",
    price: 4350, image: "faucet",
    attrs: { "Материал корпуса": "латунь", Цвет: "сатин", "Тип управления": "однорычажный", "Длина излива": 110, Гарантия: 5 },
    description: "Покрытие «сатин» не оставляет следов от капель и пальцев. Картридж 35 мм.",
  },
  // ─ Унитазы ─
  {
    sku: "CRS-PARVA", name: "Унитаз-компакт Cersanit Parva Clean On безободковый", category: "Унитазы", brand: "Cersanit",
    price: 13900, oldPrice: 16500, hit: true, image: "toilet",
    attrs: { Материал: "фаянс", "Тип монтажа": "напольный", Ширина: 360, Гарантия: 5 },
    description: "Безободковая чаша легко моется и гигиенична. Сиденье с микролифтом, двойной смыв 3/6 л. Выпуск горизонтальный.",
  },
  {
    sku: "STK-ALKOR", name: "Унитаз-компакт Santek Алькор, косой выпуск", category: "Унитазы", brand: "Santek",
    price: 7450, image: "toilet",
    attrs: { Материал: "фаянс", "Тип монтажа": "напольный", Ширина: 350, Гарантия: 3 },
    description: "Надёжный унитаз российского производства с косым выпуском — подходит для большинства квартир старой застройки.",
  },
  {
    sku: "RCA-MERIDIAN-W", name: "Унитаз подвесной Roca Meridian Rimless", category: "Унитазы", brand: "Roca",
    price: 18200, stock: "ON_ORDER", image: "toilet",
    attrs: { Материал: "фаянс", "Тип монтажа": "подвесной", Ширина: 360, Гарантия: 10 },
    description: "Подвесной безободковый унитаз. Устанавливается на инсталляцию (продаётся отдельно). Сиденье с микролифтом в комплекте.",
  },
  // ─ Раковины ─
  {
    sku: "STK-BLANCA60", name: "Раковина Santek Бланка 60 с пьедесталом", category: "Раковины", brand: "Santek",
    price: 4790, image: "sink",
    attrs: { Материал: "фаянс", "Тип монтажа": "на пьедестал", Ширина: 600, Гарантия: 3 },
    description: "Классическая раковина на пьедестале — пьедестал скрывает сифон и трубы.",
  },
  {
    sku: "CRS-MITO50", name: "Раковина накладная Cersanit Moduo 50", category: "Раковины", brand: "Cersanit",
    price: 5600, oldPrice: 6200, image: "sink",
    attrs: { Материал: "фаянс", "Тип монтажа": "накладная", Ширина: 500, Гарантия: 5 },
    description: "Накладная раковина на столешницу или тумбу. Современная прямоугольная форма.",
  },
  // ─ Ванны ─
  {
    sku: "TRT-STANDART170", name: "Ванна акриловая Triton Стандарт 170×70", category: "Ванны", brand: "Triton",
    price: 12400, hit: true, image: "bath",
    attrs: { Материал: "акрил", "Тип монтажа": "пристенная", Ширина: 700, Гарантия: 5 },
    description: "Акриловая ванна 170×70 — тёплая на ощупь и лёгкая. Каркас и ножки продаются отдельно.",
  },
  {
    sku: "RCA-CONT-150", name: "Ванна чугунная Roca Continental 150×70", category: "Ванны", brand: "Roca",
    price: 38900, stock: "ON_ORDER", image: "bath",
    attrs: { Материал: "чугун", "Тип монтажа": "пристенная", Ширина: 700, Гарантия: 10 },
    description: "Чугунная ванна долго держит тепло и служит десятилетиями. Покрытие — прочная эмаль.",
  },
  // ─ Душевые кабины ─
  {
    sku: "TRT-SHOW90", name: "Душевой уголок Triton Ди 90×90, полукруглый", category: "Душевые кабины", brand: "Triton",
    price: 17900, oldPrice: 19900, image: "shower",
    attrs: { Материал: "закалённое стекло", "Тип монтажа": "угловая", Ширина: 900, Гарантия: 3 },
    description: "Полукруглый душевой уголок с раздвижными дверями. Стекло 5 мм, поддон в комплекте.",
  },
  // ─ Трубы ─
  {
    sku: "VLT-PPR20", name: "Труба полипропиленовая Valtec PN20 20 мм (отрезок 2 м)", category: "Трубы", brand: "Valtec",
    price: 160, unit: "шт", hit: true, image: "pipe",
    attrs: { Материал: "полипропилен", Диаметр: 20 },
    description: "Труба PN20 для холодной и горячей воды. Продаётся отрезками по 2 метра.",
  },
  {
    sku: "VLT-PPR25-AL", name: "Труба полипропиленовая Valtec армированная алюминием 25 мм", category: "Трубы", brand: "Valtec",
    price: 340, image: "pipe",
    attrs: { Материал: "полипропилен", Диаметр: 25 },
    description: "Армированная труба для систем отопления — меньше удлиняется при нагреве. Отрезок 2 м.",
  },
  {
    sku: "VLT-MP16", name: "Труба металлопластиковая Valtec 16 мм (бухта 1 м)", category: "Трубы", brand: "Valtec",
    price: 85, unit: "м", image: "pipe",
    attrs: { Материал: "металлопластик", Диаметр: 16 },
    description: "Гибкая металлопластиковая труба для водопровода и тёплого пола. Продаётся на метры.",
  },
  // ─ Фитинги ─
  {
    sku: "VLT-PP-ELB20", name: "Угольник полипропиленовый 90° 20 мм", category: "Фитинги", brand: "Valtec",
    price: 18, image: "fitting",
    attrs: { Материал: "полипропилен", Диаметр: 20 },
    description: "Угольник для поворота трубопровода на 90°. Соединение пайкой.",
  },
  {
    sku: "VLT-PP-TEE20", name: "Тройник полипропиленовый 20 мм", category: "Фитинги", brand: "Valtec",
    price: 22, image: "fitting",
    attrs: { Материал: "полипропилен", Диаметр: 20 },
    description: "Равнопроходной тройник для разветвления трубопровода.",
  },
  {
    sku: "VLT-BV-1/2", name: "Кран шаровый Valtec Base 1/2\"", category: "Фитинги", brand: "Valtec",
    price: 420, hit: true, image: "fitting",
    attrs: { Материал: "латунь", Диаметр: 15 },
    description: "Шаровой кран для перекрытия воды. Ручка-рычаг, внутренняя/внутренняя резьба.",
  },
  // ─ Водонагреватели ─
  {
    sku: "THX-ERS80", name: "Водонагреватель Thermex ERS 80 V", category: "Водонагреватели", brand: "Thermex",
    price: 13990, oldPrice: 15990, hit: true, image: "heater",
    attrs: { Объём: 80, Мощность: 1.5, Материал: "эмалированная сталь", Гарантия: 7 },
    description: "Накопительный водонагреватель на 80 литров — хватит на семью из 3–4 человек. Вертикальный монтаж.",
  },
  {
    sku: "ARS-ABS50", name: "Водонагреватель Ariston ABS PRO R 50 V Slim", category: "Водонагреватели", brand: "Ariston",
    price: 15400, image: "heater",
    attrs: { Объём: 50, Мощность: 1.5, Материал: "эмалированная сталь", Гарантия: 7 },
    description: "Узкий корпус для небольших помещений. Защита от перегрева и сухого нагрева.",
  },
  {
    sku: "THX-FLAT100", name: "Водонагреватель Thermex Flat Plus 100 л, плоский", category: "Водонагреватели", brand: "Thermex",
    price: 24800, stock: "ON_ORDER", image: "heater",
    attrs: { Объём: 100, Мощность: 2, Материал: "нержавеющая сталь", Гарантия: 7 },
    description: "Плоский водонагреватель с баком из нержавейки и электронным управлением. Быстрый нагрев 2 кВт.",
  },
  // ─ Радиаторы ─
  {
    sku: "RFR-BASE500-8", name: "Радиатор биметаллический Rifar Base 500, 8 секций", category: "Радиаторы", brand: "Rifar",
    price: 11200, hit: true, image: "radiator",
    attrs: { Материал: "биметалл", "Количество секций": 8, Гарантия: 10 },
    description: "Биметаллический радиатор российского производства, рассчитан на давление центральных систем отопления.",
  },
  {
    sku: "RTH-REV500-10", name: "Радиатор алюминиевый Royal Thermo Revolution 500, 10 секций", category: "Радиаторы", brand: "Royal Thermo",
    price: 8900, oldPrice: 9800, image: "radiator",
    attrs: { Материал: "алюминий", "Количество секций": 10, Гарантия: 10 },
    description: "Лёгкий алюминиевый радиатор с высокой теплоотдачей — хорошо подходит для частного дома.",
  },
  {
    sku: "RFR-BASE500-12", name: "Радиатор биметаллический Rifar Base 500, 12 секций", category: "Радиаторы", brand: "Rifar",
    price: 16800, image: "radiator",
    attrs: { Материал: "биметалл", "Количество секций": 12, Гарантия: 10 },
    description: "Модель на 12 секций для больших комнат (примерно до 20 м²).",
  },
];

// «С этим товаром покупают»: артикул товара → артикулы сопутствующих
const RELATIONS: Record<string, string[]> = {
  LM3071C: ["VLT-BV-1/2", "VLT-MP16"],
  "GR-33281003": ["VLT-BV-1/2", "VLT-MP16"],
  "CRS-PARVA": ["VLT-BV-1/2", "STK-BLANCA60"],
  "THX-ERS80": ["VLT-BV-1/2", "VLT-PPR20", "VLT-PP-ELB20"],
  "RFR-BASE500-8": ["VLT-PPR25-AL", "VLT-PP-TEE20", "VLT-BV-1/2"],
  "TRT-STANDART170": ["IDS-VLS-BTH", "HG-71400"],
};

// Настройки магазина по умолчанию. Позже их можно будет менять в админке.
const SETTINGS: Record<string, string> = {
  city: "Тюмень",
  address: "г. Тюмень, ул. Примерная, 1",
  hours: "Пн–Сб 9:00–19:00, Вс 10:00–17:00",
  phone: "+7 (3452) 00-00-00",
  telegram: "delo_truba",
  email: "info@delo-truba.ru",
};

// SEED_CONTENT_ONLY=1 — только страницы, статьи, баннеры и настройки, без тестового каталога и без admin/admin12345.
// Так безопасно запускать на сервере: заказы и ваши товары не трогаются.
const CONTENT_ONLY = process.env.SEED_CONTENT_ONLY === "1";
// SEED_RESET_PAGES=1 — перезаписать тексты страниц («О магазине», «Доставка» и т.д.) заготовками из seed-content.ts.
// Внимание: правки этих страниц, сделанные в админке, пропадут.
const RESET_PAGES = process.env.SEED_RESET_PAGES === "1";

async function main() {
  if (!CONTENT_ONLY) await seedCatalog();
  await seedContent();
}

/** Тестовый каталог. ВНИМАНИЕ: удаляет все товары и категории (и строки заказов) перед созданием */
async function seedCatalog() {
  console.log("Очищаем каталог…");
  await db.productAttribute.deleteMany();
  await db.productImage.deleteMany();
  await db.productRelation.deleteMany();
  await db.orderItem.deleteMany();
  await db.product.deleteMany();
  await db.categoryAttribute.deleteMany();
  await db.category.deleteMany({ where: { parentId: { not: null } } });
  await db.category.deleteMany();
  await db.brand.deleteMany();
  await db.attribute.deleteMany();

  console.log("Создаём характеристики…");
  const attrIds = new Map<string, { id: number; numeric: boolean }>();
  for (const a of ATTRIBUTES) {
    const created = await db.attribute.create({
      data: { name: a.name, slug: slugify(a.name), unit: a.unit, isNumeric: a.numeric ?? false },
    });
    attrIds.set(a.name, { id: created.id, numeric: created.isNumeric });
  }

  console.log("Создаём категории…");
  const catIds = new Map<string, number>();
  for (const [i, c] of CATEGORIES.entries()) {
    const parentSlug = slugify(c.name);
    const parent = await db.category.create({
      data: {
        name: c.name,
        slug: parentSlug,
        image: `/images/products/${c.image}.svg`,
        description: c.description,
        isPopular: c.popular,
        sortOrder: i,
      },
    });
    catIds.set(c.name, parent.id);

    for (const [j, child] of c.children.entries()) {
      const created = await db.category.create({
        data: {
          name: child.name,
          slug: slugify(child.name),
          image: `/images/products/${child.image}.svg`,
          parentId: parent.id,
          sortOrder: j,
        },
      });
      catIds.set(child.name, created.id);
    }

    // Фильтры по характеристикам: для родителя и всех его подкатегорий
    const ids = [parent.id, ...c.children.map((ch) => catIds.get(ch.name)!)];
    for (const catId of ids) {
      await db.categoryAttribute.createMany({
        data: c.attributes.map((name, k) => ({ categoryId: catId, attributeId: attrIds.get(name)!.id, sortOrder: k })),
      });
    }
  }

  console.log("Создаём бренды и товары…");
  const brandIds = new Map<string, number>();
  for (const name of new Set(PRODUCTS.map((p) => p.brand))) {
    const b = await db.brand.create({ data: { name, slug: slugify(name) } });
    brandIds.set(name, b.id);
  }

  for (const [i, p] of PRODUCTS.entries()) {
    await db.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: slugify(p.name),
        categoryId: catIds.get(p.category)!,
        brandId: brandIds.get(p.brand),
        price: p.price,
        oldPrice: p.oldPrice,
        stock: p.stock ?? "IN_STOCK",
        unit: p.unit ?? "шт",
        isHit: p.hit ?? false,
        description: p.description,
        // Разная «популярность» и дата создания, чтобы сортировки отличались
        popularity: (i * 37) % 100,
        createdAt: new Date(Date.now() - i * 86_400_000),
        images: {
          create: [
            { url: `/images/products/${p.image}.svg`, alt: p.name, sortOrder: 0 },
            // У хитов — второе фото (упаковка), чтобы было видно галерею
            ...(p.hit ? [{ url: "/images/products/package.svg", alt: `${p.name} — упаковка`, sortOrder: 1 }] : []),
          ],
        },
        attributes: {
          create: Object.entries(p.attrs).map(([name, value]) => {
            const attr = attrIds.get(name);
            if (!attr) throw new Error(`Неизвестная характеристика: ${name}`);
            return {
              attributeId: attr.id,
              value: String(value),
              numValue: attr.numeric ? Number(value) : null,
            };
          }),
        },
      },
    });
  }

  console.log("Связываем товары «С этим товаром покупают»…");
  const bySku = new Map((await db.product.findMany({ select: { id: true, sku: true } })).map((p) => [p.sku, p.id]));
  for (const [from, list] of Object.entries(RELATIONS)) {
    await db.productRelation.createMany({
      data: list.map((to) => ({ fromId: bySku.get(from)!, toId: bySku.get(to)! })),
    });
  }

  console.log(`Каталог готов. Разделов: ${CATEGORIES.length}, товаров: ${PRODUCTS.length}.`);
}

async function seedContent() {
  console.log("Сохраняем настройки магазина…");
  for (const [key, value] of Object.entries(SETTINGS)) {
    // update: {} — не перезаписываем то, что уже поменяли в админке
    await db.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }

  console.log("Создаём страницы, статьи и баннеры…");
  // Только создаём недостающие: тексты, отредактированные в админке, не перезаписываются (кроме SEED_RESET_PAGES=1)
  for (const p of PAGES) {
    await db.page.upsert({ where: { slug: p.slug }, create: p, update: RESET_PAGES ? p : {} });
  }
  for (const [i, p] of POSTS.entries()) {
    await db.post.upsert({
      where: { slug: p.slug },
      create: { ...p, isPublished: true, publishedAt: new Date(Date.now() - i * 7 * 86_400_000) },
      update: {},
    });
  }
  if ((await db.banner.count()) === 0) {
    await db.banner.createMany({ data: BANNERS.map((b, i) => ({ ...b, sortOrder: i })) });
  }

  // Администратор для локальной разработки. На сервере создайте своего: npm run admin:create
  if (!CONTENT_ONLY && (await db.adminUser.count()) === 0) {
    await db.adminUser.create({ data: { login: "admin", passwordHash: await bcrypt.hash("admin12345", 12) } });
    console.log("Создан администратор admin / admin12345 — смените пароль перед запуском сайта!");
  }

  console.log("Готово.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
