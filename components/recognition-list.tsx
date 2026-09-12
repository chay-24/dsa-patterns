import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

/** Small keyword chips: the words in a statement that trigger the pattern. */
export function SignalChips({
  signals,
  className,
}: {
  signals: string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {signals.map((s) => (
        <li key={s}>
          <Badge variant="chip">{s}</Badge>
        </li>
      ))}
    </ul>
  );
}

/** The ticked checklist — the heart of the recognition-first approach. */
export function RecognitionList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check
            className="mt-[3px] size-3.5 shrink-0 text-accent/80"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-[13.5px] leading-relaxed text-fg-secondary">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TypicalQuestion({ question }: { question: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-4">
      <p className="font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
        Typical question
      </p>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-fg-secondary">
        &ldquo;{question}&rdquo;
      </p>
    </div>
  );
}
