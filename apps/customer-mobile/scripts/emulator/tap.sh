#!/usr/bin/env bash
# usage: [CLS=class] tap.sh "<text or content-desc substring>" — taps the centre of the first matching node
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"
"$ADB" $S shell rm -f /sdcard/ui.xml; "$ADB" $S shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
xy=$("$ADB" $S exec-out cat /sdcard/ui.xml | PYTHONIOENCODING=utf-8 python -c "
import sys,re,xml.etree.ElementTree as ET
q=sys.argv[1]; root=ET.fromstring(sys.stdin.buffer.read().decode('utf-8'))
for n in root.iter('node'):
    if (q in (n.get('text') or '') or q in (n.get('content-desc') or '')) and sys.argv[2] in n.get('class',''):
        x1,y1,x2,y2=map(int,re.findall(r'\d+',n.get('bounds'))); print((x1+x2)//2,(y1+y2)//2); break
" "$1" "${CLS:-}")
[ -z "$xy" ] && { echo "not found: $1"; exit 1; }
"$ADB" $S shell input tap $xy; echo "tapped $1 @ $xy"
