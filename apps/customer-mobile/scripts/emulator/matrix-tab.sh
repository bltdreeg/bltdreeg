#!/usr/bin/env bash
# usage: [SIZES=...] [SCREENS=...] matrix.sh <outdir> <lang> — deep-links each screen at each size (density 320 => px = dp*2), then a contact sheet per screen
. "$(dirname "$0")/dev.sh"
OUT="$1"; LANG_="$2"; mkdir -p "$OUT"
SIZES="${SIZES:-360x640:720x1280 393x852:786x1704 430x932:860x1864 820x1180:1640x2360}"
SCREENS="${SCREENS:-login:beltadreeg:///login phone:beltadreeg:///login?method=phone register:beltadreeg:///register}"
"$ADB" $S shell wm density 320 >/dev/null
for sz in $SIZES; do
  dp="${sz%%:*}"; px="${sz#*:}"
  "$ADB" $S shell wm size "$px" >/dev/null; sleep 3
  for sc in $SCREENS; do
    name="${sc%%:*}"; url="${sc#*:}"
    "$ADB" $S shell am start -a android.intent.action.VIEW -d "'$url'" $PKG >/dev/null 2>&1; sleep 4
    w=${px%%x*}; h=${px#*x}; "$ADB" $S shell input tap $((w*7/8)) $((h-90)); sleep 1  # leave non-touch mode on the Home tab (no-op)
    "$ADB" $S exec-out screencap -p > "$OUT/$name-$LANG_-$dp.png"
  done
done
python "$(dirname "$0")/sheet.py" "$(cygpath -m "$OUT")" "$LANG_"
