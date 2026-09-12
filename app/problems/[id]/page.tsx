import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { allProblems, problemById, leetcodeURL } from "@/data/problems";
import { patternsForProblem, patternProblems } from "@/data/patterns";
import { Page, Breadcrumb, PageNav } from "@/components/page";
import { Section } from "@/components/section";
import { CodeBlock } from "@/components/code-block";
import { DifficultyTag } from "@/components/difficulty";
import { SignalChips } from "@/components/recognition-list";
import { ProblemRow } from "@/components/problem-row";
import { ProblemMark } from "@/components/progress-marks";
import { Diagram } from "@/components/diagram";

export function generateStaticParams() {
  return allProblems.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = problemById.get(Number(id));
  if (!p) return {};
  return {
    title: `${p.id}. ${p.title}`,
    description: p.note ?? `${p.difficulty} — solved with ${p.patterns[0]}.`,
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = problemById.get(Number(id));
  if (!problem) notFound();

  const patterns = patternsForProblem(problem.id);
  const primary = patterns[0];
  const index = allProblems.findIndex((p) => p.id === problem.id);
  const prev = allProblems[index - 1];
  const next = allProblems[index + 1];

  // other problems that share the primary pattern
  const siblings = primary
    ? patternProblems(primary)
        .filter((p) => p.id !== problem.id)
        .slice(0, 6)
    : [];

  return (
    <Page>
      <Breadcrumb
        items={[
          { label: "Problems", href: "/problems" },
          ...(primary
            ? [{ label: primary.title, href: `/patterns/${primary.slug}` }]
            : []),
          { label: `#${problem.id}` },
        ]}
      />

      <header>
        <div className="flex items-center gap-3">
          <ProblemMark id={problem.id} />
          <p className="font-mono text-2xs tabular-nums text-fg-faint">
            #{String(problem.id).padStart(3, "0")}
          </p>
          {problem.premium ? (
            <span className="font-mono text-2xs text-warning/70">
              LeetCode Premium
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 font-mono text-[1.375rem] uppercase leading-tight tracking-[0.05em] text-fg sm:text-[1.625rem]">
          {problem.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <DifficultyTag difficulty={problem.difficulty} />

          <ul className="flex flex-wrap gap-1.5">
            {patterns.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/patterns/${p.slug}`}
                  className="inline-block rounded border border-border bg-surface px-2 py-1 font-mono text-2xs text-fg-secondary transition-colors duration-150 hover:border-accent/30 hover:text-accent"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={leetcodeURL(problem)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 font-mono text-2xs text-link transition-colors duration-150 hover:text-fg"
          >
            LeetCode
            <ExternalLink className="size-3" strokeWidth={1.5} />
          </a>
        </div>
      </header>

      <div className="mt-14 space-y-14">
        {problem.insight ? (
          <>
            <Section number="01" title="Why this pattern?">
              <p className="max-w-[60ch] text-[14px] leading-relaxed text-fg-secondary">
                {problem.insight.why}
              </p>
              {primary ? (
                <div className="mt-6">
                  <SignalChips signals={primary.signals.slice(0, 6)} />
                </div>
              ) : null}
            </Section>

            <Section number="02" title="Key observation">
              <p className="max-w-[60ch] border-l border-accent/40 pl-4 text-[14px] leading-relaxed text-fg">
                {problem.insight.key}
              </p>
            </Section>
          </>
        ) : (
          <Section number="01" title="Approach">
            <p className="max-w-[60ch] text-[14px] leading-relaxed text-fg-secondary">
              {problem.note ??
                "Match the statement against the recognition checklist on the pattern page, then adapt the template."}
            </p>
            {primary ? (
              <div className="mt-6">
                <SignalChips signals={primary.signals.slice(0, 6)} />
              </div>
            ) : null}
          </Section>
        )}

        {problem.insight?.code ? (
          <Section number="03" title="Go solution">
            <CodeBlock
              code={problem.insight.code.code}
              filename={problem.insight.code.filename}
            />
          </Section>
        ) : primary ? (
          <Section number="03" title="Template to adapt">
            <p className="mb-4 text-[13px] leading-relaxed text-fg-muted">
              {primary.templates[0].note ??
                `The ${primary.title.toLowerCase()} skeleton this problem is built on.`}
            </p>
            <CodeBlock
              code={primary.templates[0].code}
              filename={primary.templates[0].filename}
            />
            <Link
              href={`/patterns/${primary.slug}#template`}
              className="mt-4 inline-block font-mono text-2xs text-fg-muted transition-colors duration-150 hover:text-accent"
            >
              All {primary.templates.length} {primary.title} templates →
            </Link>
          </Section>
        ) : null}

        {primary?.mentalModel.diagram ? (
          <Section number="04" title="Mental model">
            <Diagram>{primary.mentalModel.diagram}</Diagram>
            {primary.mentalModel.key ? (
              <p className="mt-5 text-[13.5px] leading-relaxed text-fg-secondary">
                {primary.mentalModel.key}
              </p>
            ) : null}
          </Section>
        ) : null}

        {siblings.length > 0 && primary ? (
          <Section number="05" title={`More ${primary.title} problems`}>
            <div>
              {siblings.map((p) => (
                <ProblemRow key={p.id} problem={p} showPattern={false} />
              ))}
            </div>
            <Link
              href={`/patterns/${primary.slug}#practice`}
              className="mt-4 inline-block font-mono text-2xs text-fg-muted transition-colors duration-150 hover:text-accent"
            >
              See all →
            </Link>
          </Section>
        ) : null}
      </div>

      <PageNav
        prev={prev ? { title: `${prev.id}. ${prev.title}`, href: `/problems/${prev.id}` } : undefined}
        next={next ? { title: `${next.id}. ${next.title}`, href: `/problems/${next.id}` } : undefined}
      />
    </Page>
  );
}
