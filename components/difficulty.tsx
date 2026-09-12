import type { Difficulty } from "@/data/types";
import { cn } from "@/lib/utils";

const dot: Record<Difficulty, string> = {
  Easy: "bg-easy",
  Medium: "bg-medium",
  Hard: "bg-hard",
};

const text: Record<Difficulty, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};

export function DifficultyDot({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 shrink-0 rounded-full", dot[difficulty], className)}
    />
  );
}

export function DifficultyTag({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider",
        text[difficulty],
        className,
      )}
    >
      <DifficultyDot difficulty={difficulty} />
      {difficulty}
    </span>
  );
}

/** Three tiny bars showing the easy/medium/hard split. */
export function DifficultySpread({
  easy,
  medium,
  hard,
  className,
}: {
  easy: number;
  medium: number;
  hard: number;
  className?: string;
}) {
  const total = easy + medium + hard;
  if (total === 0) return null;

  const seg = [
    { n: easy, c: "bg-easy/70" },
    { n: medium, c: "bg-medium/70" },
    { n: hard, c: "bg-hard/70" },
  ].filter((s) => s.n > 0);

  return (
    <span
      className={cn("flex h-0.5 w-14 gap-px overflow-hidden rounded-full", className)}
      title={`${easy} easy · ${medium} medium · ${hard} hard`}
    >
      {seg.map((s, i) => (
        <span key={i} className={cn("h-full", s.c)} style={{ flex: s.n }} />
      ))}
    </span>
  );
}
