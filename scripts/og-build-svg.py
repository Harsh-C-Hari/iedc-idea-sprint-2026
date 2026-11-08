"""
og-build-svg.py — builds public/images/og-image.svg with ALL text converted to vector outlines, so the
SVG renders identically anywhere (no font install, no browser). Dev-only helper; not part of the app.

  pip install fonttools brotli
  python scripts/og-build-svg.py && node scripts/gen-og.mjs

Fonts: the site's own self-hosted woff2 files (Archivo Black, Space Grotesk instanced at wght 700).
Palette: cream #F2EBDD, near-black #171717, orange #F05A28, lime #D9F36A, orange-deep #D94A1A.
"""
import base64, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
CREAM, INK, ORANGE, LIME, DEEP = '#F2EBDD', '#171717', '#F05A28', '#D9F36A', '#D94A1A'

display = TTFont(ROOT / 'public/fonts/archivo-black-latin.woff2')
body = instancer.instantiateVariableFont(TTFont(ROOT / 'public/fonts/space-grotesk-latin.woff2'), {'wght': 700})


def text_path(font, text, size, x, y, tracking=0.0, anchor='start'):
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font['hmtx']
    s = size / font['head'].unitsPerEm
    names = [cmap[ord(c)] for c in text]
    width = sum(hmtx[n][0] * s + tracking for n in names) - tracking
    cx = x - width if anchor == 'end' else x
    d = []
    for n in names:
        pen = SVGPathPen(gs)
        gs[n].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))  # flip Y into SVG space
        d.append(pen.getCommands())
        cx += hmtx[n][0] * s + tracking
    return ' '.join(d), width


def txt(font, text, size, x, y, fill, tracking=0.0, anchor='start', label=None):
    d, w = text_path(font, text, size, x, y, tracking, anchor)
    return f'<path aria-label="{label or text}" d="{d}" fill="{fill}"/>', w


logo = base64.b64encode((ROOT / 'public/images/iedc-logo.png').read_bytes()).decode()
parts = [
    f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 630" width="1200" height="630">',
    '<title>IDEA SPRINT 2026 — IEDC BOOTCAMP CEC</title>',
    f'<rect width="1200" height="630" fill="{CREAM}"/>',
]
widths = {}
p, _ = txt(body, 'IEDC BOOTCAMP CEC · 24-HOUR IDEATHON', 26, 60, 78, INK, 3); parts.append(p)
for line, y in (('IDEA', 215), ('SPRINT', 335), ('2026', 455)):
    p, w = txt(display, line, 140, 56, y, DEEP, -3); parts.append(p); widths[line] = w

# Logo card with a hard orange block (the site's .brutal look)
cx, cy, cw, ch, off = 770, 105, 350, 290, 16
parts.append(f'<rect x="{cx+off}" y="{cy+off}" width="{cw}" height="{ch}" fill="{ORANGE}" stroke="{INK}" stroke-width="5"/>')
parts.append(f'<rect x="{cx}" y="{cy}" width="{cw}" height="{ch}" fill="{CREAM}" stroke="{INK}" stroke-width="5"/>')
lw = 280; lh = lw * 333 / 560
parts.append(f'<image x="{cx+(cw-lw)/2}" y="{cy+(ch-lh)/2}" width="{lw}" height="{lh}" href="data:image/png;base64,{logo}" xlink:href="data:image/png;base64,{logo}"/>')

# Info bar
parts.append(f'<rect y="495" width="1200" height="135" fill="{INK}"/>')
p, _ = txt(body, '20–21 NOVEMBER 2026', 40, 60, 558, LIME, 1); parts.append(p)
p, _ = txt(body, '5:00 PM – 5:00 PM', 40, 1140, 558, CREAM, 1, 'end'); parts.append(p)
p, vw = txt(body, 'SPDK ROOM, 5TH FLOOR · COLLEGE OF ENGINEERING CHENGANNUR', 26, 60, 603, CREAM, 1.5); parts.append(p)
parts.append('</svg>')

out = ROOT / 'public/images/og-image.svg'
out.write_text('\n'.join(parts), encoding='utf-8')
print('wrote', out.relative_to(ROOT), out.stat().st_size, 'bytes | title widths', {k: round(v) for k, v in widths.items()}, '| venue line width', round(vw))
