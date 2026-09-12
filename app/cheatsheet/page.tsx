import type { Metadata } from "next";
import { cheatSections, snippetsBySection } from "@/data/snippets";
import { Page, Breadcrumb } from "@/components/page";
import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";

export const metadata: Metadata = {
  title: "Go Cheatsheet",
  description:
    "The Go you actually need in an interview: slices, maps, heap, strings, bits and the traps.",
};

export default function CheatsheetPage() {
  return (
    <Page wide>
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-14">
        <div className="min-w-0 max-w-3xl">
          <Breadcrumb items={[{ label: "Go Cheatsheet" }]} />

          <header className="max-w-2xl">
            <h1 className="font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg">
              Go Cheatsheet
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-fg-secondary">
              The parts of Go that come up under interview pressure — and the
              handful of language details that silently produce wrong answers.
            </p>
          </header>

          <div className="mt-14 space-y-16">
            {cheatSections.map((section, si) => {
              const items = snippetsBySection.get(section.slug) ?? [];
              return (
                <section
                  key={section.slug}
                  id={section.slug}
                  className="scroll-mt-20"
                >
                  <div className="mb-6 flex items-baseline gap-3 border-b border-border pb-2.5">
                    <span className="font-mono text-2xs tabular-nums text-fg-faint">
                      {String(si + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-mono text-2xs uppercase tracking-[0.16em] text-fg-secondary">
                      {section.title}
                    </h2>
                  </div>

                  <p className="mb-8 text-[13px] leading-relaxed text-fg-muted">
                    {section.blurb}
                  </p>

                  <div className="space-y-8">
                    {items.map((s) => (
                      <div key={s.title}>
                        <h3 className="text-[13.5px] text-fg-secondary">
                          {s.title}
                        </h3>
                        {s.note ? (
                          <p className="mt-1.5 max-w-[64ch] text-[12.5px] leading-relaxed text-fg-muted">
                            {s.note}
                          </p>
                        ) : null}
                        <CodeBlock code={s.code} plain className="mt-3" />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <aside className="hidden xl:block">
          <Toc
            items={cheatSections.map((s, i) => ({
              id: s.slug,
              number: String(i + 1).padStart(2, "0"),
              title: s.title,
            }))}
          />
        </aside>
      </div>
    </Page>
  );
}
