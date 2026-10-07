#!/usr/bin/env bash
# fresh install state (pm clear), reopen through the dev-client link to Metro 8090, dismiss the dev-menu intro, wait for the RTL reload
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
"$ADB" $S shell pm clear $PKG >/dev/null; "$ADB" $S reverse tcp:8090 tcp:8090 >/dev/null
"$ADB" $S logcat -c
"$ADB" $S shell am start -a android.intent.action.VIEW -d "'exp+beltadreeg-customer://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8090'" $PKG >/dev/null 2>&1
for i in $(seq 1 40); do n=$("$ADB" $S logcat -d -s ReactNativeJS:V | grep -c 'Running "main"'); [ "$n" -ge 2 ] && break; sleep 3; done
sleep 6; bash "$D/tap.sh" "Continue" >/dev/null 2>&1; sleep 1.5
"$ADB" $S shell input keyevent 4 >/dev/null 2>&1; sleep 1   # closes the dev menu if it opened; harmless on onboarding (root)
