import { cn } from "@/lib/utils";

/** Monospace ASCII diagram, rendered verbatim. */
export function Diagram({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-surface/50 px-4 py-3.5",
        className,
      )}
    >
      <pre className="whitespace-pre font-mono text-[12px] leading-[1.75] text-fg-muted">
        {children}
      </pre>
    </div>
  );
}
