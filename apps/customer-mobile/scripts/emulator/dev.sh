# sourced by the helper scripts: device, adb, package, and restore-on-exit of the device's own display settings
export MSYS_NO_PATHCONV=1
ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"; DEV="${DEV:-emulator-5554}"; S="-s $DEV"; PKG=com.beltadreeg.customer
if [ -z "$DEV_SAVED" ]; then
  export DEV_SAVED=1
  _SIZE0=$("$ADB" $S shell wm size | tr -d '\r' | awk '/Override/{print $3}')
  _DENS0=$("$ADB" $S shell wm density | tr -d '\r' | awk '/Override/{print $3}')
  _FONT0=$("$ADB" $S shell settings get system font_scale | tr -d '\r')
  dev_restore() {
    if [ -n "$_SIZE0" ]; then "$ADB" $S shell wm size "$_SIZE0"; else "$ADB" $S shell wm size reset; fi
    if [ -n "$_DENS0" ]; then "$ADB" $S shell wm density "$_DENS0"; else "$ADB" $S shell wm density reset; fi
    "$ADB" $S shell settings put system font_scale "${_FONT0:-1.0}"
  }
  trap dev_restore EXIT
fi
