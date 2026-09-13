import { readFileSync } from "fs";

const api = JSON.parse(readFileSync("/tmp/lc.json", "utf8")).stat_status_pairs;
const byId = new Map();
const bySlug = new Map();
const LEVEL = { 1: "Easy", 2: "Medium", 3: "Hard" };

for (const p of api) {
  const rec = {
    id: p.stat.frontend_question_id,
    slug: p.stat.question__title_slug,
    title: p.stat.question__title,
    difficulty: LEVEL[p.difficulty.level],
    paid: p.paid_only,
  };
  byId.set(rec.id, rec);
  bySlug.set(rec.slug, rec);
}

// parse our data
const src = readFileSync("data/problems.ts", "utf8");
const entries = [];
const re = /\{\s*\n\s*id: (\d+),\s*\n\s*title: "((?:[^"\\]|\\.)*)",\s*\n\s*difficulty: "(\w+)",\s*\n\s*leetcode: "([^"]+)",([\s\S]*?)\n  \},/g;
let m;
while ((m = re.exec(src))) {
  entries.push({
    id: +m[1],
    title: m[2].replace(/\\"/g, '"'),
    difficulty: m[3],
    slug: m[4],
    premium: /premium: true/.test(m[5]),
  });
}

console.log(`parsed ${entries.length} problems from data/problems.ts\n`);

const bad = { slug: [], id: [], diff: [], premium: [], title: [] };

for (const e of entries) {
  const api = bySlug.get(e.slug);
  if (!api) {
    bad.slug.push(`${e.id} "${e.title}" → slug "${e.slug}" DOES NOT EXIST`);
    continue;
  }
  if (api.id !== e.id) bad.id.push(`${e.id} "${e.title}" → slug belongs to #${api.id}`);
  if (api.difficulty !== e.difficulty)
    bad.diff.push(`${e.id} ${e.title}: we say ${e.difficulty}, LeetCode says ${api.difficulty}`);
  if (api.paid !== !!e.premium)
    bad.premium.push(`${e.id} ${e.title}: premium=${!!e.premium}, LeetCode paid_only=${api.paid}`);
  // titles drift (renames) — informational only
  if (api.title.toLowerCase().replace(/[^a-z0-9]/g, "") !== e.title.toLowerCase().replace(/[^a-z0-9]/g, ""))
    bad.title.push(`${e.id}: ours "${e.title}" / theirs "${api.title}"`);
}

const show = (label, list, limit = 40) => {
  console.log(`── ${label}: ${list.length}`);
  list.slice(0, limit).forEach((l) => console.log("   " + l));
  if (list.length > limit) console.log(`   … ${list.length - limit} more`);
  console.log();
};

show("BROKEN SLUGS (must fix)", bad.slug);
show("WRONG ID FOR SLUG (must fix)", bad.id);
show("DIFFICULTY MISMATCH", bad.diff);
show("PREMIUM FLAG MISMATCH", bad.premium);
show("TITLE DRIFT (cosmetic)", bad.title);

const fatal = bad.slug.length + bad.id.length;
console.log(fatal === 0 ? "✓ every URL resolves to the right problem" : `✗ ${fatal} fatal URL problems`);
