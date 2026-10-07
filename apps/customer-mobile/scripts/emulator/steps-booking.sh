#!/usr/bin/env bash
# Home → salon s1 → 2 services → "ادخل الطابور" → now → any barber → review → confirm → confirmed → queue.
# Coordinates are for the Pixel 9 default size (1080x2424); the footer CTA sits at y≈2250. Cold start first (clears the mock).
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
t() { bash "$D/tap.sh" "$1" 2>/dev/null || { sleep 2; bash "$D/tap.sh" "$1"; }; }
sleep 2; "$ADB" $S shell input swipe 540 1700 540 1000 300; sleep 1.5
t "صالون الكابتن حسام"; sleep 5
"$ADB" $S shell input swipe 540 1700 540 1350 300; sleep 1.5
t "ضيف قصة شعر،"; sleep 1; t "ضيف حلاقة دقن"; sleep 1.5
t "ادخل الطابور"; sleep 3.5
"$ADB" $S shell input tap 532 805; sleep 3    # step 1: show "احجز معاد" (days + times)
"$ADB" $S shell input tap 532 555; sleep 2    # back to "دلوقتي"
"$ADB" $S shell input tap 540 2250; sleep 3   # → barber
"$ADB" $S shell input tap 540 2250; sleep 3   # step 2: any barber → review
"$ADB" $S shell input tap 540 2245; sleep 4   # confirm → confirmed
"$ADB" $S shell input tap 720 1950; sleep 4   # تابع دورك → queue
[ -z "$NOWAIT" ] && sleep 25                # the queue moves on its own (recording)
