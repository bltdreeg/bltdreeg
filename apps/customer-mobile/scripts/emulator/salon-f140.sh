#!/usr/bin/env bash
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
"$ADB" $S shell wm density 320; "$ADB" $S shell wm size 720x1280; "$ADB" $S shell settings put system font_scale 1.4; sleep 8
"$ADB" $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///salon/s1'" $PKG >/dev/null 2>&1; sleep 5
"$ADB" $S exec-out screencap -p > "$OUT/salon-ar-360x640-f140-a.png"
"$ADB" $S shell input swipe 700 1000 700 300 500; sleep 1.5
"$ADB" $S exec-out screencap -p > "$OUT/salon-ar-360x640-f140-b.png"
bash "$D/tap.sh" "التقييمات" >/dev/null; sleep 2
"$ADB" $S exec-out screencap -p > "$OUT/salon-ar-360x640-f140-c.png"
bash "$D/tap.sh" "المواعيد" >/dev/null; sleep 2
"$ADB" $S exec-out screencap -p > "$OUT/salon-ar-360x640-f140-d.png"
