// Validate every cross-reference in the data layer.
import { readFileSync, readdirSync } from "fs";

const read = (p) => readFileSync(p, "utf8");

// --- collect pattern slugs, categories, related, problem refs ---
const files = readdirSync("data/patterns").filter((f) => f !== "index.ts");
const slugs = new Set();
const catOf = new Map();
const related = [];
const probRefs = [];
const titles = new Map();

for (const f of files) {
  const src = read(`data/patterns/${f}`);
  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const b of blocks) {
    const slug = b.match(/^    slug: "([^"]+)"/m)?.[1];
    if (!slug) continue;
    if (slugs.has(slug)) console.log(`DUP SLUG: ${slug}`);
    slugs.add(slug);
    titles.set(slug, b.match(/^    title: "([^"]+)"/m)?.[1]);
    catOf.set(slug, b.match(/^    category: "([^"]+)"/m)?.[1]);

    const rel = b.match(/^    related: \[([^\]]*)\]/m)?.[1] ?? "";
    for (const r of rel.match(/"([^"]+)"/g) ?? []) related.push([slug, r.slice(1, -1)]);

    const probs = b.match(/^    problems: \[([^\]]*)\]/m)?.[1] ?? "";
    for (const n of probs.match(/\d+/g) ?? []) probRefs.push([slug, +n]);
  }
}

// --- categories ---
const catSrc = read("data/categories.ts");
const cats = new Set([...catSrc.matchAll(/^    slug: "([^"]+)"/gm)].map((m) => m[1]));

// --- problems ---
const probSrc = read("data/problems.ts");
const probIds = new Set([...probSrc.matchAll(/^    id: (\d+),/gm)].map((m) => +m[1]));
const probPatternRefs = [];
for (const m of probSrc.matchAll(/^    id: (\d+),[\s\S]*?patterns: \[([^\]]*)\]/gm)) {
  for (const p of m[2].match(/"([^"]+)"/g) ?? []) probPatternRefs.push([+m[1], p.slice(1, -1)]);
}

let errors = 0;
const err = (m) => { console.log("  ✗ " + m); errors++; };

console.log(`patterns: ${slugs.size}  categories: ${cats.size}  problems: ${probIds.size}`);

console.log("\n[1] pattern.category exists");
for (const [s, c] of catOf) if (!cats.has(c)) err(`${s} → unknown category "${c}"`);

console.log("[2] related[] slugs exist");
for (const [from, to] of related) {
  if (!slugs.has(to)) err(`${from}.related → unknown pattern "${to}"`);
  if (from === to) err(`${from}.related → itself`);
}

console.log("[3] pattern.problems[] ids exist");
for (const [s, id] of probRefs) if (!probIds.has(id)) err(`${s}.problems → unknown problem ${id}`);

console.log("[4] problem.patterns[] slugs exist");
for (const [id, s] of probPatternRefs) if (!slugs.has(s)) err(`problem ${id} → unknown pattern "${s}"`);

console.log("[5] every category has patterns");
const used = new Set(catOf.values());
for (const c of cats) if (!used.has(c)) err(`category "${c}" has no patterns`);

console.log("[6] every problem is reachable from some pattern");
const reachable = new Set(probRefs.map(([, id]) => id));
for (const [id] of probPatternRefs) reachable.add(id);
for (const id of probIds) if (!reachable.has(id)) err(`problem ${id} is orphaned`);

console.log("[7] every pattern has problems");
const hasProb = new Set(probRefs.map(([s]) => s));
for (const [, s] of probPatternRefs) hasProb.add(s);
for (const s of slugs) if (!hasProb.has(s)) err(`pattern "${s}" has no problems`);

console.log("\n" + (errors === 0 ? "✓ ALL CHECKS PASSED" : `${errors} ERROR(S)`));
process.exit(errors ? 1 : 0);
