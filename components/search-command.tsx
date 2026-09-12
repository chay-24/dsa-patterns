"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { CornerDownLeft, Search } from "lucide-react";
import type { SearchEntry, SearchKind } from "@/lib/search-index";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { cn } from "@/lib/utils";

const GROUPS: { kind: SearchKind; label: string }[] = [
  { kind: "pattern", label: "Patterns" },
  { kind: "problem", label: "Problems" },
  { kind: "snippet", label: "Snippets" },
  { kind: "category", label: "Categories" },
  { kind: "page", label: "Pages" },
];

const diffClass: Record<string, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};

/** Module-level cache: fetched once per page load, shared by every open. */
let cached: SearchEntry[] | null = null;
let inflight: Promise<SearchEntry[]> | null = null;

export function loadSearchIndex(): Promise<SearchEntry[]> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch("/api/search-index")
      .then((r) => r.json() as Promise<SearchEntry[]>)
      .then((data) => {
        cached = data;
        return data;
      })
      .catch(() => {
        inflight = null;
        return [];
      });
  }
  return inflight;
}

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        {/* mounted only while open, so the query resets on every close */}
        <Palette onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState<SearchEntry[]>(cached ?? []);

  React.useEffect(() => {
    let live = true;
    if (!cached) {
      loadSearchIndex().then((data) => {
        if (live) setIndex(data);
      });
    }
    return () => {
      live = false;
    };
  }, []);

  const go = React.useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  // Rank in JS so a problem number match ("739") beats a fuzzy title hit.
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return index.filter((e) => e.kind === "page" || e.kind === "category").slice(0, 12);
    }

    const scored: { e: SearchEntry; s: number }[] = [];
    for (const e of index) {
      const title = e.title.toLowerCase();
      let s = 0;

      if (e.tag === q || e.tag?.replace(/^0+/, "") === q) s = 1000;
      else if (title === q) s = 900;
      else if (title.startsWith(q)) s = 800;
      else if (title.includes(q)) s = 600;
      else if (e.words.includes(q)) s = 400;
      else if (e.sub.toLowerCase().includes(q)) s = 300;
      else {
        // every word of the query must appear somewhere
        const hay = `${title} ${e.words} ${e.sub.toLowerCase()}`;
        const parts = q.split(/\s+/);
        if (parts.length > 1 && parts.every((p) => hay.includes(p))) s = 200;
      }

      if (s > 0) {
        if (e.kind === "pattern") s += 30;
        else if (e.kind === "category") s += 20;
        scored.push({ e, s });
      }
    }

    scored.sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title));
    return scored.slice(0, 40).map((x) => x.e);
  }, [index, query]);

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: results.filter((r) => r.kind === g.kind),
  })).filter((g) => g.items.length > 0);

  return (
    <Command
      shouldFilter={false}
      loop
      className="flex max-h-[min(70vh,32rem)] flex-col"
    >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-fg-faint" strokeWidth={1.5} />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Search patterns, problems, snippets…"
              className="h-12 w-full bg-transparent text-[14px] text-fg placeholder:text-fg-faint focus:outline-none"
            />
            <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-2xs text-fg-faint sm:block">
              esc
            </kbd>
          </div>

          <Command.List className="flex-1 overflow-y-auto overscroll-contain p-2">
            <Command.Empty className="px-3 py-8 text-center text-[13px] text-fg-muted">
              {index.length === 0
                ? "Loading index…"
                : `No matches for \u201c${query}\u201d`}
            </Command.Empty>

            {grouped.map((g) => (
              <Command.Group
                key={g.kind}
                heading={
                  <span className="px-2 font-mono text-2xs uppercase tracking-[0.14em] text-fg-faint">
                    {g.label}
                  </span>
                }
                className="mb-1 [&_[cmdk-group-heading]]:py-1.5"
              >
                {g.items.map((e) => (
                  <Command.Item
                    key={e.k}
                    value={e.k}
                    onSelect={() => go(e.href)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2",
                      "text-[13px] text-fg-secondary",
                      "data-[selected=true]:bg-border/50 data-[selected=true]:text-fg",
                    )}
                  >
                    {e.tag ? (
                      <span className="w-7 shrink-0 font-mono text-2xs tabular-nums text-fg-faint">
                        {e.tag}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{e.title}</span>
                    <span
                      className={cn(
                        "hidden shrink-0 font-mono text-2xs sm:block",
                        diffClass[e.sub] ?? "text-fg-faint",
                      )}
                    >
                      {e.sub}
                    </span>
                    <CornerDownLeft
                      className="size-3 shrink-0 text-transparent group-data-[selected=true]:text-fg-faint"
                      strokeWidth={1.5}
                    />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2 font-mono text-2xs text-fg-faint">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border px-1">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-border px-1">↵</kbd> open
            </span>
            <span className="ml-auto hidden sm:block">
              {results.length} result{results.length === 1 ? "" : "s"}
        </span>
      </div>
    </Command>
  );
}
