#!/usr/bin/env bash
# usage: rec.sh <out.mp4> <steps-script> — screenrecord around a steps script (max 170 s)
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"
"$ADB" $S shell rm -f /sdcard/rec.mp4
"$ADB" $S shell screenrecord --bit-rate 6000000 --time-limit 170 /sdcard/rec.mp4 & RP=$!
sleep 1.5; bash "$2"; sleep 2
"$ADB" $S shell pkill -INT screenrecord; wait $RP 2>/dev/null; sleep 2
"$ADB" $S pull /sdcard/rec.mp4 "$(cygpath -w "$1")" >/dev/null && echo "saved $1"
