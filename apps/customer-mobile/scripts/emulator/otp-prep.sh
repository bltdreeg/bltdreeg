#!/usr/bin/env bash
# creates a pending login OTP challenge for the demo phone (density must already be final — a density change restarts JS)
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"; D="$(dirname "$0")"
"$ADB" $S shell am start -a android.intent.action.VIEW -d "'beltadreeg:///login?method=phone'" $PKG >/dev/null 2>&1; sleep 4
bash "$D/tap.sh" "+20"; sleep 1; "$ADB" $S shell input text 01023456789; sleep 1
bash "$D/tap.sh" "${SEND_LABEL:-ابعت كود التأكيد}"; sleep 3
