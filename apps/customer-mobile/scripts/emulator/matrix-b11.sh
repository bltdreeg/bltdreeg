#!/usr/bin/env bash
# batch 11 polish at every size + 140% font: onboarding 01–03 (animated), confirmed 26, account + profile avatars, salon tabs.
# Must start ON the onboarding screen (dev gallery → "Show onboarding again"), signed in. Screenshots only: the looping
# onboarding art keeps the UI busy, so uiautomator dumps (tap.sh) would hang — swipes/deep links by coordinates instead.
# usage: matrix-b11.sh <outdir>
. "$(dirname "$0")/dev.sh"; OUT="$1"; mkdir -p "$OUT"
link() { "$ADB" $S shell am start -a android.intent.action.VIEW -d "'$1'" $PKG >/dev/null 2>&1; sleep 4; }
shot() { "$ADB" $S exec-out screencap -p > "$OUT/$1-ar-$2.png"; }
# RTL: the next slide comes in from the left → drag left-to-right
swipe() { local w="${1%x*}" h="${1#*x}"; "$ADB" $S shell input swipe $((w * $2 / 10)) $((h * 4 / 10)) $((w * $3 / 10)) $((h * 4 / 10)) 250; sleep 2.5; }
"$ADB" $S shell wm density 320; sleep 8

SIZES="${SIZES:-320x568:640x1136 360x640:720x1280 393x852:786x1704 430x932:860x1864 820x1180:1640x2360 1180x820:2360x1640}"
onboarding() {  # <suffix> <px>
  sleep 2.5; shot onboarding-1 "$1"; swipe "$2" 2 8; shot onboarding-2 "$1"; swipe "$2" 2 8; shot onboarding-3 "$1"; swipe "$2" 8 2; swipe "$2" 8 2
}
screens() {  # <suffix>
  for sc in "confirmed:beltadreeg:///booking/bk-past-1/confirmed" "account:beltadreeg:///account" "profile:beltadreeg:///account/profile"; do
    link "${sc#*:}"; shot "${sc%%:*}" "$1"
  done
}
if [ "${STAGE:-1}" = 1 ]; then
  for sz in $SIZES; do "$ADB" $S shell wm size "${sz#*:}"; sleep 3; onboarding "${sz%%:*}" "${sz#*:}"; done
  "$ADB" $S shell wm size 786x1704; "$ADB" $S shell settings put system font_scale 1.4; sleep 3; onboarding 393x852-f140 786x1704
  "$ADB" $S shell settings put system font_scale 1.0; "$ADB" $S shell wm size reset; "$ADB" $S shell wm density reset; sleep 8
  echo "stage 1 done — finish onboarding on the device (skip → ادخل على الصالونات), then: STAGE=2 $0 $OUT"
  exit 0
fi
for sz in $SIZES; do "$ADB" $S shell wm size "${sz#*:}"; sleep 3; screens "${sz%%:*}"; done
"$ADB" $S shell wm size 786x1704; "$ADB" $S shell settings put system font_scale 1.4; sleep 3; screens 393x852-f140
# salon tab strip at 140%: scroll to the last section → the active tab must stay visible
link "beltadreeg:///salon/s1"; for i in $(seq 1 14); do "$ADB" $S shell input swipe 393 1400 393 400 200; sleep 0.3; done; sleep 1.5; shot salon-tabs 393x852-f140
"$ADB" $S shell settings put system font_scale 1.0
python "$(dirname "$0")/sheet.py" "$(cygpath -m "$OUT")" ar
