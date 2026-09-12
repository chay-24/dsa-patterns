import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categoryBySlug } from "@/data/categories";
import {
  patterns,
  patternBySlug,
  patternProblems,
  patternNumber,
} from "@/data/patterns";
import type { Difficulty } from "@/data/types";
import { Page, Breadcrumb, PageNav } from "@/components/page";
import { Section } from "@/components/section";
import { CodeBlock } from "@/components/code-block";
import { Complexity } from "@/components/complexity";
import { Diagram } from "@/components/diagram";
import { TemplateTabs } from "@/components/template-tabs";
import {
  RecognitionList,
  SignalChips,
  TypicalQuestion,
} from "@/components/recognition-list";
import { RelatedPatterns } from "@/components/related-patterns";
import { ProblemRow } from "@/components/problem-row";
import { PatternProgress } from "@/components/progress-marks";
import { Expandable } from "@/components/expandable";
import { Toc } from "@/components/toc";

export function generateStaticParams() {
  return patterns.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = patternBySlug.get(slug);
  if (!p) return {};
  return { title: p.title, description: p.description };
}

const SECTIONS = [
  { id: "mental-model", number: "01", title: "Mental Model" },
  { id: "recognition", number: "02", title: "Recognition" },
  { id: "template", number: "03", title: "Go Template" },
  { id: "complexity", number: "04", title: "Complexity" },
  { id: "variations", number: "05", title: "Variations" },
  { id: "mistakes", number: "06", title: "Common Mistakes" },
  { id: "practice", number: "07", title: "Practice" },
  { id: "related", number: "08", title: "Related" },
];

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

