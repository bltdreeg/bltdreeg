#!/usr/bin/env bash
# auth screens at 140% font, 360×640 (onboarding must be showing at start)
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
"$ADB" $S shell wm density 320; "$ADB" $S shell wm size 720x1280; "$ADB" $S shell settings put system font_scale 1.4; sleep 8
bash "$D/tap.sh" "تخطّي"; sleep 2; bash "$D/tap.sh" "عندي حساب"; sleep 3   # last slide → login marks onboarding seen
for sc in "login:beltadreeg:///login" "phone:beltadreeg:///login?method=phone" "register:beltadreeg:///register"; do
  n="${sc%%:*}"; u="${sc#*:}"
  "$ADB" $S shell am start -a android.intent.action.VIEW -d "'$u'" $PKG >/dev/null 2>&1; sleep 4
  "$ADB" $S shell input tap 360 300; sleep 1   # leave non-touch mode on the title (at 140% the guest link reaches y=110)
  "$ADB" $S exec-out screencap -p > "$OUT/$n-ar-360x640-f140.png"
done
bash "$D/otp-prep.sh" >/dev/null; sleep 3; "$ADB" $S exec-out screencap -p > "$OUT/otp-ar-360x640-f140-kb.png"; "$ADB" $S shell input keyevent 4; sleep 1.5
"$ADB" $S exec-out screencap -p > "$OUT/otp-ar-360x640-f140.png"
python "$D/sheet.py" "$(cygpath -m "$OUT")" ar
