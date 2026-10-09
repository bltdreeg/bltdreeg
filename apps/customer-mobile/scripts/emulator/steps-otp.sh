#!/usr/bin/env bash
# wrong OTP → error + attempts left → resend timer runs out → "ابعتلي كود جديد" → timer restarts
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
sleep 1.5; bash "$D/tap.sh" "تخطّي"; sleep 2.5
bash "$D/tap.sh" "عندي حساب"; sleep 2.5
bash "$D/tap.sh" "برقم الموبايل"; sleep 1.5
bash "$D/tap.sh" "+20"; sleep 1; "$ADB" $S shell input text 01023456789; sleep 1.5
bash "$D/tap.sh" "ابعت كود التأكيد"; sleep 3
"$ADB" $S shell input text 1111; sleep 3; bash "$D/dump.sh" | grep -vE "Tools" | sed -n 3,9p
for k in 1 2 3 4; do "$ADB" $S shell input keyevent 67; done; sleep 2   # deleting clears the error → the countdown shows
# uiautomator can't dump while the empty cell's caret blinks → wait out the 60 s timer, tap the resend button by position (1080×2424)
sleep 62; "$ADB" $S shell input tap 540 1436; sleep 4
"$ADB" $S exec-out screencap -p > "$(dirname "$D")/s0/otp-resent.png"