export default async function PatternPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = patternBySlug.get(slug);
  if (!pattern) notFound();

  const category = categoryBySlug.get(pattern.category);
  const problems = patternProblems(pattern);
  const index = patterns.findIndex((p) => p.slug === slug);
  const prev = patterns[index - 1];
  const next = patterns[index + 1];

  const byDifficulty = DIFFS.map((d) => ({
    difficulty: d,
    items: problems.filter((p) => p.difficulty === d),
  })).filter((g) => g.items.length > 0);

  return (
    <Page wide>
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-14">
        <div className="min-w-0 max-w-3xl">
          <Breadcrumb
            items={[
              { label: "Patterns", href: "/patterns" },
              { label: category?.title ?? "", href: `/categories/${pattern.category}` },
              { label: pattern.title },
            ]}
          />

          {/* ── header ─────────────────────────────────────────────── */}
          <header>
            <p className="font-mono text-2xs tabular-nums text-fg-faint">
              {patternNumber.get(pattern.slug)}
            </p>

            <h1 className="mt-3 font-mono text-[1.5rem] uppercase leading-tight tracking-[0.06em] text-fg sm:text-[1.75rem]">
              {pattern.title}
            </h1>

            <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-fg-secondary">
              {pattern.description}
            </p>

            <div className="mt-7 flex flex-wrap items-start gap-x-10 gap-y-5">
              <div>
                <p className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
                  Used for
                </p>
                <ul className="mt-2 space-y-1">
                  {pattern.usedFor.map((u) => (
                    <li key={u} className="text-[13px] text-fg-muted">
                      <span className="mr-2 text-fg-faint">•</span>
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
                  Concepts
                </p>
                <p className="mt-2 font-mono text-[12.5px] text-fg-muted">
                  {pattern.concepts.join(" · ")}
                </p>
                <div className="mt-5">
                  <p className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
                    Progress
                  </p>
                  <PatternProgress
                    ids={problems.map((p) => p.id)}
                    className="mt-2.5"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="mt-14 space-y-14">
            {/* ── 01 mental model ──────────────────────────────────── */}
            <Section id="mental-model" number="01" title="Mental Model">
              <div className="space-y-1.5">
                {pattern.mentalModel.lines.map((l) => (
                  <p key={l} className="text-[14px] leading-relaxed text-fg-secondary">
                    {l}
                  </p>
                ))}
              </div>

              {pattern.mentalModel.diagram ? (
                <Diagram className="mt-6">{pattern.mentalModel.diagram}</Diagram>
              ) : null}

              {pattern.mentalModel.key ? (
                <p className="mt-6 border-l border-accent/40 pl-4 text-[13.5px] leading-relaxed text-fg">
                  {pattern.mentalModel.key}
                </p>
              ) : null}
            </Section>

            {/* ── 02 recognition ───────────────────────────────────── */}
            <Section id="recognition" number="02" title={`When to think "${pattern.title}"`}>
              <SignalChips signals={pattern.signals} />

              <div className="mt-8">
                <p className="mb-4 font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
                  Recognition checklist
                </p>
                <RecognitionList items={pattern.recognition} />
              </div>

              {pattern.typicalQuestion ? (
                <TypicalQuestion question={pattern.typicalQuestion} />
              ) : null}
            </Section>

            {/* ── 03 templates ─────────────────────────────────────── */}
            <Section id="template" number="03" title="Go Template">
              <TemplateTabs
                tabs={pattern.templates.map((t) => ({
                  name: t.name,
                  note: t.note,
                  content: <CodeBlock code={t.code} filename={t.filename} />,
                }))}
              />
            </Section>

            {/* ── 04 complexity ────────────────────────────────────── */}
            <Section id="complexity" number="04" title="Complexity">
              <Complexity rows={pattern.complexity} />
              {pattern.why ? (
                <Expandable
                  items={[
                    {
                      id: "why",
                      label: "Why does this work?",
                      content: (
                        <p className="max-w-[64ch] text-[13.5px] leading-relaxed text-fg-secondary">
                          {pattern.why}
                        </p>
                      ),
                    },
                  ]}
                />
              ) : null}
            </Section>

            {/* ── 05 variations ────────────────────────────────────── */}
            <Section id="variations" number="05" title="Variations">
              <ol className="divide-y divide-border">
                {pattern.variations.map((v, i) => (
                  <li key={v.name} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                    <span className="mt-px font-mono text-2xs tabular-nums text-fg-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] text-fg-secondary">
                        {v.name}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-fg-muted">
                        {v.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            {/* ── 06 mistakes ──────────────────────────────────────── */}
            <Section id="mistakes" number="06" title="Common Mistakes">
              <ul className="divide-y divide-border">
                {pattern.mistakes.map((m) => (
                  <li key={m.title} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                    <span
                      aria-hidden
                      className="mt-[7px] size-1 shrink-0 rounded-full bg-hard/70"
                    />
                    <span className="min-w-0">
                      <span className="block text-[13.5px] text-fg-secondary">
                        {m.title}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-fg-muted">
                        {m.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* ── 07 practice ──────────────────────────────────────── */}
            <Section
              id="practice"
              number="07"
              title={`Practice · ${problems.length} problems`}
            >
              <div className="space-y-8">
                {byDifficulty.map((group) => (
                  <div key={group.difficulty}>
                    <p className="mb-1 font-mono text-2xs uppercase tracking-[0.14em] text-fg-muted">
                      {group.difficulty}
                      <span className="ml-2 text-fg-faint">
                        {String(group.items.length).padStart(2, "0")}
                      </span>
                    </p>
                    <div>
                      {group.items.map((p) => (
                        <ProblemRow key={p.id} problem={p} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 08 related ───────────────────────────────────────── */}
            <Section id="related" number="08" title="Related Patterns">
              <RelatedPatterns title={pattern.title} slugs={pattern.related} />
            </Section>
          </div>

          <PageNav
            prev={prev ? { title: prev.title, href: `/patterns/${prev.slug}` } : undefined}
            next={next ? { title: next.title, href: `/patterns/${next.slug}` } : undefined}
          />
        </div>

        <aside className="hidden xl:block">
          <Toc items={SECTIONS} />
        </aside>
      </div>
    </Page>
  );
}
