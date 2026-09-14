@AGENTS.md

# go/dsa

A pattern-first DSA reference for Go. Next.js App Router, fully static.

## Where things live

- **All content is in `data/`.** Components never contain prose or code samples.
  To add a pattern, edit the right file in `data/patterns/`. To add problems,
  edit `data/problems.ts`.
- **`teach: string[]` is the lesson** and it is required — the build fails
  without it. It is not a summary. Write it as: the problem, the obvious wrong
  first attempt, the observation that fixes it, how that becomes a method, and
  why it is correct. `mentalModel.lines` is the compressed recap of the same
  idea, shown underneath in an "In short" box.
- `lib/highlight.ts` is a hand-written Go tokenizer used by server components.
  If you change it, keep the round-trip property: joining the tokens must
  reproduce the source byte for byte.
- `lib/search-index.ts` builds the palette index. It is served from
  `app/api/search-index/route.ts` as a static response — never pass it through
  the root layout, or it lands in every page's HTML.

## Editing content in bulk

`tools/patch-patterns.py` applies a JSON patch to `data/patterns/*.ts`, keyed by
pattern slug. It can replace `teach`, `lines`, `key`, `why`, `recognition`, a
template's `note` or `code`, and a mistake/variation `detail`. Use it rather
than hand-editing 97 files.

## Before calling it done

```bash
node tools/validate-data.mjs      # cross-references resolve
node tools/verify-leetcode.mjs    # slugs match LeetCode (needs /tmp/lc.json)
npx tsc --noEmit -p tsconfig.json
npx eslint .
npm run build
```

## Typography rule

Mono (IBM Plex Mono) is for numbers, code, filenames, complexity values,
keyboard hints and UPPERCASE labels. Sans (Space Grotesk) is for every
lowercase or sentence-case string, however small — a lowercase sentence set in
mono at 11px looks cramped and is the thing to avoid.

## Brand mark

`components/gopher.tsx` is the **official Go gopher**, generated from the
upstream vector by `tools/build-gopher.py`:

- character design — Renée French, http://reneefrench.blogspot.com/
- vector artwork — Takuya Ueda, https://github.com/golang-samples/gopher-vector
- licence — CC BY 3.0, https://creativecommons.org/licenses/by/3.0/

Two changes are made to the artwork, and CC BY requires them to be stated:
each eye (white plus pupil) is wrapped in a `logo-eye` group so it can be
animated, and `crop="head"` narrows the viewBox for icon use. Do not hand-edit
the component — change the script and regenerate.

**The attribution is not optional.** It appears in the sidebar, in the mobile
nav drawer, and in the homepage footer. If you move the gopher somewhere new,
the credit goes with it.

The `logo-blink` keyframes in globals.css scale the `logo-eye` groups on the Y
axis. Put `logo-brand` on an ancestor and hovering it makes the gopher blink,
once every 1.9s for as long as the pointer stays — pure CSS, no client
JavaScript, and the reduced-motion rule already neutralises it.

The sidebar shows the gopher alone, with no wordmark, so its link carries an
`aria-label`. `app/icon.svg` is the same artwork on a dark rounded square,
which Next serves as the favicon.

## House style

- The lesson explains; it does not summarise. If a paragraph could be read
  without having learned anything, cut it.
- Theory is written in short, plain sentences. No jargon where a common word
  works: "on average" not "amortised", "flips once" not "monotone".
- Go templates stay short. Median is 19 lines; anything over ~35 needs a reason.
- Accent colour is used sparingly. If a page has more than a few lime elements,
  that is a bug.
