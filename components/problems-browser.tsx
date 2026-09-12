"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DifficultyDot } from "./difficulty";
import { ProblemMark, ProgressSummary } from "./progress-marks";
import type { Difficulty } from "@/data/types";

export type LeanProblem = {
  id: number;
  title: string;
  difficulty: Difficulty;
  url: string;
  /** primary pattern title, and an optional secondary */
  p1: string;
  p2?: string;
  /** category slugs this problem touches */
  cats: string[];
  premium?: boolean;
};

const DIFFS: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

export function ProblemsBrowser({
  problems,
  categories,
}: {
  problems: LeanProblem[];
  categories: { slug: string; title: string }[];
}) {
  const [query, setQuery] = React.useState("");
  const [diff, setDiff] = React.useState<Difficulty | "All">("All");
  const [cat, setCat] = React.useState<string>("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (diff !== "All" && p.difficulty !== diff) return false;
      if (cat !== "all" && !p.cats.includes(cat)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.p1.toLowerCase().includes(q) ||
        (p.p2?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [problems, query, diff, cat]);

  return (
    <div>
      {/* ── controls ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 px-3.5 py-2.5 focus-within:border-border-strong">
          <Search className="size-3.5 shrink-0 text-fg-faint" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, number or pattern…"
            className="w-full bg-transparent text-[13.5px] text-fg placeholder:text-fg-faint focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="grid size-5 shrink-0 place-items-center rounded text-fg-faint hover:text-fg-secondary"
            >
              <X className="size-3" strokeWidth={1.5} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {DIFFS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDiff(d)}
              className={cn(
                "rounded border px-2.5 py-1 font-mono text-2xs transition-colors duration-150",
                diff === d
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-border bg-surface/50 text-fg-muted hover:border-border-strong hover:text-fg-secondary",
              )}
            >
              {d}
            </button>
          ))}

          <span className="mx-1 hidden h-4 w-px bg-border sm:block" />

          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Filter by category"
            className="rounded border border-border bg-surface/50 px-2 py-1 font-mono text-2xs text-fg-muted transition-colors hover:border-border-strong focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
        <ProgressSummary total={problems.length} />
        <span className="font-mono text-2xs tabular-nums text-fg-faint">
          showing {filtered.length}
        </span>
      </div>

      {/* ── list ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-fg-muted">
          Nothing matches those filters.
        </p>
      ) : (
        <div>
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group flex items-start gap-3 border-b border-border py-3 pl-1 pr-1 transition-colors duration-150 hover:bg-surface/50"
            >
              <ProblemMark id={p.id} className="mt-[3px]" />

              <Link
                href={`/problems/${p.id}`}
                className="min-w-0 flex-1 focus-visible:outline-none"
              >
                <span className="flex items-baseline gap-2.5">
                  <span className="font-mono text-2xs tabular-nums text-fg-faint">
                    {String(p.id).padStart(3, "0")}
                  </span>
                  <span className="min-w-0 truncate text-[13.5px] text-fg-secondary transition-colors duration-150 group-hover:text-fg">
                    {p.title}
                  </span>
                </span>
                <span className="mt-1 block pl-[calc(1.5rem+6px)] text-[12px] text-fg-muted">
                  {p.p1}
                  {p.p2 ? (
                    <>
                      <span className="mx-1.5 text-fg-faint">+</span>
                      {p.p2}
                    </>
                  ) : null}
                </span>
              </Link>

              <span className="mt-[3px] flex shrink-0 items-center gap-2.5">
                {p.premium ? (
                  <span className="hidden font-mono text-2xs text-warning/70 sm:inline">
                    premium
                  </span>
                ) : null}
                <DifficultyDot difficulty={p.difficulty} className="mt-[5px]" />
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${p.title} on LeetCode`}
                  className="grid size-5 place-items-center rounded text-fg-faint transition-colors duration-150 hover:bg-border/60 hover:text-link"
                >
                  <ExternalLink className="size-3" strokeWidth={1.5} />
                </a>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
