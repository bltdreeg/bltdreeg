#!/usr/bin/env bash
# lists visible nodes with text/content-desc: text | class | bounds
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"
"$ADB" $S shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
"$ADB" $S exec-out cat /sdcard/ui.xml | PYTHONIOENCODING=utf-8 python -c "
import sys,xml.etree.ElementTree as ET
r=ET.fromstring(sys.stdin.buffer.read().decode())
for n in r.iter('node'):
  t=n.get('text') or n.get('content-desc')
  if t: print(repr(t), n.get('class').split('.')[-1], n.get('bounds'), 'checked' if n.get('checked')=='true' else '', 'sel' if n.get('selected')=='true' else '')"
