#!/usr/bin/env bash
# usage: [SIZES=...] ob.sh <outdir> <lang> <cta1> <cta2> — onboarding 01–03 at each size (onboarding must be showing)
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
OUT="$1"; L="$2"; mkdir -p "$OUT"
SIZES="${SIZES:-360x640:720x1280 393x852:786x1704 430x932:860x1864 820x1180:1640x2360}"
"$ADB" $S shell wm density 320 >/dev/null
for sz in $SIZES; do
  dp="${sz%%:*}"; px="${sz#*:}"; w="${px%%x*}"; h="${px#*x}"
  "$ADB" $S shell wm size "$px"; sleep 4
  "$ADB" $S shell input tap $((w/2)) $((h*35/100)); sleep 1  # leave non-touch mode (no-op on the illustration)
  # back to slide 1: RTL forward = finger moves right, so back = finger moves left (LTR: the opposite)
  if [ "$L" = ar ]; then a=$((w*8/10)); b=$((w*2/10)); else a=$((w*2/10)); b=$((w*8/10)); fi
  for i in 1 2; do "$ADB" $S shell input swipe $a $((h/2)) $b $((h/2)) 250; sleep 1.5; done
  "$ADB" $S exec-out screencap -p > "$OUT/ob1-$L-$dp.png"
  bash "$D/tap.sh" "$3" >/dev/null; sleep 2; "$ADB" $S exec-out screencap -p > "$OUT/ob2-$L-$dp.png"
  bash "$D/tap.sh" "$4" >/dev/null; sleep 2; "$ADB" $S exec-out screencap -p > "$OUT/ob3-$L-$dp.png"
done
python "$D/sheet.py" "$(cygpath -m "$OUT")" "$L"
