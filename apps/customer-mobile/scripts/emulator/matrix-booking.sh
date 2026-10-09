#!/usr/bin/env bash
# batch 5 screens at every size + 140% font. Density 320 first (restarts JS = fresh mock), then builds the state once:
# a queue booking (bk1, أحمد مجدي so it waits longer) and a fresh 2-service draft for s1. Animations off so uiautomator works.
# usage: matrix-booking.sh <outdir>
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
t() { bash "$D/tap.sh" "$1" 2>/dev/null || { sleep 2; bash "$D/tap.sh" "$1"; }; }
link() { "$ADB" $S shell am start -a android.intent.action.VIEW -d "'$1'" $PKG >/dev/null 2>&1; sleep 4; }
# services sit under the pinned tabs if we scroll too far, and under the booking bar if not far enough (360×640)
services() { link "beltadreeg://salon/s1"; "$ADB" $S shell input swipe 360 1000 360 550 500; sleep 2; t "ضيف قصة شعر،"; sleep 1; "$ADB" $S shell input swipe 360 1000 360 700 500; sleep 2; t "ضيف حلاقة دقن"; sleep 1; }
for k in animator_duration_scale transition_animation_scale window_animation_scale; do "$ADB" $S shell settings put global $k 0; done
"$ADB" $S shell wm density 320; "$ADB" $S shell wm size 720x1280; sleep 10

services; link "beltadreeg://salon/s1/book/review?barber=s1-b1"; t "أكّد ودخّلني الطابور"; sleep 3
services
SIZES="${SIZES:-320x568:640x1136 360x640:720x1280 393x852:786x1704 430x932:860x1864 820x1180:1640x2360 1180x820:2360x1640}"
shoot() {  # <suffix>
  for sc in "slot:beltadreeg://salon/s1/book/slot" "barber:beltadreeg://salon/s1/book/barber" "review:beltadreeg://salon/s1/book/review" \
            "confirmed:beltadreeg://booking/bk1/confirmed" "queue:beltadreeg://queue/bk1"; do
    n="${sc%%:*}"; link "${sc#*:}"; "$ADB" $S shell input tap 20 20; sleep 1
    "$ADB" $S exec-out screencap -p > "$OUT/$n-ar-$1.png"
  done
  link "beltadreeg://salon/s1/book/slot"; t "احجز معاد"; sleep 3; "$ADB" $S exec-out screencap -p > "$OUT/slot-schedule-ar-$1.png"
}
for sz in $SIZES; do
  dp="${sz%%:*}"; "$ADB" $S shell wm size "${sz#*:}"; sleep 3; shoot "$dp"
done
"$ADB" $S shell wm size 786x1704; "$ADB" $S shell settings put system font_scale 1.4; sleep 3; shoot "393x852-f140"
"$ADB" $S shell settings put system font_scale 1.0
for k in animator_duration_scale transition_animation_scale window_animation_scale; do "$ADB" $S shell settings put global $k 1; done
python "$D/sheet.py" "$(cygpath -m "$OUT")" ar
