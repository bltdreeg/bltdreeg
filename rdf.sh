#!/usr/bin/env bash
# Remove macOS AppleDouble files (._*) created on non-HFS volumes.
# Always cleans from this script's directory (repo root) unless a path is given.
# Usage: ./remove-dot-underscore-files.sh [directory]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-$SCRIPT_DIR}"

if [[ ! -d "$ROOT" ]]; then
  echo "Error: directory not found: $ROOT" >&2
  exit 1
fi

echo "Scanning for ._* files under: $ROOT"

count=$(find "$ROOT" -name '._*' -print | wc -l | tr -d ' ')

if [[ "$count" -eq 0 ]]; then
  echo "No ._* files found."
  exit 0
fi

echo "Found $count file(s). Removing..."

find "$ROOT" -name '._*' -print -delete

remaining=$(find "$ROOT" -name '._*' -print | wc -l | tr -d ' ')
echo "Done. Remaining: $remaining"
