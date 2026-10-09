#!/usr/bin/env bash
# usage: kb.sh <out.png> — taps the last EditText on screen (keyboard opens), waits, screenshots
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"
"$ADB" $S shell rm -f /sdcard/ui.xml; "$ADB" $S shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
xy=$("$ADB" $S exec-out cat /sdcard/ui.xml | python -c "
import sys,re,xml.etree.ElementTree as ET
ns=[n for n in ET.fromstring(sys.stdin.buffer.read()).iter('node') if 'EditText' in n.get('class','')]
x1,y1,x2,y2=map(int,re.findall(r'\d+',ns[-1].get('bounds'))); print((x1+x2)//2,(y1+y2)//2)")
"$ADB" $S shell input tap $xy; sleep 2.5
"$ADB" $S exec-out screencap -p > "$1"
"$ADB" $S shell input keyevent KEYCODE_BACK; sleep 1
