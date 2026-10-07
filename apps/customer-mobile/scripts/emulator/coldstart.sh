#!/usr/bin/env bash
# cold start the app and wait for the RTL reload to finish (2nd 'Running "main"', or 1 if already RTL) — max ~60 s
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"
"$ADB" $S shell am force-stop $PKG; "$ADB" $S logcat -c
"$ADB" $S shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
for i in $(seq 1 20); do
  n=$("$ADB" $S logcat -d -s ReactNativeJS:V | grep -c 'Running "main"')
  [ "$n" -ge 2 ] && break
  [ "$n" -ge 1 ] && [ "$i" -ge 6 ] && break
  sleep 3
done
sleep 5
