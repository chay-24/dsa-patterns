"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; number: string; title: string };

export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = React.useState(items[0]?.id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-16">
      <p className="pb-3 font-mono text-2xs uppercase tracking-[0.16em] text-fg-faint">
        On this page
      </p>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={cn(
                "flex gap-2 rounded py-1 text-[12.5px] transition-colors duration-150",
                active === it.id
                  ? "text-accent"
                  : "text-fg-muted hover:text-fg-secondary",
              )}
            >
              <span className="font-mono text-2xs tabular-nums opacity-60">
                {it.number}
              </span>
              <span className="truncate">{it.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
