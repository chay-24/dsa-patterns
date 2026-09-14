#!/usr/bin/env python3
"""
Apply content edits to data/patterns/*.ts from a JSON patch file.

Patch shape:
{
  "<pattern-slug>": {
    "lines":   ["...", "..."],        # replaces mentalModel.lines
    "key":     "...",                 # replaces mentalModel.key
    "why":     "...",                 # replaces the pattern's why
    "notes":   {"<template name>": "..."},   # replaces that template's note
    "code":    {"<template name>": "...."}   # replaces that template's code
  }
}
"""
import json
import re
import sys
from pathlib import Path

FILES = sorted(p for p in Path("data/patterns").glob("*.ts") if p.name != "index.ts")


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def block_span(src: str, slug: str):
    """Return (start, end) of the pattern object containing this slug."""
    m = re.search(r'^  \{\n    slug: "%s",' % re.escape(slug), src, re.M)
    if not m:
        return None
    start = m.start()
    # the object ends at the next top-level "  }," or "  },\n];"
    end_m = re.compile(r"^  \},$", re.M).search(src, m.end())
    if not end_m:
        return None
    return start, end_m.end()


def replace_lines(block: str, lines) -> str:
    body = "".join(f'        "{esc(l)}",\n' for l in lines)
    new = "      lines: [\n" + body + "      ],"
    out, n = re.subn(r"      lines: \[\n.*?\n      \],", new, block, count=1, flags=re.S)
    if n != 1:
        raise ValueError("lines block not found")
    return out


def replace_teach(block: str, paras) -> str:
    """Insert or replace the teach[] block, which sits just before mentalModel."""
    body = "".join(f'      "{esc(t)}",\n' for t in paras)
    new = "    teach: [\n" + body + "    ],"

    if re.search(r"    teach: \[", block):
        out, n = re.subn(r"    teach: \[\n.*?\n    \],", new, block, count=1, flags=re.S)
        if n != 1:
            raise ValueError("teach block not replaced")
        return out

    out, n = re.subn(r"    mentalModel: \{", new + "\n    mentalModel: {", block, count=1)
    if n != 1:
        raise ValueError("mentalModel anchor not found")
    return out


def replace_recognition(block: str, items) -> str:
    body = "".join(f'      "{esc(i)}",\n' for i in items)
    new = "    recognition: [\n" + body + "    ],"
    out, n = re.subn(r"    recognition: \[\n.*?\n    \],", new, block, count=1, flags=re.S)
    if n != 1:
        raise ValueError("recognition block not found")
    return out


def replace_detail(block: str, label: str, detail: str) -> str:
    """Replace the detail of the mistake/variation whose title or name is `label`."""
    # single-line form: { name: "X", detail: "..." },
    pat = re.compile(
        r'(\{ (?:title|name): "%s", detail: )"(?:[^"\\]|\\.)*"( \},)' % re.escape(label)
    )
    out, n = pat.subn(lambda m: m.group(1) + '"%s"' % esc(detail) + m.group(2), block, count=1)
    if n == 1:
        return out

    # multi-line form
    m = re.search(r'      (?:title|name): "%s",\n' % re.escape(label), block)
    if not m:
        raise ValueError(f"entry {label!r} not found")
    tail = block[m.end():]
    out, n = re.subn(
        r'      detail:\s*\n?\s*"(?:[^"\\]|\\.)*",',
        '      detail: "%s",' % esc(detail),
        tail,
        count=1,
        flags=re.S,
    )
    if n != 1:
        raise ValueError(f"detail for {label!r} not replaced")
    return block[: m.end()] + out


def replace_key(block: str, key: str) -> str:
    out, n = re.subn(
        r'      key: "(?:[^"\\]|\\.)*",',
        '      key: "%s",' % esc(key),
        block,
        count=1,
    )
    if n != 1:
        raise ValueError("key not found")
    return out


def replace_why(block: str, why: str) -> str:
    out, n = re.subn(
        r'    why:\s*\n?\s*"(?:[^"\\]|\\.)*",',
        '    why: "%s",' % esc(why),
        block,
        count=1,
        flags=re.S,
    )
    if n != 1:
        raise ValueError("why not found")
    return out


def template_span(block: str, name: str):
    m = re.search(r'        name: "%s",\n' % re.escape(name), block)
    if not m:
        return None
    end_m = re.compile(r"^      \},$", re.M).search(block, m.end())
    return m.start(), end_m.end()


def replace_note(block: str, name: str, note: str) -> str:
    span = template_span(block, name)
    if not span:
        raise ValueError(f"template {name!r} not found")
    a, b = span
    tpl = block[a:b]
    if re.search(r'        note: ', tpl):
        tpl2, n = re.subn(
            r'        note:\s*\n?\s*"(?:[^"\\]|\\.)*",',
            '        note: "%s",' % esc(note),
            tpl,
            count=1,
            flags=re.S,
        )
        if n != 1:
            raise ValueError(f"note not replaced for {name!r}")
    else:  # insert before code:
        tpl2 = tpl.replace("        code: `", '        note: "%s",\n        code: `' % esc(note), 1)
    return block[:a] + tpl2 + block[b:]


def replace_code(block: str, name: str, code: str) -> str:
    span = template_span(block, name)
    if not span:
        raise ValueError(f"template {name!r} not found")
    a, b = span
    tpl = block[a:b]
    if "`" in code or "${" in code:
        raise ValueError(f"code for {name!r} contains a backtick or ${{")
    tpl2, n = re.subn(r"        code: `.*?`,\n", "        code: `%s`,\n" % code, tpl, count=1, flags=re.S)
    if n != 1:
        raise ValueError(f"code not replaced for {name!r}")
    return block[:a] + tpl2 + block[b:]


def main(patch_path: str):
    patch = json.loads(Path(patch_path).read_text())
    sources = {f: f.read_text() for f in FILES}
    applied, missing = 0, []

    for slug, ops in patch.items():
        target = None
        for f, src in sources.items():
            if block_span(src, slug):
                target = f
                break
        if target is None:
            missing.append(slug)
            continue

        src = sources[target]
        a, b = block_span(src, slug)
        block = src[a:b]
        try:
            if "teach" in ops:
                block = replace_teach(block, ops["teach"])
            if "lines" in ops:
                block = replace_lines(block, ops["lines"])
            if "key" in ops:
                block = replace_key(block, ops["key"])
            if "why" in ops:
                block = replace_why(block, ops["why"])
            if "recognition" in ops:
                block = replace_recognition(block, ops["recognition"])
            for label, detail in ops.get("details", {}).items():
                block = replace_detail(block, label, detail)
            for name, note in ops.get("notes", {}).items():
                block = replace_note(block, name, note)
            for name, code in ops.get("code", {}).items():
                block = replace_code(block, name, code)
        except ValueError as e:
            print(f"  ✗ {slug}: {e}")
            continue

        sources[target] = src[:a] + block + src[b:]
        applied += 1

    for f, src in sources.items():
        f.write_text(src)

    print(f"✓ patched {applied}/{len(patch)} patterns")
    if missing:
        print("  unknown slugs:", ", ".join(missing))


if __name__ == "__main__":
    main(sys.argv[1])
