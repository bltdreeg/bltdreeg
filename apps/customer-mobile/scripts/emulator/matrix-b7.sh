#!/usr/bin/env bash
# batch 7 screens at every size + 140% font, then favorites empty + guest views (signs out at the end).
# Must start signed in on a fresh mock (cold start): bk-past-1 unrated, bk-past-2 rated, favorites s1/s3/s5.
# usage: matrix-b7.sh <outdir>
. "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
t() { bash "$D/tap.sh" "$1" 2>/dev/null || { sleep 2; bash "$D/tap.sh" "$1"; }; }
link() { "$ADB" $S shell am start -a android.intent.action.VIEW -d "'$1'" $PKG >/dev/null 2>&1; sleep 4; }
shot() { "$ADB" $S exec-out screencap -p > "$OUT/$1-ar-$2.png"; }
for k in animator_duration_scale transition_animation_scale window_animation_scale; do "$ADB" $S shell settings put global $k 0; done
"$ADB" $S shell wm density 320; "$ADB" $S shell wm size 720x1280; sleep 10

SIZES="${SIZES:-320x568:640x1136 360x640:720x1280 393x852:786x1704 430x932:860x1864 820x1180:1640x2360 1180x820:2360x1640}"
screens() {  # <suffix>
  for sc in "rate:beltadreeg:///booking/bk-past-1/rate" "rating-sent:beltadreeg:///booking/bk-past-2/rate/sent" "notifications:beltadreeg:///home/notifications" \
            "favorites:beltadreeg:///account/favorites" "profile:beltadreeg:///account/profile" "notification-settings:beltadreeg:///account/notification-settings" "help:beltadreeg:///account/help"; do
    n="${sc%%:*}"; link "${sc#*:}"; "$ADB" $S shell input tap 20 20; sleep 1; shot "$n" "$1"
  done
  link "beltadreeg:///account/profile"; CLS=EditText t "كريم"; sleep 2; shot profile-kb "$1"; "$ADB" $S shell input keyevent 4; sleep 1
  link "beltadreeg:///account/help"; CLS=EditText t "دوّر"; sleep 2; shot help-kb "$1"; "$ADB" $S shell input keyevent 4; sleep 1
}
for sz in $SIZES; do dp="${sz%%:*}"; "$ADB" $S shell wm size "${sz#*:}"; sleep 3; screens "$dp"; done
"$ADB" $S shell wm size 786x1704; "$ADB" $S shell settings put system font_scale 1.4; sleep 3; screens "393x852-f140"
"$ADB" $S shell settings put system font_scale 1.0; sleep 3

# favorites empty: take the three seeded favorites off from their salon pages
for s in s1 s3 s5; do link "beltadreeg:///salon/$s"; t "شيل من المفضلة"; sleep 1; done
link "beltadreeg:///account/favorites"; sleep 1; shot favorites-empty 393x852
# guest views
link "beltadreeg:///account"; "$ADB" $S shell input swipe 393 1400 393 400 300; sleep 1; t "تسجيل الخروج"; sleep 1.5; t "اخرج من الحساب"; sleep 3
for sc in "notifications-guest:beltadreeg:///home/notifications" "favorites-guest:beltadreeg:///account/favorites"; do link "${sc#*:}"; shot "${sc%%:*}" 393x852; done
for k in animator_duration_scale transition_animation_scale window_animation_scale; do "$ADB" $S shell settings put global $k 1; done
python "$D/sheet.py" "$(cygpath -m "$OUT")" ar
