#!/usr/bin/env bash
# usage: brandshots.sh <outdir> <light|dark> — launcher drawer + cold-start splash frames
export MSYS_NO_PATHCONV=1; ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"; S="-s emulator-5554"; PKG=com.beltadreeg.customer
OUT="$1"; M="$2"; mkdir -p "$OUT"
[ "$M" = dark ] && "$ADB" $S shell cmd uimode night yes >/dev/null || "$ADB" $S shell cmd uimode night no >/dev/null
"$ADB" $S shell am force-stop $PKG; "$ADB" $S shell input keyevent KEYCODE_HOME; sleep 2
"$ADB" $S exec-out screencap -p > "$OUT/home-$M.png"
"$ADB" $S shell input swipe 540 2000 540 600 300; sleep 2
"$ADB" $S exec-out screencap -p > "$OUT/drawer-$M.png"
"$ADB" $S shell input keyevent KEYCODE_HOME; sleep 1
"$ADB" $S shell am start -n $PKG/.MainActivity >/dev/null
for i in 1 2 3 4 5 6; do "$ADB" $S exec-out screencap -p > "$OUT/splash-$M-$i.png"; done
sleep 6; "$ADB" $S exec-out screencap -p > "$OUT/after-$M.png"
