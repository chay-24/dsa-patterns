import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";
import { categoryStats, siteStats } from "@/data/patterns";
import { Page } from "@/components/page";
import { PatternCard } from "@/components/pattern-card";
import { SearchTrigger } from "@/components/shell";
import { Eyebrow } from "@/components/section";

const reference = [
  { title: "Problems", detail: "Curated LeetCode set, grouped by pattern", href: "/problems" },
  { title: "Go Cheatsheet", detail: "Slices, maps, heap, strings, bits", href: "/cheatsheet" },
  { title: "Templates", detail: "Every Go template in one place", href: "/templates" },
  { title: "Complexity", detail: "Reference tables and time budgets", href: "/complexity" },
];

export default function Home() {
  return (
    <Page wide className="lg:pt-20">
      {/* ── hero ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <Eyebrow>DSA / GO</Eyebrow>
        <p className="font-mono text-2xs tabular-nums text-fg-faint">
          {siteStats.patterns} patterns
          <span className="mx-1.5">·</span>
          {siteStats.problems} problems
          <span className="mx-1.5">·</span>
          {siteStats.templates} templates
        </p>
      </div>

      <h1 className="mt-8 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.03em] text-fg sm:text-[3rem]">
        Data Structures
        <br />
        &amp; Algorithms
        <br />
        in Go.
      </h1>

      <p className="mt-8 text-[15px] leading-[1.7] text-fg-secondary">
        Learn the patterns.
        <br />
        Recognise the problem.
        <br />
        Write the solution.
      </p>

      <p className="mt-6 max-w-[42ch] text-[13.5px] leading-relaxed text-fg-muted">
        A pattern-first field guide to solving algorithmic problems in Golang.
        Built for the night before an interview.
      </p>

      <div className="mt-8 max-w-xl">
        <SearchTrigger />
      </div>

      {/* ── decision tree entry point ─────────────────────────────── */}
      <Link
        href="/decide"
        className="group mt-12 flex items-center gap-4 rounded-lg border border-border bg-surface/40 px-5 py-4 transition-[border-color,background-color] duration-200 hover:border-accent/30 hover:bg-surface"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-2xs uppercase tracking-[0.14em] text-fg-muted">
            Not sure which pattern?
          </span>
          <span className="mt-1.5 block text-[13.5px] text-fg-secondary">
            Answer a few questions about the problem and land on the technique.
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 font-mono text-2xs text-accent">
          <span className="hidden sm:inline">Start here</span>
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </span>
      </Link>

      {/* ── patterns ──────────────────────────────────────────────── */}
      <section className="mt-16">
        <div className="mb-6 flex items-baseline justify-between border-b border-border pb-2.5">
          <h2 className="font-mono text-2xs uppercase tracking-[0.16em] text-fg-secondary">
            Patterns
          </h2>
          <Link
            href="/patterns"
            className="text-[12.5px] text-fg-muted transition-colors duration-150 hover:text-accent"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => {
            const s = categoryStats(c.slug);
            return (
              <PatternCard
                key={c.slug}
                href={`/categories/${c.slug}`}
                number={c.number}
                title={c.title}
                description={c.description}
                concepts={c.concepts}
                meta={{ patterns: s.patterns, problems: s.problems }}
                spread={{ easy: s.easy, medium: s.medium, hard: s.hard }}
              />
            );
          })}
        </div>
      </section>

      {/* ── reference ─────────────────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="mb-6 border-b border-border pb-2.5 font-mono text-2xs uppercase tracking-[0.16em] text-fg-secondary">
          Reference
        </h2>

        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {reference.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex items-center gap-4 bg-bg px-5 py-4 transition-colors duration-150 hover:bg-surface"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] text-fg-secondary transition-colors group-hover:text-fg">
                  {r.title}
                </span>
                <span className="mt-1 block truncate text-[12.5px] text-fg-muted">
                  {r.detail}
                </span>
              </span>
              <ArrowRight
                className="size-3.5 shrink-0 text-fg-faint transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-20 space-y-3 border-t border-border pt-6">
        <p className="text-[12px] leading-relaxed text-fg-faint">
          Recognise → Understand → Template → Practice.
          <br />
          Progress is stored in this browser only. No account, no backend.
        </p>
        <p className="max-w-[64ch] text-[12px] leading-relaxed text-fg-faint">
          The Go gopher was designed by{" "}
          <a
            href="http://reneefrench.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-muted underline decoration-dotted underline-offset-2 transition-colors hover:text-fg-secondary"
          >
            Renée French
          </a>
          . The vector artwork is by{" "}
          <a
            href="https://github.com/golang-samples/gopher-vector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-muted underline decoration-dotted underline-offset-2 transition-colors hover:text-fg-secondary"
          >
            Takuya Ueda
          </a>
          , used under{" "}
          <a
            href="https://creativecommons.org/licenses/by/3.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-muted underline decoration-dotted underline-offset-2 transition-colors hover:text-fg-secondary"
          >
            CC BY 3.0
          </a>{" "}
          and cropped to the head for use as an icon.
        </p>
      </footer>
    </Page>
  );
}
