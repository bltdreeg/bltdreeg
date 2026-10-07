#!/usr/bin/env bash
# usage: SIZES=... otpshots.sh <outdir> — OTP screen at each size after a cold restart
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
"$ADB" $S shell wm density 320 >/dev/null
for sz in $SIZES; do
  dp="${sz%%:*}"; px="${sz#*:}"
  "$ADB" $S shell wm size "$px" >/dev/null
  bash "$D/coldstart.sh"
  bash "$D/otp-prep.sh" >/dev/null; sleep 2
  "$ADB" $S exec-out screencap -p > "$OUT/otp-ar-$dp.png"
done
python "$D/sheet.py" "$(cygpath -m "$OUT")" ar
