#!/usr/bin/env bash
# Bootstrap local env for make start: .env files, APP_KEY, storage dirs,
# and strip macOS AppleDouble (._*) files that break Docker on ExFAT.
set -euo pipefail

# Prevent new AppleDouble sidecars while we write files.
export COPYFILE_DISABLE=1

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

gen_key() {
  if command -v openssl >/dev/null 2>&1; then
    echo "base64:$(openssl rand -base64 32 | tr -d '\n')"
    return
  fi
  python3 -c 'import base64,os; print("base64:" + base64.b64encode(os.urandom(32)).decode())'
}

ensure_app_env() {
  local app="$1"
  local example="$app/.env.example"
  local env="$app/.env"

  if [[ ! -f "$example" ]]; then
    echo "error: missing $example" >&2
    exit 1
  fi

  if [[ ! -f "$env" ]]; then
    cp "$example" "$env"
    echo "created $env"
  fi

  if ! grep -qE '^APP_KEY=base64:' "$env"; then
    local key
    key="$(gen_key)"
    if grep -qE '^APP_KEY=' "$env"; then
      local tmp
      tmp="$(mktemp)"
      sed "s|^APP_KEY=.*|APP_KEY=${key}|" "$env" > "$tmp"
      mv "$tmp" "$env"
    else
      printf '\nAPP_KEY=%s\n' "$key" >> "$env"
    fi
    echo "generated APP_KEY for $app"
  fi
}

ensure_storage() {
  local app="$1"
  mkdir -p \
    "$app/storage/logs" \
    "$app/storage/framework/cache/data" \
    "$app/storage/framework/sessions" \
    "$app/storage/framework/views" \
    "$app/storage/framework/testing" \
    "$app/storage/app/public" \
    "$app/storage/app/private" \
    "$app/bootstrap/cache"
  # Prefer .gitignore keepers over .gitkeep (avoids empty-dir tooling creating ._*).
  [[ -f "$app/storage/logs/.gitignore" ]] || printf '*\n!.gitignore\n' > "$app/storage/logs/.gitignore"
  [[ -f "$app/bootstrap/cache/.gitignore" ]] || printf '*\n!.gitignore\n' > "$app/bootstrap/cache/.gitignore"
}

clean_appledouble() {
  local count
  count="$(find . -name '._*' -print 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "$count" -gt 0 ]]; then
    echo "removing $count AppleDouble (._*) file(s)"
    find . -name '._*' -delete 2>/dev/null || true
  fi
}

ensure_app_env central-app
ensure_app_env tenant-app
ensure_storage central-app
ensure_storage tenant-app
clean_appledouble
echo "env ready."
