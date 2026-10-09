# Builds every launcher / splash / notification asset from the web logo — the logo itself is never redrawn.
# Source: assets/brand/source/logo-mark.png (= apps/web/public/logo-mark.png, branch feat/update-web-app @ abc16d3).
# Run from apps/customer-mobile:  python scripts/brand-assets.py   (needs Pillow)
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "assets" / "brand"
logo = Image.open(ROOT / "source" / "logo-mark.png").convert("RGBA")
logo = logo.crop(logo.getbbox())


def place(canvas: int, height_ratio: float, bg=(0, 0, 0, 0), art: Image.Image = logo) -> Image.Image:
    """Logo scaled to `height_ratio` of the canvas, centred."""
    h = round(canvas * height_ratio)
    w = round(art.width * h / art.height)
    out = Image.new("RGBA", (canvas, canvas), bg)
    out.alpha_composite(art.resize((w, h), Image.LANCZOS), ((canvas - w) // 2, (canvas - h) // 2))
    return out


def silhouette(color=(255, 255, 255)) -> Image.Image:
    """One-colour mark from the alpha channel (scissors stay cut out)."""
    s = Image.new("RGBA", logo.size, color + (0,))
    s.putalpha(logo.getchannel("A"))
    return s


# iOS: 1024 opaque, white like the web's apple-icon.png (logo ≈ 72% of the height there; iOS adds the squircle)
place(1024, 0.70, (255, 255, 255, 255)).convert("RGB").save(ROOT / "icon-ios.png")
# Android adaptive: 108dp canvas, launchers mask to a circle/squircle inside the central 66dp —
# the logo's bounding box (diagonal ≈ 1.38× its height) must fit that circle → height 0.47 of the canvas
place(1024, 0.47).save(ROOT / "adaptive-foreground.png")
place(1024, 0.47, art=silhouette((0, 0, 0))).save(ROOT / "adaptive-monochrome.png")
# Status-bar notification icon: white silhouette, transparent, 96×96 (xxxhdpi of 24dp)
place(96, 0.83, art=silhouette()).save(ROOT / "notification-icon.png")
# Splash: the logo as-is on white; app.json sets its width (≈ 35% of a 393dp phone)
logo.save(ROOT / "splash-logo.png")
# Web favicon
place(48, 0.9).save(ROOT / "favicon.png")

for p in sorted(ROOT.glob("*.png")):
    print(p.name, Image.open(p).size)
