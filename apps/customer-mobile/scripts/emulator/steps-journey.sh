#!/usr/bin/env bash
# onboarding 01–03 → login → phone → OTP 1234 → Home
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
sleep 2; bash "$D/tap.sh" "يلا نبدأ"; sleep 2.5; bash "$D/tap.sh" "كمّل"; sleep 2.5
bash "$D/tap.sh" "عندي حساب"; sleep 2.5
bash "$D/tap.sh" "برقم الموبايل"; sleep 1.5
bash "$D/tap.sh" "+20"; sleep 1; "$ADB" $S shell input text 01023456789; sleep 1.5
bash "$D/tap.sh" "ابعت كود التأكيد"; sleep 3
"$ADB" $S shell input text 1234; sleep 5
