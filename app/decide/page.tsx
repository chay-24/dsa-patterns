import type { Metadata } from "next";
import Link from "next/link";
import { decisionTree } from "@/data/decision-tree";
import { patterns } from "@/data/patterns";
import { Page, Breadcrumb } from "@/components/page";
import { DecisionFlow, type LeanPattern } from "@/components/decision-flow";
import { Diagram } from "@/components/diagram";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Find the pattern",
  description:
    "Answer a few questions about the problem in front of you and land on the technique that solves it.",
};

const EXAMPLE = `  Is the data contiguous?
          │
        YES
          ↓
  Is the constraint monotone?
          │
        YES
          ↓
  Is the window length fixed?
          │
         NO
          ↓
  VARIABLE SLIDING WINDOW`;

export default function DecidePage() {
  const lean: Record<string, LeanPattern> = {};
  for (const p of patterns) {
    lean[p.slug] = {
      slug: p.slug,
      title: p.title,
      description: p.description,
      concepts: p.concepts,
      category: p.category,
    };
  }

  return (
    <Page>
      <Breadcrumb items={[{ label: "Find the pattern" }]} />

      <header className="mb-12 max-w-2xl">
        <h1 className="font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg">
          Find the pattern
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-fg-secondary">
          You have read the problem and have no idea where to start. Answer a
          few questions about its shape — not its story — and land on the
          technique.
        </p>
      </header>

      <DecisionFlow nodes={decisionTree} patterns={lean} />

      <div className="mt-20">
        <Section number="—" title="How it works">
          <p className="max-w-[58ch] text-[13.5px] leading-relaxed text-fg-secondary">
            Every question asks about structure, never about the subject matter.
            Bananas, ships and bouquets are all the same problem once you notice
            that a candidate answer can be checked cheaply and monotonically.
          </p>
          <Diagram className="mt-6">{EXAMPLE}</Diagram>
          <p className="mt-6 text-[13px] leading-relaxed text-fg-muted">
            The tree is deliberately shallow. If two branches feel equally true,
            take either — the destination pages link to each other, and{" "}
            <Link
              href="/patterns"
              className="text-link underline-offset-4 transition-colors hover:text-fg"
            >
              the full pattern list
            </Link>{" "}
            is one click away.
          </p>
        </Section>
      </div>
    </Page>
  );
}
