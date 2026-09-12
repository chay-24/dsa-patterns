import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, categoryBySlug } from "@/data/categories";
import {
  patternsInCategory,
  patternProblems,
  patternNumberInCategory,
  categoryStats,
} from "@/data/patterns";
import { Page, Breadcrumb, PageNav } from "@/components/page";
import { PatternCard } from "@/components/pattern-card";
import { DifficultySpread } from "@/components/difficulty";
import { ProblemRow } from "@/components/problem-row";
import { Section } from "@/components/section";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug.get(slug);
  if (!c) return {};
  return { title: c.title, description: c.description };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryBySlug.get(slug);
  if (!category) notFound();

  const inCat = patternsInCategory(slug);
  const stats = categoryStats(slug);
  const index = categories.findIndex((c) => c.slug === slug);
  const prev = categories[index - 1];
  const next = categories[index + 1];

  // every problem in the category, de-duplicated, hardest last
  const seen = new Set<number>();
  const problems = inCat
    .flatMap((p) => patternProblems(p))
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .sort((a, b) => a.id - b.id);

  const rank = { Easy: 0, Medium: 1, Hard: 2 } as const;
  problems.sort((a, b) => rank[a.difficulty] - rank[b.difficulty] || a.id - b.id);

  return (
    <Page wide>
      <Breadcrumb
        items={[{ label: "Patterns", href: "/patterns" }, { label: category.title }]}
      />

      <header className="max-w-2xl">
        <p className="font-mono text-2xs tabular-nums text-fg-faint">
          {category.number}
        </p>
        <h1 className="mt-3 font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg sm:text-[1.75rem]">
          {category.title}
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-fg-secondary">
          {category.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <p className="font-mono text-2xs tabular-nums text-fg-muted">
            {String(stats.patterns).padStart(2, "0")} patterns
            <span className="mx-2 text-fg-faint">·</span>
            {stats.problems} problems
          </p>
          <DifficultySpread easy={stats.easy} medium={stats.medium} hard={stats.hard} />
          <p className="font-mono text-2xs text-fg-faint">
            {stats.easy}E · {stats.medium}M · {stats.hard}H
          </p>
        </div>
      </header>

      <div className="mt-14 space-y-14">
        <Section number="01" title="Patterns">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {inCat.map((p) => (
              <PatternCard
                key={p.slug}
                href={`/patterns/${p.slug}`}
                number={patternNumberInCategory.get(p.slug) ?? "00"}
                title={p.title}
                description={p.description}
                concepts={p.concepts}
                meta={{ problems: patternProblems(p).length }}
              />
            ))}
          </div>
        </Section>

        <Section number="02" title={`All problems · ${problems.length}`}>
          <div className="max-w-3xl">
            {problems.map((p) => (
              <ProblemRow key={p.id} problem={p} />
            ))}
          </div>
        </Section>
      </div>

      <PageNav
        prev={prev ? { title: prev.title, href: `/categories/${prev.slug}` } : undefined}
        next={next ? { title: next.title, href: `/categories/${next.slug}` } : undefined}
      />
    </Page>
  );
}
