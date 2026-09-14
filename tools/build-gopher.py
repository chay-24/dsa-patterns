#!/usr/bin/env python3
"""
Turn the official Go gopher vector into a React component.

Source: https://github.com/golang-samples/gopher-vector (gopher.svg)
  character design : Renée French   — http://reneefrench.blogspot.com/
  vector artwork   : Takuya Ueda
  licence          : CC BY 3.0      — https://creativecommons.org/licenses/by/3.0/

Changes made here, as CC BY requires them to be stated. The artwork itself is
unmodified; the only edits are structural, so it can be animated:
  - each eye (white + pupil) is wrapped in a <g className="logo-eye">
  - each pupil group is tagged so it can glide to the centre of its eye
  - the viewBox is cropped when the component is asked for the head

"""
import re
import sys
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/gopher_gopher.svg")
OUT = Path("components/gopher.tsx")

svg = SRC.read_text()
inner = svg[svg.index(">", svg.index("<svg")) + 1 : svg.rindex("</svg>")]

# ── split into top-level elements ─────────────────────────────────────────
els, depth, buf = [], 0, ""
for tok in re.split(r"(<[^>]+>)", inner):
    if not tok.strip():
        continue
    buf += tok
    if tok.startswith("<") and not tok.startswith("</"):
        if not tok.endswith("/>"):
            depth += 1
    elif tok.startswith("</"):
        depth -= 1
    if depth == 0 and buf.strip():
        els.append(buf.strip())
        buf = ""

def find(pred):
    for i, e in enumerate(els):
        if pred(e):
            return i
    raise SystemExit(f"element not found")

# the two eye whites and the two pupil groups, located by their coordinates
i_white_r = find(lambda e: "M206.169,94.16" in e)
i_white_l = find(lambda e: "M83.103,104.35" in e)
i_pupil_l = find(lambda e: 'cx="107.324"' in e)
i_pupil_r = find(lambda e: 'cx="231.571"' in e)

# Tag the pupils so CSS can slide them to the centre of each eye — the
# original artwork has the gopher glancing to one side.
pupil_l = els[i_pupil_l].replace("<g>", '<g className="logo-pupil logo-pupil-l">', 1)
pupil_r = els[i_pupil_r].replace("<g>", '<g className="logo-pupil logo-pupil-r">', 1)

left = f'<g className="logo-eye">{els[i_white_l]}{pupil_l}</g>'
right = f'<g className="logo-eye">{els[i_white_r]}{pupil_r}</g>'

rebuilt = []
for i, e in enumerate(els):
    if i in (i_pupil_l, i_pupil_r):
        continue                      # folded into their groups
    if i == i_white_l:
        rebuilt.append(left)
    elif i == i_white_r:
        rebuilt.append(right)
    else:
        rebuilt.append(e)
body = "".join(rebuilt)

# ── SVG attributes → JSX props ────────────────────────────────────────────
for a, b in [
    ("fill-rule=", "fillRule="),
    ("clip-rule=", "clipRule="),
    ("stroke-width=", "strokeWidth="),
    ("stroke-linecap=", "strokeLinecap="),
    ("stroke-linejoin=", "strokeLinejoin="),
    ("stroke-miterlimit=", "strokeMiterlimit="),
    ("enable-background=", "enableBackground="),
]:
    body = body.replace(a, b)
body = re.sub(r"\s+", " ", body).replace("> <", "><").strip()

OUT.write_text(f'''import {{ cn }} from "@/lib/utils";

/**
 * The official Go gopher.
 *
 *   character  Renée French   http://reneefrench.blogspot.com/
 *   vector     Takuya Ueda    https://github.com/golang-samples/gopher-vector
 *   licence    CC BY 3.0      https://creativecommons.org/licenses/by/3.0/
 *
 * Changes from the original, as the licence requires us to state. The artwork
 * itself is untouched; the edits are structural, so it can be animated:
 * each eye (white plus pupil) is wrapped in a `logo-eye` group, each pupil is
 * tagged `logo-pupil` so it can glide to the centre of its eye, and
 * `crop="head"` narrows the viewBox for use at icon size.
 *
 * Regenerate with: python3 tools/build-gopher.py <gopher.svg>
 */

/** Full figure, and a head-and-shoulders crop that reads at small sizes. */
const VIEW_BOX = {{
  full: "0 0 401.98 559.472",
  head: "8 6 386 320",
}} as const;

export function Gopher({{
  height = 40,
  crop = "head",
  className,
}}: {{
  height?: number;
  crop?: keyof typeof VIEW_BOX;
  className?: string;
}}) {{
  return (
    <svg
      viewBox={{VIEW_BOX[crop]}}
      height={{height}}
      role="img"
      aria-label="The Go gopher"
      className={{cn("block shrink-0", className)}}
    >
      {body}
    </svg>
  );
}}
''')
print(f"wrote {OUT} — {len(els)} elements, eyes wrapped, {len(OUT.read_text())} bytes")
