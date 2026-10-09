#!/usr/bin/env bash
# Home at 140% font (360×640) + area sheet at 360×640 and 820×1180
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
"$ADB" $S shell wm density 320; "$ADB" $S shell wm size 720x1280; "$ADB" $S shell settings put system font_scale 1.4; sleep 8
"$ADB" $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///home'" $PKG >/dev/null 2>&1; sleep 4
"$ADB" $S shell input tap 630 1190; sleep 1
"$ADB" $S exec-out screencap -p > "$OUT/home-ar-360x640-f140.png"
"$ADB" $S shell input swipe 700 1000 700 400 500; sleep 1.5
"$ADB" $S exec-out screencap -p > "$OUT/home-ar-360x640-f140-b.png"
"$ADB" $S shell settings put system font_scale 1.0; sleep 4
for sz in 720x1280:360x640 1640x2360:820x1180; do
  px="${sz%%:*}"; dp="${sz#*:}"; w="${px%%x*}"
  "$ADB" $S shell wm size "$px"; sleep 4
  "$ADB" $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///home'" $PKG >/dev/null 2>&1; sleep 3
  for i in 1 2 3; do "$ADB" $S shell input swipe $((w-20)) 400 $((w-20)) 1100 250; done; sleep 1
  bash "$D/tap.sh" "بنعرضلك" >/dev/null; sleep 2.5
  "$ADB" $S exec-out screencap -p > "$OUT/area-ar-$dp.png"
  bash "$D/tap.sh" "قفل" >/dev/null; sleep 1.5
done
