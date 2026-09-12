import Link from "next/link";
import { patternBySlug } from "@/data/patterns";
import { cn } from "@/lib/utils";

/**
 * An ASCII-tree of related patterns. Every branch is a link, which is the
 * point: moving between neighbouring ideas should take one click.
 */
export function RelatedPatterns({
  title,
  slugs,
  className,
}: {
  title: string;
  slugs: string[];
  className?: string;
}) {
  const related = slugs
    .map((s) => patternBySlug.get(s))
    .filter((p): p is NonNullable<typeof p> => !!p);

  if (related.length === 0) return null;

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-surface/50 p-4",
        className,
      )}
    >
      <div className="font-mono text-[12.5px] leading-[1.9]">
        <p className="text-fg">{title}</p>
        <p className="text-fg-faint">{"│"}</p>

        {related.map((p, i) => {
          const last = i === related.length - 1;
          return (
            <p key={p.slug} className="whitespace-nowrap">
              <span className="text-fg-faint">
                {last ? "└── " : "├── "}
              </span>
              <Link
                href={`/patterns/${p.slug}`}
                className="text-fg-secondary underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
              >
                {p.title}
              </Link>
              <span className="ml-3 hidden text-fg-faint sm:inline">
                {p.concepts.slice(0, 2).join(" · ")}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}
