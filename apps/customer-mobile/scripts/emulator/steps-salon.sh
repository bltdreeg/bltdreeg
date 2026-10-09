#!/usr/bin/env bash
# Home → salon s1 → select 2 services → tabs (الحلاقين، التقييمات، المواعيد) → gallery → +N → back → back
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
sleep 2; "$ADB" $S shell input swipe 540 1700 540 1000 300; sleep 1.5
bash "$D/tap.sh" "صالون الكابتن حسام"; sleep 5
"$ADB" $S shell input swipe 540 1700 540 1350 300; sleep 1.5
bash "$D/tap.sh" "ضيف قصة شعر،"; sleep 1; bash "$D/tap.sh" "ضيف حلاقة دقن"; sleep 1.5
bash "$D/tap.sh" "الحلاقين"; sleep 2.5
bash "$D/tap.sh" "العروض"; sleep 2.5
bash "$D/tap.sh" "التقييمات"; sleep 2.5
bash "$D/tap.sh" "المواعيد"; sleep 2.5
bash "$D/tap.sh" "الخدمات"; sleep 2.5
"$ADB" $S shell input swipe 1060 700 1060 2000 400; sleep 1.5
"$ADB" $S shell input tap 540 330; sleep 3
bash "$D/tap.sh" "٩"; sleep 2
"$ADB" $S shell input keyevent 4; sleep 2; "$ADB" $S shell input keyevent 4; sleep 2
