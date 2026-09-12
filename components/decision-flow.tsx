"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import type { DecisionNode } from "@/data/types";
import { cn } from "@/lib/utils";

export type LeanPattern = {
  slug: string;
  title: string;
  description: string;
  concepts: string[];
  category: string;
};

type Step = { id: string; answer: "yes" | "no" };

export function DecisionFlow({
  nodes,
  patterns,
}: {
  nodes: DecisionNode[];
  patterns: Record<string, LeanPattern>;
}) {
  const byId = React.useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  const [path, setPath] = React.useState<Step[]>([]);
  const [current, setCurrent] = React.useState("start");

  const node = byId.get(current);

  function answer(a: "yes" | "no") {
    if (!node) return;
    const nextId = a === "yes" ? node.yes : node.no;
    if (!nextId) return;
    setPath((p) => [...p, { id: node.id, answer: a }]);
    setCurrent(nextId);
  }

  function rewind(i: number) {
    const step = path[i];
    setPath(path.slice(0, i));
    setCurrent(step.id);
  }

  function reset() {
    setPath([]);
    setCurrent("start");
  }

  const leaf = node?.pattern ? patterns[node.pattern] : undefined;

  return (
    <div>
      {/* ── answered questions ─────────────────────────────────────── */}
      {path.length > 0 ? (
        <ol className="mb-8 space-y-1.5 border-l border-border pl-4">
          {path.map((step, i) => {
            const q = byId.get(step.id);
            return (
              <li key={`${step.id}-${i}`} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-[3px] grid size-4 shrink-0 place-items-center rounded-full border",
                    step.answer === "yes"
                      ? "border-accent/40 bg-accent/10"
                      : "border-border bg-surface",
                  )}
                >
                  {step.answer === "yes" ? (
                    <Check className="size-2.5 text-accent" strokeWidth={2.5} />
                  ) : (
                    <X className="size-2.5 text-fg-faint" strokeWidth={2.5} />
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => rewind(i)}
                  className="text-left text-[12.5px] leading-relaxed text-fg-muted transition-colors duration-150 hover:text-fg-secondary"
                  title="Go back to this question"
                >
                  {q?.question}
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}

      {/* ── question, or result ────────────────────────────────────── */}
      {node?.question ? (
        <div className="animate-in-rise rounded-lg border border-border bg-surface/40 p-6">
          <p className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
            Question {path.length + 1}
          </p>

          <h2 className="mt-4 max-w-[46ch] text-[17px] font-medium leading-snug tracking-[-0.01em] text-fg">
            {node.question}
          </h2>

          {node.hint ? (
            <p className="mt-3 max-w-[56ch] text-[13px] leading-relaxed text-fg-muted">
              {node.hint}
            </p>
          ) : null}

          <div className="mt-7 flex gap-2.5">
            <button
              type="button"
              onClick={() => answer("yes")}
              className="flex-1 rounded-md border border-accent/30 bg-accent/10 px-4 py-2.5 font-mono text-[12.5px] text-accent transition-colors duration-150 hover:bg-accent/15 sm:flex-none sm:px-8"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => answer("no")}
              className="flex-1 rounded-md border border-border bg-surface px-4 py-2.5 font-mono text-[12.5px] text-fg-secondary transition-colors duration-150 hover:border-border-strong hover:text-fg sm:flex-none sm:px-8"
            >
              No
            </button>
          </div>
        </div>
      ) : leaf ? (
        <div className="animate-in-rise">
          <p className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
            Start with
          </p>

          <Link
            href={`/patterns/${leaf.slug}`}
            className="group mt-4 block rounded-lg border border-accent/25 bg-accent/[0.04] p-6 transition-colors duration-200 hover:border-accent/45 hover:bg-accent/[0.07]"
          >
            <h2 className="font-mono text-[1.125rem] uppercase tracking-[0.06em] text-accent">
              {leaf.title}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[13.5px] leading-relaxed text-fg-secondary">
              {leaf.description}
            </p>
            <p className="mt-4 font-mono text-2xs text-fg-muted">
              {leaf.concepts.join(" · ")}
            </p>
            <span className="mt-5 flex items-center gap-2 font-mono text-2xs text-accent">
              Open the pattern
              <ArrowRight
                className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </span>
          </Link>

          {node?.alternates?.length ? (
            <div className="mt-8">
              <p className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
                Also worth a look
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {node.alternates.map((slug) => {
                  const alt = patterns[slug];
                  if (!alt) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/patterns/${slug}`}
                        className="inline-block rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-2xs text-fg-secondary transition-colors duration-150 hover:border-border-strong hover:text-fg"
                      >
                        {alt.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex items-center gap-5">
        <button
          type="button"
          onClick={reset}
          disabled={path.length === 0}
          className="flex items-center gap-2 font-mono text-2xs text-fg-muted transition-colors duration-150 hover:text-fg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="size-3" strokeWidth={1.5} />
          Start over
        </button>
        {path.length > 0 ? (
          <button
            type="button"
            onClick={() => rewind(path.length - 1)}
            className="font-mono text-2xs text-fg-muted transition-colors duration-150 hover:text-fg-secondary"
          >
            ← Back one step
          </button>
        ) : null}
      </div>
    </div>
  );
}
