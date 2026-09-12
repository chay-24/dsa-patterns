import type { Metadata } from "next";
import { allProblems, leetcodeURL } from "@/data/problems";
import { patternBySlug } from "@/data/patterns";
import { categories } from "@/data/categories";
import { Page, Breadcrumb } from "@/components/page";
import { ProblemsBrowser, type LeanProblem } from "@/components/problems-browser";

export const metadata: Metadata = {
  title: "Problems",
  description:
    "A curated LeetCode set, every problem tagged with the pattern that solves it.",
};

export default function ProblemsPage() {
  const lean: LeanProblem[] = allProblems.map((p) => {
    const cats = new Set<string>();
    for (const s of p.patterns) {
      const pat = patternBySlug.get(s);
      if (pat) cats.add(pat.category);
    }
    return {
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      url: leetcodeURL(p),
      p1: patternBySlug.get(p.patterns[0])?.title ?? "—",
      p2: p.patterns[1] ? patternBySlug.get(p.patterns[1])?.title : undefined,
      cats: [...cats],
      premium: p.premium,
    };
  });

  const counts = {
    easy: lean.filter((p) => p.difficulty === "Easy").length,
    medium: lean.filter((p) => p.difficulty === "Medium").length,
    hard: lean.filter((p) => p.difficulty === "Hard").length,
  };

  return (
    <Page>
      <Breadcrumb items={[{ label: "Problems" }]} />

      <header className="mb-10">
        <h1 className="font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg">
          Problems
        </h1>
        <p className="mt-4 max-w-[56ch] text-[14px] leading-relaxed text-fg-secondary">
          {allProblems.length} problems, each tagged with the pattern that solves
          it. Every link goes to the real LeetCode page.
        </p>
        <p className="mt-3 font-mono text-2xs tabular-nums text-fg-muted">
          <span className="text-easy">{counts.easy} easy</span>
          <span className="mx-2 text-fg-faint">·</span>
          <span className="text-medium">{counts.medium} medium</span>
          <span className="mx-2 text-fg-faint">·</span>
          <span className="text-hard">{counts.hard} hard</span>
        </p>
      </header>

      <ProblemsBrowser
        problems={lean}
        categories={categories.map((c) => ({ slug: c.slug, title: c.title }))}
      />
    </Page>
  );
}
