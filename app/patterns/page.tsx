import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/data/categories";
import {
  patternsInCategory,
  patternProblems,
  patternNumberInCategory,
  categoryStats,
  siteStats,
} from "@/data/patterns";
import { Page, Breadcrumb } from "@/components/page";
import { PatternRow } from "@/components/pattern-card";
import { DifficultySpread } from "@/components/difficulty";

export const metadata: Metadata = {
  title: "Patterns",
  description:
    "Every problem-solving pattern, organised by category rather than by week.",
};

export default function PatternsPage() {
  return (
    <Page wide>
      <Breadcrumb items={[{ label: "Patterns" }]} />

      <header className="max-w-2xl">
        <h1 className="font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg">
          Patterns
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-fg-secondary">
          {siteStats.patterns} techniques across {siteStats.categories}{" "}
          categories. Organised by how you recognise them, not by when a course
          would teach them.
        </p>
      </header>

      <div className="mt-14 space-y-14">
        {categories.map((c) => {
          const inCat = patternsInCategory(c.slug);
          const s = categoryStats(c.slug);

          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-20">
              <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-border pb-2.5">
                <span className="font-mono text-2xs tabular-nums text-fg-faint">
                  {c.number}
                </span>
                <Link
                  href={`/categories/${c.slug}`}
                  className="font-mono text-2xs uppercase tracking-[0.16em] text-fg-secondary transition-colors duration-150 hover:text-accent"
                >
                  {c.title}
                </Link>
                <span className="hidden text-[12.5px] text-fg-muted sm:inline">
                  {c.description}
                </span>
                <span className="ml-auto flex items-center gap-3">
                  <DifficultySpread easy={s.easy} medium={s.medium} hard={s.hard} />
                  <span className="font-mono text-2xs tabular-nums text-fg-faint">
                    {s.problems}
                  </span>
                </span>
              </div>

              <div className="grid gap-x-10 md:grid-cols-2">
                {inCat.map((p) => (
                  <PatternRow
                    key={p.slug}
                    href={`/patterns/${p.slug}`}
                    number={patternNumberInCategory.get(p.slug) ?? "00"}
                    title={p.title}
                    description={p.description}
                    concepts={p.concepts}
                    problems={patternProblems(p).length}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
