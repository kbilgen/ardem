#!/usr/bin/env python3
"""Generate ARDEM's responsive image set from the source photographs.

Usage: python3 scripts/prepare-images.py
Reads assets/source/*.png and writes AVIF + WebP derivatives to public/images.
Re-run after replacing a source photo. Crops are defined in fractions of the
source image so they survive a same-framing replacement.
"""
from pathlib import Path
import random
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "source"
OUT = ROOT / "public" / "images"
OUT.mkdir(parents=True, exist_ok=True)

AVIF_Q, WEBP_Q = 58, 80


def save_set(im: Image.Image, name: str, widths):
    made = []
    for w in widths:
        w = min(w, im.width)
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS) if w != im.width else im
        r.save(OUT / f"{name}-{w}.avif", quality=AVIF_Q, speed=4)
        r.save(OUT / f"{name}-{w}.webp", quality=WEBP_Q, method=6)
        made.append(w)
    return made


def crop_frac(im, cx, cy, fw, fh):
    """Crop a box of fw x fh (fractions of width/height) centred on cx, cy, clamped inside."""
    W, H = im.size
    w, h = round(fw * W), round(fh * H)
    x = min(max(round(cx * W - w / 2), 0), W - w)
    y = min(max(round(cy * H - h / 2), 0), H - h)
    return im.crop((x, y, x + w, y + h))


def main():
    src = {k: Image.open(SRC / f"{k}.png").convert("RGB") for k in ("brilliance", "emerald", "pearl", "solitaire")}
    report = {}
    report["brilliance"] = save_set(src["brilliance"], "brilliance", [640, 1280])
    report["emerald"] = save_set(src["emerald"], "emerald", [640, 1200, 1700])
    report["pearl"] = save_set(src["pearl"], "pearl", [640, 1024])
    report["solitaire"] = save_set(src["solitaire"], "solitaire", [640, 1024])

    # Detail crops (close-up transitions)
    e = src["emerald"]
    report["emerald-halo"] = save_set(crop_frac(e, 0.505, 0.395, 0.23, 0.23), "emerald-halo", [391])
    report["emerald-shoulder"] = save_set(crop_frac(e, 0.625, 0.455, 0.16, 0.16), "emerald-shoulder", [272])
    p = src["pearl"]
    report["pearl-portrait"] = save_set(crop_frac(p, 0.52, 0.50, 0.75, 1.0), "pearl-portrait", [480, 768])
    report["pearl-macro"] = save_set(crop_frac(p, 0.523, 0.66, 0.42, 0.56), "pearl-macro", [430])

    # Pre-blurred silk backdrop for the emerald chapter (cheaper than a CSS blur on a large layer)
    silk = e.resize((520, 520), Image.LANCZOS).filter(ImageFilter.GaussianBlur(14))
    silk.save(OUT / "emerald-silk.avif", quality=50)
    silk.save(OUT / "emerald-silk.webp", quality=70)

    # Social preview
    s = src["solitaire"]
    og = crop_frac(s, 0.5, 0.5, 1.0, 630 / 1200).resize((1200, 630), Image.LANCZOS)
    og.save(ROOT / "public" / "og.jpg", quality=86, optimize=True)

    # Film grain tile: transparent background with sparse light and dark specks
    rnd = random.Random(7)
    g = Image.new("LA", (256, 256))
    px = g.load()
    for y in range(256):
        for x in range(256):
            v = rnd.random()
            if v < 0.5:
                a = int(rnd.random() * 46)
                c = 255 if rnd.random() < 0.55 else 0
                px[x, y] = (c, a)
    g.save(OUT / "grain.png", optimize=True)
    print(report)


if __name__ == "__main__":
    main()
