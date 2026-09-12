import type { Metadata } from "next";
import { complexityGroups, growthScale, budgetTable } from "@/data/complexity";
import { Page, Breadcrumb } from "@/components/page";
import { Section } from "@/components/section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Complexity",
  description:
    "Reference tables for data structures, sorting, graphs and patterns — plus what fits in a one-second limit.",
};

const tone = {
  good: "text-easy",
  warn: "text-medium",
  bad: "text-hard",
} as const;

export default function ComplexityPage() {
  return (
    <Page wide>
      <Breadcrumb items={[{ label: "Complexity" }]} />

      <header className="max-w-2xl">
        <h1 className="font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg">
          Complexity
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-fg-secondary">
          What each structure costs, and what you can afford. Read the input
          bounds first — they usually name the intended complexity.
        </p>
      </header>

      <div className="mt-14 space-y-14">
        <Section number="01" title="Growth at n = 10⁶">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 font-mono text-2xs uppercase tracking-wider text-fg-faint">
                    Order
                  </th>
                  <th className="py-2 pr-4 font-mono text-2xs uppercase tracking-wider text-fg-faint">
                    Operations
                  </th>
                  <th className="py-2 font-mono text-2xs uppercase tracking-wider text-fg-faint">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                {growthScale.map((g) => (
                  <tr key={g.label} className="border-b border-border">
                    <td className="py-2.5 pr-4 font-mono text-[13px] text-code">
                      {g.label}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[13px] tabular-nums text-fg-muted">
                      {g.n1e6}
                    </td>
                    <td
                      className={cn("py-2.5 font-mono text-[12.5px]", tone[g.tone])}
                    >
                      {g.verdict}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="02" title="What fits in one second">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {budgetTable.map((b) => (
              <div key={b.n} className="bg-bg px-4 py-3.5">
                <p className="font-mono text-[13px] text-fg-secondary">{b.n}</p>
                <p className="mt-1.5 font-mono text-[13px] text-code">{b.target}</p>
                <p className="mt-1 text-[12px] text-fg-muted">{b.hint}</p>
              </div>
            ))}
          </div>
        </Section>

        {complexityGroups.map((group, gi) => (
          <Section
            key={group.slug}
            id={group.slug}
            number={String(gi + 3).padStart(2, "0")}
            title={group.title}
          >
            <p className="mb-7 text-[13px] leading-relaxed text-fg-muted">
              {group.blurb}
            </p>

            <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
              {group.entries.map((e) => (
                <div key={e.name}>
                  <h3 className="mb-2 border-b border-border pb-2 text-[13.5px] text-fg-secondary">
                    {e.name}
                  </h3>
                  <dl>
                    {e.rows.map((r) => (
                      <div
                        key={r.op}
                        className="flex flex-wrap items-baseline gap-x-3 py-1.5"
                      >
                        <dt className="min-w-0 flex-1 truncate text-[12.5px] text-fg-muted">
                          {r.op}
                        </dt>
                        <dd className="font-mono text-[12.5px] text-code">
                          {r.value}
                        </dd>
                        {r.note ? (
                          <dd className="w-full text-[11.5px] text-fg-faint">
                            {r.note}
                          </dd>
                        ) : null}
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </Page>
  );
}
