import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DifficultySpread } from "./difficulty";

type CardProps = {
  href: string;
  number: string;
  title: string;
  description: string;
  concepts: string[];
  meta: { patterns?: number; problems: number };
  spread?: { easy: number; medium: number; hard: number };
  className?: string;
};

/** The large card used for categories on the homepage. */
export function PatternCard({
  href,
  number,
  title,
  description,
  concepts,
  meta,
  spread,
  className,
}: CardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-surface/40 p-5",
        "transition-[transform,border-color,background-color] duration-200 ease-[var(--ease-out-subtle)]",
        "hover:-translate-y-px hover:border-border-strong hover:bg-surface",
        className,
      )}
    >
      <span className="font-mono text-2xs tabular-nums text-fg-faint transition-colors duration-200 group-hover:text-accent">
        {number}
      </span>

      <h3 className="mt-5 font-mono text-[13px] uppercase tracking-[0.12em] text-fg">
        {title}
      </h3>

      <p className="mt-2.5 max-w-[36ch] text-[13px] leading-relaxed text-fg-secondary">
        {description}
      </p>

      <p className="mt-4 font-mono text-2xs text-fg-muted">
        {concepts.join(" · ")}
      </p>

      <div className="mt-6 flex items-center gap-4 border-t border-border pt-3.5">
        <span className="font-mono text-2xs tabular-nums text-fg-muted">
          {meta.patterns !== undefined ? (
            <>
              {String(meta.patterns).padStart(2, "0")} patterns
              <span className="mx-2 text-fg-faint">·</span>
            </>
          ) : null}
          {meta.problems} problems
        </span>

        {spread ? <DifficultySpread {...spread} className="hidden sm:flex" /> : null}

        <ArrowRight
          className="ml-auto size-3.5 shrink-0 text-fg-faint transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  );
}

type RowProps = {
  href: string;
  number: string;
  title: string;
  description: string;
  concepts?: string[];
  problems: number;
  className?: string;
};

/** The compact row used in pattern listings. */
export function PatternRow({
  href,
  number,
  title,
  description,
  concepts,
  problems,
  className,
}: RowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-4 border-b border-border px-1 py-3.5",
        "transition-colors duration-150 hover:bg-surface/50",
        className,
      )}
    >
      <span className="mt-px w-5 shrink-0 font-mono text-2xs tabular-nums text-fg-faint transition-colors duration-150 group-hover:text-accent">
        {number}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] text-fg transition-colors duration-150">
          {title}
        </span>
        <span className="mt-1 block truncate text-[12.5px] text-fg-muted">
          {concepts?.length ? concepts.join(" · ") : description}
        </span>
      </span>

      <span className="mt-px shrink-0 font-mono text-2xs tabular-nums text-fg-faint">
        {String(problems).padStart(2, "0")}
      </span>

      <ArrowRight
        className="mt-px size-3 shrink-0 text-transparent transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-fg-muted"
        strokeWidth={1.5}
      />
    </Link>
  );
}
