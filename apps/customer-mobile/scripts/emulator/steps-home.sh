#!/usr/bin/env bash
# Home → chip → area sheet → مدينة نصر (empty) → غيّر المنطقة → المعادي → offline (dev toggle) → online
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
sleep 2; "$ADB" $S shell input swipe 1060 1900 1060 900 600; sleep 2; "$ADB" $S shell input swipe 1060 900 1060 1900 600; sleep 1.5
"$ADB" $S shell input tap 199 562; sleep 2.5
bash "$D/tap.sh" "بنعرضلك"; sleep 2.5
"$ADB" $S shell input swipe 540 1800 540 1100 500; sleep 1.5
bash "$D/tap.sh" "مدينة نصر"; sleep 1; bash "$D/tap.sh" "أكّد المنطقة"; sleep 3
bash "$D/tap.sh" "غيّر المنطقة"; sleep 2; bash "$D/tap.sh" "المعادي"; sleep 1; bash "$D/tap.sh" "أكّد المنطقة"; sleep 3
"$ADB" $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///dev/design-system'" $PKG >/dev/null 2>&1; sleep 3
"$ADB" $S shell input tap 149 964; sleep 1; "$ADB" $S shell input keyevent 4; sleep 4
"$ADB" $S shell input swipe 1060 1900 1060 900 600; sleep 2
"$ADB" $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///dev/design-system'" $PKG >/dev/null 2>&1; sleep 3
"$ADB" $S shell input tap 149 964; sleep 1; "$ADB" $S shell input keyevent 4; sleep 4
