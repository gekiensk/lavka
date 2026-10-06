#!/usr/bin/env bash
# Автообновление сайта на Raspberry Pi.
# Если в ветке main на GitHub появились новые коммиты — забирает их, пересобирает сайт и перезапускает его.
# Запускается таймером lavka-update.timer каждые 5 минут (см. deploy/pi/install.sh).
# Вручную: bash deploy/pi/update.sh          — обновить, если есть что
#          bash deploy/pi/update.sh --force  — пересобрать в любом случае
# Лог: journalctl --user -u lavka-update -e
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BRANCH="${BRANCH:-main}"
cd "$PROJECT_DIR"

# Не запускать два обновления одновременно
exec 9>"${XDG_RUNTIME_DIR:-/tmp}/lavka-update.lock"
flock -n 9 || { echo "Обновление уже идёт"; exit 0; }

git fetch --quiet origin "$BRANCH"
OLD="$(git rev-parse HEAD)"
NEW="$(git rev-parse "origin/$BRANCH")"

if [ "$OLD" = "$NEW" ] && [ "${1:-}" != "--force" ]; then
  exit 0
fi

echo "$(date '+%F %T'): обновление ${OLD:0:7} → ${NEW:0:7}"

# У Pi 3B+ всего 1 ГБ памяти: сборке нужен файл подкачки и запас для Node.js
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export NEXT_TELEMETRY_DISABLED=1

# Внутри «if build» set -e не действует, поэтому шаги связаны через &&
build() {
  # Зависимости переустанавливаем, только если они поменялись (на Pi это долго)
  if [ ! -d node_modules ] || ! git diff --quiet "$1" "$2" -- package.json package-lock.json; then
    npm ci --no-audit --no-fund || return 1
  else
    npx prisma generate || return 1
  fi
  npm run db:deploy && npm run build
}

git merge --ff-only "origin/$BRANCH"

# Сайт останавливаем на время сборки: памяти на то и другое сразу не хватит
systemctl --user stop lavka.service || true

if build "$OLD" "$NEW"; then
  systemctl --user start lavka.service
  echo "$(date '+%F %T'): готово, сайт запущен на версии ${NEW:0:7}"
else
  echo "$(date '+%F %T'): СБОРКА НЕ УДАЛАСЬ — возвращаю прежнюю версию ${OLD:0:7}" >&2
  git reset --hard "$OLD"
  build "$NEW" "$OLD" || true
  systemctl --user start lavka.service
  exit 1
fi
