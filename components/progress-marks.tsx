"use client";

import * as React from "react";
import { Check, RotateCcw, Star } from "lucide-react";
import { useProgress, countLearned, type Mark } from "@/lib/progress";
import { cn } from "@/lib/utils";

const LABEL: Record<Mark, string> = {
  learned: "Learned",
  important: "Important",
  review: "Review",
};

function MarkIcon({ mark }: { mark: Mark | undefined }) {
  if (mark === "learned")
    return <Check className="size-3 text-accent" strokeWidth={2.25} />;
  if (mark === "important")
    return <Star className="size-3 fill-warning text-warning" strokeWidth={1.5} />;
  if (mark === "review")
    return <RotateCcw className="size-3 text-link" strokeWidth={2} />;
  return null;
}

/**
 * One click cycles: unmarked → learned → important → review → unmarked.
 * Deliberately small and quiet — this is a bookmark, not a game.
 */
export function ProblemMark({ id, className }: { id: number; className?: string }) {
  const { marks, cycle } = useProgress();
  const key = `p:${id}`;
  const mark = marks[key];

  return (
    <button
      type="button"
      onClick={() => cycle(key)}
      title={mark ? `${LABEL[mark]} — click to change` : "Mark as learned"}
      aria-label={mark ? LABEL[mark] : "Mark as learned"}
      className={cn(
        "grid size-[18px] shrink-0 place-items-center rounded-full border",
        "transition-colors duration-150",
        mark === "learned" && "border-accent/40 bg-accent/10",
        mark === "important" && "border-warning/40 bg-warning/10",
        mark === "review" && "border-link/40 bg-link/10",
        !mark && "border-border hover:border-border-strong hover:bg-surface",
        className,
      )}
    >
      <MarkIcon mark={mark} />
    </button>
  );
}

/** "12 / 18" plus a hairline bar. Hidden until the user marks something. */
export function PatternProgress({
  ids,
  className,
}: {
  ids: number[];
  className?: string;
}) {
  const { marks } = useProgress();
  const done = countLearned(marks, ids);
  const total = ids.length;
  if (total === 0) return null;

  const pct = Math.round((done / total) * 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-0.5 w-24 overflow-hidden rounded-full bg-border">
        <span
          className="block h-full bg-accent/70 transition-[width] duration-300 ease-[var(--ease-out-subtle)]"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="font-mono text-2xs tabular-nums text-fg-muted">
        {done} / {total}
      </span>
    </div>
  );
}

/** Summary used on the problems index. */
export function ProgressSummary({ total }: { total: number }) {
  const { marks, clearAll } = useProgress();
  const counts = { learned: 0, important: 0, review: 0 };
  for (const k of Object.keys(marks)) {
    if (!k.startsWith("p:")) continue;
    counts[marks[k]]++;
  }
  const any = counts.learned + counts.important + counts.review > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-2xs text-fg-muted">
      <span className="tabular-nums">{total} problems</span>
      {any ? (
        <>
          <span className="flex items-center gap-1.5 text-accent">
            <Check className="size-3" strokeWidth={2.25} />
            {counts.learned} learned
          </span>
          <span className="flex items-center gap-1.5 text-warning">
            <Star className="size-3 fill-warning" strokeWidth={1.5} />
            {counts.important}
          </span>
          <span className="flex items-center gap-1.5 text-link">
            <RotateCcw className="size-3" strokeWidth={2} />
            {counts.review}
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="text-fg-faint underline decoration-dotted underline-offset-4 transition-colors hover:text-fg-muted"
          >
            reset
          </button>
        </>
      ) : (
        <span className="font-sans text-[12px] text-fg-faint">
          click a circle to track a problem
        </span>
      )}
    </div>
  );
}
