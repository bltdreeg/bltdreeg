#!/usr/bin/env bash
# onboarding animations: swipe forward through 01–03 (RTL: finger moves right), back again, then the CTA path
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
sleep 3
for i in 1 2; do "$ADB" $S shell input swipe 200 1200 880 1200 300; sleep 3.5; done
for i in 1 2; do "$ADB" $S shell input swipe 880 1200 200 1200 300; sleep 3.5; done
bash "$D/tap.sh" "يلا نبدأ"; sleep 3.5; bash "$D/tap.sh" "كمّل"; sleep 4
