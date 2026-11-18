#!/usr/bin/env python3
"""Share cards for Wendel's Eugene Marathon plan.
Usage: python3 -I card.py data.json outdir
data.json: {"title","dateLabel","weekLine","km","time","pace","hr","coach","score","doneKm","allKm","days","goal"}
Writes outdir/run-post.jpg (1080x1350), outdir/run-story.jpg (1080x1920), outdir/run-overlay.png (transparent, for placing over your own photo).
"""
import json, os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = {
    "D": ("Bricolage.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf"),
    "B": ("DMSans.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf"),
}
FALLBACK = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font_path(key):
    name, url = FONTS[key]
    d = os.path.join(HERE, "fonts")
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name)
    if not os.path.exists(p) or os.path.getsize(p) < 10000:
        try:
            urllib.request.urlretrieve(url, p)
        except Exception:
            return None
    return p


def font(key, size, weight):
    p = font_path(key)
    if not p:
        return ImageFont.truetype(FALLBACK, size)
    f = ImageFont.truetype(p, size)
    try:
        vals = []
        for ax in f.get_variation_axes():
            n = ax["name"].decode() if isinstance(ax["name"], bytes) else ax["name"]
            vals.append(weight if n == "Weight" else min(ax["maximum"], max(ax["minimum"], ax["default"])))
        f.set_variation_by_axes(vals)
    except Exception:
        pass
    return f


def gradient(W, H):
    import numpy as np
    stops = [(0.0, (43, 63, 224)), (0.55, (123, 47, 247)), (1.0, (214, 0, 111))]
    y, x = np.mgrid[0:H, 0:W]
    t = (x * W + y * H) / float(W * W + H * H)
    out = np.zeros((H, W, 3), dtype=np.float32)
    for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
        m = (t >= t0) & (t <= t1)
        f = ((t - t0) / (t1 - t0))[..., None]
        seg = np.array(c0, dtype=np.float32) + f * (np.array(c1, dtype=np.float32) - np.array(c0, dtype=np.float32))
        out[m] = seg[m]
    return Image.fromarray(out.astype("uint8"), "RGB")


def fit(d, text, f, maxw):
    while d.textlength(text, font=f) > maxw and len(text) > 8:
        text = text[:-2]
    return text


def wrap(d, text, f, maxw, lines=2):
    out, line = [], ""
    for w in str(text).split():
        if d.textlength(line + w, font=f) > maxw and line:
            out.append(line.strip()); line = ""
            if len(out) >= lines:
                break
        line += w + " "
    if len(out) < lines and line.strip():
        out.append(line.strip())
    return out


def draw(v, story=False, overlay=False):
    W, H = 1080, (1920 if story else 1350)
    if overlay:
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    else:
        img = gradient(W, H).convert("RGBA")
        rings = Image.new("RGBA", (W, H), (0, 0, 0, 0)); rd = ImageDraw.Draw(rings)
        for r in range(180, 1500, 150):
            rd.ellipse([W + 60 - r, -40 - r, W + 60 + r, -40 + r], outline=(255, 255, 255, 26), width=3)
        img = Image.alpha_composite(img, rings)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    white = (255, 255, 255, 255); soft = (255, 255, 255, 235)
    panel = (17, 20, 45, 150) if overlay else (255, 255, 255, 41)
    top = 250 if story else 90
    y = top
    d.text((80, y), "ROAD TO EUGENE MARATHON · 25 APR 2027", font=font("B", 34, 700), fill=soft, anchor="ls")
    y += 62
    d.text((80, y), fit(d, f'{v.get("weekLine","")} · {v.get("dateLabel","")}'.strip(" ·"), font("B", 38, 700), W - 160), font=font("B", 38, 700), fill=white, anchor="ls")
    y += 122
    ft = font("D", 84, 800)
    d.text((80, y), fit(d, v.get("title", "Run"), ft, W - 160), font=ft, fill=white, anchor="ls")
    y += 330 if story else 270
    fk = font("D", 300, 800)
    km = str(v.get("km", ""))
    d.text((70, y), km, font=fk, fill=white, anchor="ls")
    d.text((90 + d.textlength(km, font=fk), y), "km", font=font("D", 90, 800), fill=white, anchor="ls")
    y += 70
    cols = [("Time", v.get("time", "–")), ("Pace /km", v.get("pace", "–")), ("Avg heart rate", (str(v["hr"]) + " bpm") if v.get("hr") else "–")]
    cw = (W - 160 - 40) / 3
    for n, (k, val) in enumerate(cols):
        x = 80 + n * (cw + 20)
        d.rounded_rectangle([x, y, x + cw, y + 170], 28, fill=panel)
        d.text((x + 24, y + 52), k, font=font("B", 30, 600), fill=soft, anchor="ls")
        d.text((x + 24, y + 132), str(val), font=font("D", 62, 800), fill=white, anchor="ls")
    y += 230
    if v.get("coach"):
        bh = 250 if story else 210
        d.rounded_rectangle([80, y, W - 80, y + bh], 28, fill=(255, 255, 255, 242))
        d.text((112, y + 54), "COACH" + (f' · {v["score"]}/10' if v.get("score") else ""), font=font("B", 28, 800), fill=(61, 90, 254, 255), anchor="ls")
        fh = font("D", 40, 700); ly = y + 110
        for line in wrap(d, v["coach"], fh, W - 230, 3 if story else 2):
            d.text((112, ly), line, font=fh, fill=(17, 20, 45, 255), anchor="ls"); ly += 52
    by = H - (330 if story else 190)
    d.rounded_rectangle([80, by, W - 80, by + 22], 11, fill=(255, 255, 255, 64))
    allk = float(v.get("allKm") or 0); done = float(v.get("doneKm") or 0)
    pw = max(22, (W - 160) * min(1.0, done / allk if allk else 0))
    d.rounded_rectangle([80, by, 80 + pw, by + 22], 11, fill=white)
    fb = font("B", 34, 700)
    d.text((80, by + 72), f"{round(done)} of {round(allk)} plan km", font=fb, fill=white, anchor="ls")
    d.text((W - 80, by + 72), f'{v.get("days","")} days to go · goal {v.get("goal","3:00–3:05")}', font=fb, fill=white, anchor="rs")
    if overlay:  # soft shadow so white text reads on any photo
        sh = lay.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda a: int(a * 0.55))
        shadow = Image.new("RGBA", (W, H), (10, 12, 29, 0)); shadow.putalpha(sh)
        img = Image.alpha_composite(img, shadow)
    return Image.alpha_composite(img, lay)


def main():
    v = json.load(open(sys.argv[1], encoding="utf-8")); out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    draw(v).convert("RGB").save(os.path.join(out, "run-post.jpg"), quality=93)
    draw(v, story=True).convert("RGB").save(os.path.join(out, "run-story.jpg"), quality=93)
    draw(v, overlay=True).save(os.path.join(out, "run-overlay.png"))
    print("ok", out)


if __name__ == "__main__":
    main()
