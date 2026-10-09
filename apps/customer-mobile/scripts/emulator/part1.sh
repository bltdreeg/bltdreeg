#!/usr/bin/env bash
# usage: SIZES=... part1.sh <outdir> — login/phone/register + keyboard-open + OTP at each size (Arabic)
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
"$ADB" $S shell wm density 320 >/dev/null
for sz in $SIZES; do
  dp="${sz%%:*}"; px="${sz#*:}"
  "$ADB" $S shell wm size "$px" >/dev/null; sleep 3
  for sc in login:beltadreeg:///login phone:beltadreeg:///login?method=phone register:beltadreeg:///register; do
    name="${sc%%:*}"; url="${sc#*:}"
    "$ADB" $S shell am start -a android.intent.action.VIEW -d "'$url'" $PKG >/dev/null 2>&1; sleep 4
    "$ADB" $S shell input tap $(( ${px%%x*} / 2 )) 110; sleep 1
    "$ADB" $S exec-out screencap -p > "$OUT/$name-ar-$dp.png"
    bash "$D/kb.sh" "$OUT/$name-ar-$dp-kb.png"
  done
  bash "$D/otp-prep.sh" >/dev/null; sleep 2
  "$ADB" $S exec-out screencap -p > "$OUT/otp-ar-$dp.png"
  "$ADB" $S shell input keyevent KEYCODE_BACK; sleep 1
done
python "$D/sheet.py" "$(cygpath -m "$OUT")" ar
