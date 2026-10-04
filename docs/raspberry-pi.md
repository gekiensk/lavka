# Сайт на Raspberry Pi 3B+

Инструкция для домашнего Raspberry Pi 3B+: сайт работает на нём круглосуточно, сам обновляется, когда в GitHub принимают изменения, а выбранные люди открывают его по ссылке из интернета.

**Честно о возможностях.** У Pi 3B+ всего 1 ГБ памяти. Для показа сайта знакомым этого хватает: сам сайт занимает 200–300 МБ. Тяжело ему только при сборке после обновления: она идёт 15–30 минут, и всё это время сайт не открывается. Для настоящего магазина с покупателями лучше VPS (раздел 5 в [README](../README.md)).

Что понадобится: Raspberry Pi 3B+, карта microSD от 16 ГБ (лучше 32 ГБ, класс A1/A2), блок питания 5 В 2,5 А, подключение к роутеру (кабель надёжнее Wi-Fi).

---

## 1. Система

1. На компьютере установите [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
2. Выберите устройство **Raspberry Pi 3**, систему **Raspberry Pi OS Lite (64-bit)** (в разделе «Raspberry Pi OS (other)»). Именно 64-bit: 32-битная не подойдёт.
3. Перед записью Imager предложит настройки, в них:
   - имя компьютера: `lavka`;
   - пользователь и пароль (например, пользователь `max`);
   - Wi-Fi, если без кабеля;
   - на вкладке «Службы» включите **SSH** по паролю.
4. Запишите карту, вставьте в Pi, включите. Через пару минут подключитесь с Windows (PowerShell):

```powershell
ssh max@lavka.local
```

Если `lavka.local` не находится, посмотрите IP-адрес Pi в настройках роутера и подключайтесь по нему: `ssh max@192.168.1.XX`.

Дальше все команды выполняются на Pi в этом окне.

## 2. Программы

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y git postgresql

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Файл подкачки 2 ГБ: без него сборка сайта не поместится в память
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Проверка: `node -v` показывает `v22…`, `free -h` в строке Swap показывает 2 ГБ или больше.

## 3. База данных

```bash
# Придумайте свой пароль вместо СЛОЖНЫЙ_ПАРОЛЬ
sudo -u postgres psql -c "CREATE USER lavka WITH PASSWORD 'СЛОЖНЫЙ_ПАРОЛЬ';"
sudo -u postgres psql -c "CREATE DATABASE lavka OWNER lavka;"
```

## 4. Сайт

```bash
cd ~
git clone https://github.com/gekiensk/lavka.git
cd lavka
cp .env.example .env
nano .env
```

В `.env` поменяйте:

```
DATABASE_URL="postgresql://lavka:СЛОЖНЫЙ_ПАРОЛЬ@localhost:5432/lavka?schema=public"
SESSION_SECRET="..."      # результат команды: openssl rand -base64 32
```

`NEXT_PUBLIC_SITE_URL` заполните позже, в шаге 6, когда появится адрес. Сохранить: `Ctrl+O`, `Enter`, выйти: `Ctrl+X`.

```bash
npm ci                                        # зависимости (10–20 минут)
npm run db:deploy                             # создать таблицы
```

Теперь одно из двух.

**А. Перенести данные с компьютера** (товары, заказы, настройки, фото). На Windows в PowerShell, в папке проекта:

```powershell
# pg_dump лежит в папке PostgreSQL, например C:\Program Files\PostgreSQL\17\bin
# Пользователь и база (здесь lavka и lavka) — как в DATABASE_URL в вашем .env на компьютере
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U lavka -Fc -f lavka.dump lavka
scp lavka.dump max@lavka.local:~/
scp -r uploads max@lavka.local:~/lavka/
```

Затем на Pi:

```bash
pg_restore --clean --if-exists --no-owner -d "postgresql://lavka:СЛОЖНЫЙ_ПАРОЛЬ@localhost:5432/lavka" ~/lavka.dump
```

**Б. Начать с тестовыми данными:** `npm run db:seed` (логин в админку `admin` / `admin12345` — сразу смените пароль).

## 5. Запуск и автообновление

```bash
NODE_OPTIONS=--max-old-space-size=1536 npm run build    # первая сборка, 15–30 минут
bash deploy/pi/install.sh
```

`install.sh` делает две вещи:

- регистрирует сайт как службу: он стартует при включении Pi и перезапускается после сбоя;
- каждые 5 минут проверяет GitHub. Если в ветку `main` попали новые изменения, Pi сам забирает их, обновляет базу, пересобирает и перезапускает сайт. Если сборка не удалась, возвращается прежняя версия.

Проверка: на компьютере в той же домашней сети откройте `http://lavka.local:3000`.

Полезные команды:

| Что | Команда |
|---|---|
| Состояние сайта | `systemctl --user status lavka` |
| Лог сайта | `journalctl --user -u lavka -e` |
| Лог обновлений | `journalctl --user -u lavka-update -e` |
| Обновить прямо сейчас | `systemctl --user start lavka-update` |
| Перезапустить сайт | `systemctl --user restart lavka` |

## 6. Ссылка для других людей

Проще всего через **Tailscale Funnel**: бесплатно, не нужен домен и не нужно открывать порты на роутере. Сайт получает постоянный адрес вида `https://lavka.имя-сети.ts.net` с HTTPS.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up            # покажет ссылку: откройте её на компьютере и войдите (Google, GitHub и т. п.)
sudo tailscale funnel --bg 3000
```

Последняя команда при первом запуске попросит включить Funnel в настройках Tailscale и даст ссылку на это — откройте и подтвердите, затем повторите команду. Она напечатает адрес сайта. Funnel запоминается и после перезагрузки Pi включается сам.

Впишите этот адрес в `.env` и пересоберите:

```bash
nano .env                    # NEXT_PUBLIC_SITE_URL="https://lavka.имя-сети.ts.net"
bash deploy/pi/update.sh --force     # пересборка, 15–30 минут
```

Адрес нужен для правильных ссылок и чтобы вход в админку работал по HTTPS.

Важно:

- Сайт по этой ссылке видит **любой**, кому вы её отправите. Поисковики его не найдут, пока ссылку нигде не публикуют, но это не пароль.
- Админка `/admin` тоже доступна по ссылке, поэтому пароль администратора должен быть надёжным: `npm run admin:create -- логин 'длинный пароль'`.
- Если нужно, чтобы сайт видели только конкретные люди, вместо Funnel пригласите их в свою сеть Tailscale (они ставят приложение Tailscale) и отключите Funnel: `sudo tailscale funnel --bg 3000 off`.
- Если у вас есть свой домен, вместо Tailscale можно использовать Cloudflare Tunnel — тогда сайт будет по вашему адресу.

## 7. Как Claude меняет сайт

**Основной способ, ничего настраивать не нужно.** Claude, как и раньше, делает изменения в GitHub и открывает PR. Вы смотрите и принимаете его (Merge). В течение 5 минут Pi сам подхватит изменения и пересоберёт сайт. Через 15–30 минут новая версия открывается по ссылке.

**Если нужно, чтобы Claude поработал прямо на Pi** (посмотреть логи, разобраться, почему сайт не открывается), установите на Pi Claude Code и запустите режим удалённого управления:

```bash
curl -fsSL https://claude.ai/install.sh | bash
cd ~/lavka
claude remote-control
```

После этого Claude в проекте сможет работать в папке `~/lavka` на Pi — каждый раз он будет спрашивать у вас разрешение. Учтите: Claude Code занимает заметную часть памяти Pi, поэтому держите его запущенным только на время работы. И пусть изменения в код всё равно идут через GitHub, иначе автообновление не сможет забрать новую версию.

## 8. Резервные копии

Карты памяти иногда выходят из строя. Включите ночные копии базы и фото:

```bash
crontab -e
# добавьте строку:
0 3 * * * bash /home/max/lavka/deploy/backup.sh >> /home/max/backup.log 2>&1
```

Копии лежат в `~/backups`. Время от времени забирайте их на компьютер: `scp -r max@lavka.local:~/backups .`
