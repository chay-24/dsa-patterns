import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Problem } from "@/data/types";
import { leetcodeURL } from "@/data/problems";
import { patternBySlug } from "@/data/patterns";
import { cn } from "@/lib/utils";
import { DifficultyDot } from "./difficulty";
import { ProblemMark } from "./progress-marks";

export function ProblemRow({
  problem,
  showPattern = true,
  className,
}: {
  problem: Problem;
  showPattern?: boolean;
  className?: string;
}) {
  const primary = problem.patterns[0]
    ? patternBySlug.get(problem.patterns[0])
    : undefined;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 border-b border-border py-3 pl-1 pr-1",
        "transition-colors duration-150 hover:bg-surface/50",
        className,
      )}
    >
      <ProblemMark id={problem.id} className="mt-[3px]" />

      <Link
        href={`/problems/${problem.id}`}
        className="min-w-0 flex-1 focus-visible:outline-none"
      >
        <span className="flex items-baseline gap-2.5">
          <span className="font-mono text-2xs tabular-nums text-fg-faint">
            {String(problem.id).padStart(3, "0")}
          </span>
          <span className="min-w-0 truncate text-[13.5px] text-fg-secondary transition-colors duration-150 group-hover:text-fg">
            {problem.title}
          </span>
        </span>

        {showPattern && primary ? (
          <span className="mt-1 block pl-[calc(1.5rem+6px)] text-[12px] text-fg-muted">
            {primary.title}
            {problem.patterns[1] ? (
              <>
                <span className="mx-1.5 text-fg-faint">+</span>
                {patternBySlug.get(problem.patterns[1])?.title}
              </>
            ) : null}
          </span>
        ) : null}
      </Link>

      <span className="mt-[3px] flex shrink-0 items-center gap-2.5">
        {problem.premium ? (
          <span className="hidden font-mono text-2xs text-warning/70 sm:inline">
            premium
          </span>
        ) : null}
        <DifficultyDot difficulty={problem.difficulty} className="mt-[5px]" />
        <a
          href={leetcodeURL(problem)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${problem.title} on LeetCode`}
          className="grid size-5 place-items-center rounded text-fg-faint transition-colors duration-150 hover:bg-border/60 hover:text-link"
        >
          <ExternalLink className="size-3" strokeWidth={1.5} />
        </a>
      </span>
    </div>
  );
}
