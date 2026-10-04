#!/usr/bin/env bash
# Резервная копия базы и загруженных фото. Хранит последние 14 копий.
# Запуск вручную: bash deploy/backup.sh
# Каждую ночь в 3:00 (crontab -e):  0 3 * * * bash /var/www/lavka/deploy/backup.sh >> /var/log/lavka-backup.log 2>&1
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
STAMP="$(date +%Y-%m-%d_%H-%M)"
mkdir -p "$BACKUP_DIR"

# Берём DATABASE_URL из .env проекта
DATABASE_URL="$(grep -E '^DATABASE_URL=' "$PROJECT_DIR/.env" | cut -d= -f2- | tr -d '"')"
# pg_dump не понимает параметр ?schema=public — отрезаем его
pg_dump "${DATABASE_URL%%\?*}" -Fc -f "$BACKUP_DIR/db_$STAMP.dump"

if [ -d "$PROJECT_DIR/uploads" ]; then
  tar -czf "$BACKUP_DIR/uploads_$STAMP.tar.gz" -C "$PROJECT_DIR" uploads
fi

# Удаляем старые копии
ls -1t "$BACKUP_DIR"/db_*.dump 2>/dev/null | tail -n +15 | xargs -r rm -- || true
ls -1t "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm -- || true
echo "$STAMP: резервная копия готова в $BACKUP_DIR"
