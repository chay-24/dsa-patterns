import type { Pattern } from "../types";
import { categories } from "../categories";
import { allProblems, problemById } from "../problems";
import type { Problem } from "../types";

import { foundations } from "./foundations";
import { twoPointers } from "./two-pointers";
import { binarySearch } from "./binary-search";
import { stacksQueues } from "./stacks-queues";
import { trees } from "./trees";
import { graphs } from "./graphs";
import { dynamicProgramming } from "./dynamic-programming";
import { greedy } from "./greedy";
import { backtracking } from "./backtracking";
import { advanced } from "./advanced";

export const patterns: Pattern[] = [
  ...foundations,
  ...twoPointers,
  ...binarySearch,
  ...stacksQueues,
  ...trees,
  ...graphs,
  ...dynamicProgramming,
  ...greedy,
  ...backtracking,
  ...advanced,
];

export const patternBySlug = new Map(patterns.map((p) => [p.slug, p]));

/** Patterns in a category, in declaration order. */
export function patternsInCategory(slug: string): Pattern[] {
  return patterns.filter((p) => p.category === slug);
}

/** "01".."97" — a stable display index across the whole site. */
export const patternNumber = new Map(
  patterns.map((p, i) => [p.slug, String(i + 1).padStart(2, "0")]),
);

/** Per-category display number, e.g. the 3rd pattern inside Trees. */
export const patternNumberInCategory = new Map<string, string>();
for (const c of categories) {
  patternsInCategory(c.slug).forEach((p, i) => {
    patternNumberInCategory.set(p.slug, String(i + 1).padStart(2, "0"));
  });
}

export type CategoryStats = {
  patterns: number;
  problems: number;
  easy: number;
  medium: number;
  hard: number;
};

const statsCache = new Map<string, CategoryStats>();

export function categoryStats(slug: string): CategoryStats {
  const cached = statsCache.get(slug);
  if (cached) return cached;

  const inCat = patternsInCategory(slug);
  const ids = new Set<number>();
  for (const p of inCat) for (const id of p.problems) ids.add(id);

  const stats: CategoryStats = {
    patterns: inCat.length,
    problems: ids.size,
    easy: 0,
    medium: 0,
    hard: 0,
  };
  for (const id of ids) {
    const pr = problemById.get(id);
    if (!pr) continue;
    if (pr.difficulty === "Easy") stats.easy++;
    else if (pr.difficulty === "Medium") stats.medium++;
    else stats.hard++;
  }

  statsCache.set(slug, stats);
  return stats;
}

/** Problems attached to a pattern, ordered Easy → Medium → Hard then by id. */
const rank = { Easy: 0, Medium: 1, Hard: 2 } as const;

export function patternProblems(p: Pattern): Problem[] {
  const seen = new Set<number>();
  const out: Problem[] = [];

  for (const id of p.problems) {
    if (seen.has(id)) continue;
    const pr = problemById.get(id);
    if (pr) {
      seen.add(id);
      out.push(pr);
    }
  }
  // problems that tag this pattern but aren't listed explicitly
  for (const pr of allProblems) {
    if (!seen.has(pr.id) && pr.patterns.includes(p.slug)) {
      seen.add(pr.id);
      out.push(pr);
    }
  }

  return out.sort(
    (a, b) => rank[a.difficulty] - rank[b.difficulty] || a.id - b.id,
  );
}

/** Every pattern that lists this problem, or that the problem tags. */
export function patternsForProblem(id: number): Pattern[] {
  const pr = problemById.get(id);
  if (!pr) return [];
  const slugs = new Set(pr.patterns);
  for (const p of patterns) if (p.problems.includes(id)) slugs.add(p.slug);
  return [...slugs].map((s) => patternBySlug.get(s)).filter((p): p is Pattern => !!p);
}

export const siteStats = {
  patterns: patterns.length,
  categories: categories.length,
  problems: allProblems.length,
  templates: patterns.reduce((n, p) => n + p.templates.length, 0),
};
