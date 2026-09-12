import Link from "next/link";
import { Page } from "@/components/page";

export default function NotFound() {
  return (
    <Page className="lg:pt-28">
      <p className="font-mono text-2xs uppercase tracking-[0.16em] text-fg-faint">
        404
      </p>
      <h1 className="mt-5 font-mono text-[1.5rem] uppercase tracking-[0.06em] text-fg">
        Not found
      </h1>
      <p className="mt-4 max-w-[48ch] text-[14px] leading-relaxed text-fg-secondary">
        That page does not exist. Try the pattern list, or press{" "}
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-2xs text-fg-muted">
          ⌘K
        </kbd>{" "}
        to search.
      </p>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {[
          { title: "Patterns", href: "/patterns" },
          { title: "Problems", href: "/problems" },
          { title: "Go Cheatsheet", href: "/cheatsheet" },
          { title: "Find the pattern", href: "/decide" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md border border-border bg-surface/50 px-3 py-2 font-mono text-2xs text-fg-secondary transition-colors duration-150 hover:border-border-strong hover:text-fg"
          >
            {l.title}
          </Link>
        ))}
      </div>
    </Page>
  );
}
