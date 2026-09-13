# go/dsa

A pattern-first field guide to solving algorithmic problems in Go.

97 patterns, 342 verified LeetCode problems, 307 Go templates. Organised around
how you recognise a problem, not around a syllabus.

```
Recognise → Understand → Template → Practice
```

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 460 static pages
npm run lint
```

## What is here

| Route               | What it is                                              |
| ------------------- | ------------------------------------------------------- |
| `/`                 | Hero, category grid, entry point to the decision tree    |
| `/patterns`         | All 97 patterns, grouped by category                     |
| `/patterns/[slug]`  | The main page: mental model → recognition → template → complexity → variations → mistakes → practice → related |
| `/categories/[slug]`| One category: its patterns and every problem in it       |
| `/problems`         | Filterable list of all problems                          |
| `/problems/[id]`    | Why this pattern, the key observation, the template      |
| `/cheatsheet`       | The Go you need under interview pressure                 |
| `/templates`        | The core eight, plus an index of all 307                 |
| `/complexity`       | Reference tables and what fits in one second             |
| `/decide`           | Yes/no questions that land on a pattern                  |

## Layout

```
app/            routes (all statically generated)
components/     UI; components/ui/ holds the shadcn primitives
data/           all content — no prose lives in components
  types.ts          the shape of a Pattern, Problem, Snippet
  categories.ts     the 10 top-level groups
  patterns/*.ts     one file per category, 97 patterns total
  problems.ts       342 problems, each with a verified LeetCode slug
  snippets.ts       the Go cheatsheet
  complexity.ts     reference tables
  decision-tree.ts  61 nodes, 31 leaves
lib/            cn(), the Go tokenizer, progress store, search index
tools/          patch-patterns.py — bulk content edits across data/patterns
```

Content is separated from UI on purpose: adding a pattern or a hundred problems
means editing `data/`, never a component.

## Design notes

- **Fonts** — Space Grotesk for text, IBM Plex Mono for code, labels and numbers.
- **Colour** — near-black surfaces, hairline borders, and lime used sparingly:
  the active nav item, a hovered card's number, one key line per pattern.
- **Syntax highlighting** — `lib/highlight.ts` is a small Go tokenizer that runs
  in server components, so the browser downloads no highlighter. It round-trips
  its input exactly.
- **Search** — a command palette over patterns, problems, templates and snippets.
  The 200KB index is a static endpoint (`/api/search-index`) fetched when the
  page goes idle, so it never sits in any page's HTML.
- **Progress** — three marks (learned, important, review) in `localStorage`.
  No account, no backend, no streaks.

## Verifying the problem set

Every LeetCode slug, id, difficulty and premium flag is checked against
LeetCode's public problem list:

```bash
curl -s -H "User-Agent: Mozilla/5.0" https://leetcode.com/api/problems/all/ -o /tmp/lc.json
node tools/verify-leetcode.mjs
```

`tools/validate-data.mjs` separately checks that every pattern's `related[]`,
every `problems[]` id, and every category reference resolves.
