#!/usr/bin/env bash
# batch 6 screens (bookings, search, account; signed in, then guest) at every size + 140% font.
# Must start signed in. Density 320 first (restarts JS = fresh mock), then joins one queue so "الحالية" has the live card.
# usage: matrix-tabs6.sh <outdir>   (signs out at the end)
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
t() { bash "$D/tap.sh" "$1" 2>/dev/null || { sleep 2; bash "$D/tap.sh" "$1"; }; }
link() { "$ADB" $S shell am start -a android.intent.action.VIEW -d "'$1'" $PKG >/dev/null 2>&1; sleep 4; }
shot() { "$ADB" $S exec-out screencap -p > "$OUT/$1-ar-$2.png"; }
for k in animator_duration_scale transition_animation_scale window_animation_scale; do "$ADB" $S shell settings put global $k 0; done
"$ADB" $S shell wm density 320; "$ADB" $S shell wm size 720x1280; sleep 10

link "beltadreeg://salon/s1"; "$ADB" $S shell input swipe 360 1000 360 550 500; sleep 2; t "ضيف قصة شعر،"; sleep 1
link "beltadreeg://salon/s1/book/review?barber=s1-b1"; t "أكّد ودخّلني الطابور"; sleep 3

SIZES="${SIZES:-320x568:640x1136 360x640:720x1280 393x852:786x1704 430x932:860x1864 820x1180:1640x2360 1180x820:2360x1640}"
signed() {  # <suffix>
  link "beltadreeg:///bookings"; "$ADB" $S shell input tap 20 20; sleep 1; shot bookings "$1"
  t "السابقة"; sleep 2; shot bookings-past "$1"; t "الحالية"; sleep 1
  link "beltadreeg:///search"; "$ADB" $S shell input tap 20 20; sleep 1; shot search "$1"
  link "beltadreeg:///search?sort=leastWait&open=1"; sleep 1; shot search-filtered "$1"
  t "فلترة وترتيب"; sleep 2; shot filter-sheet "$1"; "$ADB" $S shell input keyevent 4; sleep 1.5
  CLS=EditText t "دوّر"; sleep 1; "$ADB" $S shell input text zzz; sleep 2; shot search-none-kb "$1"
  "$ADB" $S shell input keyevent 4; sleep 1; shot search-none "$1"
  CLS=EditText t "zzz"; for _ in 1 2 3; do "$ADB" $S shell input keyevent 67; done; "$ADB" $S shell input keyevent 4; sleep 1
  link "beltadreeg:///account"; "$ADB" $S shell input tap 20 20; sleep 1; shot account "$1"
}
guest() {
  link "beltadreeg:///account"; "$ADB" $S shell input tap 20 20; sleep 1; shot account-guest "$1"
  link "beltadreeg:///bookings"; sleep 1; shot bookings-guest "$1"
}
each() {  # <fn>
  for sz in $SIZES; do dp="${sz%%:*}"; "$ADB" $S shell wm size "${sz#*:}"; sleep 3; $1 "$dp"; done
  "$ADB" $S shell wm size 786x1704; "$ADB" $S shell settings put system font_scale 1.4; sleep 3; $1 "393x852-f140"
  "$ADB" $S shell settings put system font_scale 1.0
}
each signed
"$ADB" $S shell wm size 786x1704; sleep 3; link "beltadreeg:///account"; "$ADB" $S shell input swipe 393 1400 393 400 300; sleep 1; t "تسجيل الخروج"; sleep 1.5; shot signout-dialog 393x852
t "اخرج من الحساب"; sleep 3
each guest
for k in animator_duration_scale transition_animation_scale window_animation_scale; do "$ADB" $S shell settings put global $k 1; done
python "$D/sheet.py" "$(cygpath -m "$OUT")" ar
