#!/bin/sh
set -eu

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_USERNAME="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-secret}"

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."

i=0
until php -r 'try { new PDO(
    "mysql:host=" . getenv("DB_HOST") . ";port=" . (getenv("DB_PORT") ?: "3306"),
    getenv("DB_USERNAME"),
    getenv("DB_PASSWORD")
); } catch (Throwable $e) { fwrite(STDERR, $e->getMessage() . PHP_EOL); exit(1); }'; do
    i=$((i + 1))
    if [ "$i" -ge 60 ]; then
        echo "MySQL did not become ready in time."
        exit 1
    fi
    sleep 2
done

if [ ! -f .env ]; then
    cp .env.example .env
fi

composer install --prefer-dist --no-progress --no-interaction

APP_KEY_VALUE=$(grep -E '^APP_KEY=' .env | cut -d= -f2- || true)
if [ -z "$APP_KEY_VALUE" ]; then
    php artisan key:generate --no-interaction --ansi
fi

if [ ! -d node_modules ] || [ ! -f node_modules/.bin/vite ]; then
    npm install --ignore-scripts
fi

if [ ! -f public/build/manifest.json ]; then
    npm run build
fi

php artisan storage:link --no-interaction --ansi >/dev/null 2>&1 || true

mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=8000 --admin-port=2019
