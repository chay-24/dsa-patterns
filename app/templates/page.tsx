import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/data/categories";
import { patterns, patternsInCategory, patternBySlug, siteStats } from "@/data/patterns";
import { Page, Breadcrumb } from "@/components/page";
import { Section } from "@/components/section";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Every reusable Go template on the site, grouped by pattern. Copy, adapt, solve.",
};

/** The eight you rewrite most often. */
const CORE = [
  "two-pointers",
  "variable-sliding-window",
  "classic-binary-search",
  "binary-search-on-answer",
  "monotonic-stack",
  "graph-bfs",
  "union-find",
  "knapsack-01",
];

export default function TemplatesPage() {
  const core = CORE.map((s) => patternBySlug.get(s)).filter(
    (p): p is NonNullable<typeof p> => !!p,
  );

  return (
    <Page wide>
      <Breadcrumb items={[{ label: "Templates" }]} />

      <header className="max-w-2xl">
        <h1 className="font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg">
          Templates
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-fg-secondary">
          {siteStats.templates} Go templates across {patterns.length} patterns.
          The eight below cover most interviews; the index underneath links to
          every one.
        </p>
      </header>

      <div className="mt-14 space-y-14">
        <Section number="01" title="Core eight">
          <div className="grid gap-8 lg:grid-cols-2">
            {core.map((p) => (
              <div key={p.slug} className="min-w-0">
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <Link
                    href={`/patterns/${p.slug}`}
                    className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-secondary transition-colors duration-150 hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  <span className="font-mono text-2xs text-fg-faint">
                    {p.templates.length} template
                    {p.templates.length === 1 ? "" : "s"}
                  </span>
                </div>
                <CodeBlock
                  code={p.templates[0].code}
                  filename={p.templates[0].filename}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section number="02" title="Full index">
          <div className="space-y-10">
            {categories.map((c) => (
              <div key={c.slug}>
                <div className="mb-3 flex items-baseline gap-3 border-b border-border pb-2">
                  <span className="font-mono text-2xs tabular-nums text-fg-faint">
                    {c.number}
                  </span>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="font-mono text-2xs uppercase tracking-[0.16em] text-fg-secondary transition-colors duration-150 hover:text-accent"
                  >
                    {c.title}
                  </Link>
                </div>

                <div className="grid gap-x-10 md:grid-cols-2">
                  {patternsInCategory(c.slug).map((p) => (
                    <div
                      key={p.slug}
                      className="flex items-start gap-3 border-b border-border py-2.5"
                    >
                      <Link
                        href={`/patterns/${p.slug}#template`}
                        className="w-32 shrink-0 truncate text-[12.5px] text-fg-secondary transition-colors duration-150 hover:text-accent sm:w-40"
                      >
                        {p.title}
                      </Link>
                      <p className="min-w-0 flex-1 font-mono text-2xs leading-relaxed text-fg-muted">
                        {p.templates.map((t) => t.name).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </Page>
  );
}
