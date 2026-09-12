import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page container. One place that owns the max width and side gutters. */
export function Page({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-5 py-10 sm:px-8 lg:px-12 lg:py-16",
        wide ? "max-w-6xl" : "max-w-3xl",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1">
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} className="flex items-center gap-1">
          {i > 0 ? (
            <ChevronRight
              className="size-3 text-fg-faint"
              strokeWidth={1.5}
              aria-hidden
            />
          ) : null}
          {it.href ? (
            <Link
              href={it.href}
              className="font-mono text-2xs text-fg-muted transition-colors duration-150 hover:text-fg-secondary"
            >
              {it.label}
            </Link>
          ) : (
            <span className="font-mono text-2xs text-fg-secondary">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Previous / next links at the foot of a detail page. */
export function PageNav({
  prev,
  next,
}: {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-lg border border-border px-4 py-3 transition-colors duration-150 hover:border-border-strong hover:bg-surface/50"
        >
          <span className="block font-mono text-2xs text-fg-faint">
            ← Previous
          </span>
          <span className="mt-1 block truncate text-[13px] text-fg-secondary transition-colors group-hover:text-fg">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group rounded-lg border border-border px-4 py-3 text-right transition-colors duration-150 hover:border-border-strong hover:bg-surface/50 sm:col-start-2"
        >
          <span className="block font-mono text-2xs text-fg-faint">Next →</span>
          <span className="mt-1 block truncate text-[13px] text-fg-secondary transition-colors group-hover:text-fg">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
