#!/usr/bin/env bash
# usage: shots.sh <out-prefix> [devices...]   — emulates the brief's device classes on the emulator (density 320 => px = dp*2)
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
S="-s emulator-5554"
OUT="$1"; shift
DEVICES="${*:-se:750x1334 iphone15:786x1704 promax:860x1864 small:720x1280 ipad:1640x2360}"
mkdir -p "$(dirname "$OUT")"
for d in $DEVICES; do
  name="${d%%:*}"; size="${d#*:}"
  "$ADB" $S shell wm size "$size" >/dev/null
  "$ADB" $S shell wm density 320 >/dev/null
  sleep 3
  if [ -n "$URL" ]; then MSYS_NO_PATHCONV=1 "$ADB" $S shell am start -a android.intent.action.VIEW -d "$URL" com.beltadreeg.customer >/dev/null 2>&1; sleep 4; fi
  "$ADB" $S exec-out screencap -p > "${OUT}-${name}.png"
  echo "${OUT}-${name}.png"
done
"$ADB" $S shell wm size reset >/dev/null
"$ADB" $S shell wm density reset >/dev/null
