import type { ComplexityRow } from "@/data/types";
import { cn } from "@/lib/utils";

export function Complexity({
  rows,
  className,
}: {
  rows: ComplexityRow[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-1 items-baseline gap-x-6 gap-y-1 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,7rem)_minmax(0,auto)_minmax(0,1fr)]"
        >
          <dt className="text-[13px] text-fg-secondary">{r.label}</dt>
          <dd className="font-mono text-[13px] text-code">{r.value}</dd>
          <dd className="text-[12.5px] leading-relaxed text-fg-muted sm:text-right">
            {r.note ?? ""}
          </dd>
        </div>
      ))}
    </dl>
  );
}
