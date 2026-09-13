@AGENTS.md

# go/dsa

A pattern-first DSA reference for Go. Next.js App Router, fully static.

## Where things live

- **All content is in `data/`.** Components never contain prose or code samples.
  To add a pattern, edit the right file in `data/patterns/`. To add problems,
  edit `data/problems.ts`.
- `lib/highlight.ts` is a hand-written Go tokenizer used by server components.
  If you change it, keep the round-trip property: joining the tokens must
  reproduce the source byte for byte.
- `lib/search-index.ts` builds the palette index. It is served from
  `app/api/search-index/route.ts` as a static response — never pass it through
  the root layout, or it lands in every page's HTML.

## Editing content in bulk

`tools/patch-patterns.py` applies a JSON patch to `data/patterns/*.ts`, keyed by
pattern slug. It can replace `lines`, `key`, `why`, `recognition`, a template's
`note` or `code`, and a mistake/variation `detail`. Use it rather than hand-
editing 97 files.

## Before calling it done

```bash
node tools/validate-data.mjs      # cross-references resolve
node tools/verify-leetcode.mjs    # slugs match LeetCode (needs /tmp/lc.json)
npx tsc --noEmit -p tsconfig.json
npx eslint .
npm run build
```

## House style

- Theory is written in short, plain sentences. No jargon where a common word
  works: "on average" not "amortised", "flips once" not "monotone".
- Go templates stay short. Median is 19 lines; anything over ~35 needs a reason.
- Accent colour is used sparingly. If a page has more than a few lime elements,
  that is a bug.
