#!/usr/bin/env bash
# Fresh install state on the emulator (app data cleared, Metro host re-set), launch, wait for the RTL reload to finish
export MSYS_NO_PATHCONV=1
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"; S="-s emulator-5554"; PKG=com.beltadreeg.customer
"$ADB" $S shell pm clear $PKG >/dev/null
"$ADB" $S push "$(cygpath -w "$TEMP/rnprefs.xml")" /data/local/tmp/rnprefs.xml >/dev/null
"$ADB" $S shell "run-as $PKG mkdir -p shared_prefs; run-as $PKG cp /data/local/tmp/rnprefs.xml shared_prefs/${PKG}_preferences.xml"
"$ADB" $S logcat -c
"$ADB" $S shell am start -n $PKG/.MainActivity >/dev/null
for i in $(seq 1 40); do n=$("$ADB" $S logcat -d -s ReactNativeJS:V | grep -c 'Running "main"'); [ "$n" -ge 2 ] && break; sleep 3; done
sleep 8
