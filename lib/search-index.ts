import { categories } from "@/data/categories";
import { patterns, patternProblems } from "@/data/patterns";
import { allProblems } from "@/data/problems";
import { snippets, cheatSections } from "@/data/snippets";

export type SearchKind = "pattern" | "problem" | "snippet" | "category" | "page";

export type SearchEntry = {
  /** stable key */
  k: string;
  kind: SearchKind;
  title: string;
  /** secondary line */
  sub: string;
  href: string;
  /** extra searchable words, space separated */
  words: string;
  /** problem number or pattern index, rendered as a prefix */
  tag?: string;
};

/**
 * Built on the server and handed to the command palette as a prop, so the
 * client never downloads the full pattern data (templates, diagrams, prose).
 */
/** Lowercase, dedupe and cap — the index is fetched over the wire. */
function words(parts: (string | undefined)[]): string {
  const seen = new Set<string>();
  for (const part of parts) {
    if (!part) continue;
    for (const w of part.toLowerCase().split(/[^a-z0-9+/]+/)) {
      if (w.length > 1) seen.add(w);
    }
  }
  return [...seen].join(" ");
}

export function buildSearchIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];

  for (const c of categories) {
    out.push({
      k: `c:${c.slug}`,
      kind: "category",
      title: c.title,
      sub: c.description,
      href: `/patterns#${c.slug}`,
      words: words(c.concepts),
      tag: c.number,
    });
  }

  for (const p of patterns) {
    const cat = categories.find((c) => c.slug === p.category);
    out.push({
      k: `p:${p.slug}`,
      kind: "pattern",
      title: p.title,
      sub: cat?.title ?? "",
      href: `/patterns/${p.slug}`,
      words: words([
        ...p.concepts,
        ...p.signals,
        ...p.templates.map((t) => t.name),
        ...p.variations.map((v) => v.name),
        p.description,
      ]),
    });
  }

  for (const pr of allProblems) {
    out.push({
      k: `q:${pr.id}`,
      kind: "problem",
      title: pr.title,
      sub: pr.difficulty,
      href: `/problems/${pr.id}`,
      words: words([...pr.patterns, pr.note, pr.leetcode.replace(/-/g, " ")]),
      tag: String(pr.id).padStart(3, "0"),
    });
  }

  for (const p of patterns) {
    for (const t of p.templates) {
      out.push({
        k: `t:${p.slug}:${t.name}`,
        kind: "snippet",
        title: `${t.name} template`,
        sub: p.title,
        href: `/patterns/${p.slug}#template`,
        words: words([t.filename.replace(/[_.]/g, " "), p.title, ...p.signals]),
      });
    }
  }

  for (const s of snippets) {
    const sec = cheatSections.find((c) => c.slug === s.section);
    out.push({
      k: `s:${s.section}:${s.title}`,
      kind: "snippet",
      title: s.title,
      sub: sec?.title ?? "Go",
      href: `/cheatsheet#${s.section}`,
      words: words([...(s.keywords ?? []), s.note]),
    });
  }

  const pages: [string, string, string][] = [
    ["Patterns", "All 97 patterns by category", "/patterns"],
    ["Problems", "Every curated LeetCode problem", "/problems"],
    ["Go Cheatsheet", "Slices, maps, heap, strings, bits", "/cheatsheet"],
    ["Templates", "Every Go template in one place", "/templates"],
    ["Complexity", "Reference tables and time budgets", "/complexity"],
    ["Find the pattern", "Answer a few questions", "/decide"],
  ];
  for (const [title, sub, href] of pages) {
    out.push({
      k: `pg:${href}`,
      kind: "page",
      title,
      sub,
      href,
      words: words([sub]),
    });
  }

  return out;
}

/** Template names, used by /templates. */
export function allTemplates() {
  return patterns.flatMap((p) =>
    p.templates.map((t) => ({
      pattern: p,
      template: t,
      problems: patternProblems(p).length,
    })),
  );
}
