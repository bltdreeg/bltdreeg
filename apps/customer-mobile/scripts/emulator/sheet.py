import sys, glob, os, re
from PIL import Image
# contact sheet per screen from whatever sizes were shot: <name>-<lang>-<WxH>[-suffix].png, ordered by width then height
out, lang = sys.argv[1], sys.argv[2]
pat = re.compile(rf"^(.+?)-{lang}-(\d+)x(\d+)(-[\w.]+)?\.png$")
groups = {}
for p in glob.glob(f"{out}/*.png"):
    m = pat.match(os.path.basename(p))
    if m and not m.group(1).startswith("sheet"):
        groups.setdefault(m.group(1), []).append((int(m.group(2)), int(m.group(3)), m.group(4) or "", p))
for n, items in sorted(groups.items()):
    ims = [Image.open(p) for *_, p in sorted(items)]
    H = 900; ims = [im.resize((int(im.width*H/im.height), H)) for im in ims]
    sheet = Image.new("RGB", (sum(i.width for i in ims)+20*(len(ims)-1), H), "white"); x = 0
    for i in ims: sheet.paste(i, (x, 0)); x += i.width + 20
    sheet.save(f"{out}/sheet-{n}-{lang}.png"); print(f"{out}/sheet-{n}-{lang}.png")
