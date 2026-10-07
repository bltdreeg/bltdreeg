#!/usr/bin/env bash
# usage: waitshot.sh <out.png> — waits (≤30 s) until the app has drawn (not black/blank), then saves a full + half-size screenshot
DEV_SAVED=1 . "$(dirname "$0")/dev.sh"
OUT="$1"; W=$(cygpath -m "$OUT")
for i in $(seq 1 10); do
  "$ADB" $S exec-out screencap -p > "$OUT"
  v=$(python -c "
from PIL import Image
im=Image.open(r'$W').convert('L').resize((20,40)); px=list(im.getdata())
print(int(sum(px)/len(px)), len(set(px)))")
  [ "${v% *}" -gt 60 ] 2>/dev/null && [ "${v#* }" -gt 3 ] && break
  sleep 3
done
python -c "from PIL import Image; im=Image.open(r'$W'); im.resize((im.width//2, im.height//2)).save(r'${W%.png}-s.png')"
echo "${OUT%.png}-s.png"
