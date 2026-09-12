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
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0"
        >
          <dt className="w-28 shrink-0 text-[13px] text-fg-secondary">{r.label}</dt>
          <dd className="font-mono text-[13px] text-code">{r.value}</dd>
          {r.note ? (
            <dd className="w-full text-[12.5px] text-fg-muted sm:ml-auto sm:w-auto sm:text-right">
              {r.note}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
