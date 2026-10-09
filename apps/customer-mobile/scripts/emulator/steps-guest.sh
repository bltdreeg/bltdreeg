#!/usr/bin/env bash
# guest: onboarding → "ادخل على الصالونات" → Home → login-required screen → login → back there → back → Home
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
sleep 1.5; bash "$D/tap.sh" "يلا نبدأ"; sleep 2; bash "$D/tap.sh" "كمّل"; sleep 2
bash "$D/tap.sh" "ادخل على الصالونات"; sleep 3
bash "$D/tap.sh" "حجوزاتي"; sleep 2; bash "$D/tap.sh" "الرئيسية"; sleep 2
"$ADB" $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///account/favorites'" $PKG >/dev/null 2>&1; sleep 4
CLS=EditText bash "$D/tap.sh" "البريد الإلكتروني"; sleep 1; "$ADB" $S shell input text karim.abdelrahman@gmail.com; sleep 1
CLS=EditText bash "$D/tap.sh" "كلمة السر"; sleep 1; "$ADB" $S shell input text barber2026; sleep 1
"$ADB" $S shell input keyevent 4; sleep 1
CLS=Button bash "$D/tap.sh" "دخول"; sleep 4; bash "$D/dump.sh" | sed -n 2,4p
"$ADB" $S shell input keyevent 4; sleep 3; bash "$D/dump.sh" | sed -n 2,4p
