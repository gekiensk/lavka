#!/usr/bin/env bash
# Регистрирует сайт как службу на Raspberry Pi (запуск при включении, перезапуск после сбоя)
# и включает автообновление из GitHub каждые 5 минут.
# Запуск из папки проекта, от обычного пользователя (не root): bash deploy/pi/install.sh
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
UNIT_DIR="$HOME/.config/systemd/user"
NODE_BIN="$(command -v node)"
mkdir -p "$UNIT_DIR"

for unit in lavka.service lavka-update.service lavka-update.timer; do
  sed -e "s|@PROJECT_DIR@|$PROJECT_DIR|g" -e "s|@NODE_BIN@|$NODE_BIN|g" \
    "$PROJECT_DIR/deploy/pi/$unit" > "$UNIT_DIR/$unit"
done

# Чтобы службы работали без входа пользователя в систему и стартовали при включении Pi
sudo loginctl enable-linger "$USER"

systemctl --user daemon-reload
systemctl --user enable --now lavka.service
systemctl --user enable --now lavka-update.timer

echo "Готово. Сайт в домашней сети: http://$(hostname).local:3000"
echo "Состояние: systemctl --user status lavka   Лог: journalctl --user -u lavka -e"
