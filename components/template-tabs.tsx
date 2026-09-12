"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tab = {
  name: string;
  note?: string;
  content: React.ReactNode;
};

/**
 * Tabs over a pattern's Go templates. The code inside each tab is already
 * highlighted on the server and passed through as children.
 */
export function TemplateTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = React.useState(0);

  if (tabs.length === 1) {
    return (
      <div>
        {tabs[0].note ? (
          <p className="mb-3 text-[12.5px] leading-relaxed text-fg-muted">
            {tabs[0].note}
          </p>
        ) : null}
        {tabs[0].content}
      </div>
    );
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Go templates"
        className="-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1"
      >
        {tabs.map((t, i) => (
          <button
            key={t.name}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 rounded border px-2.5 py-1.5 font-mono text-2xs transition-colors duration-150",
              i === active
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-border bg-surface/50 text-fg-muted hover:border-border-strong hover:text-fg-secondary",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tabs[active].note ? (
        <p className="mb-3 text-[12.5px] leading-relaxed text-fg-muted">
          {tabs[active].note}
        </p>
      ) : null}

      {tabs.map((t, i) => (
        <div key={t.name} hidden={i !== active} role="tabpanel">
          {t.content}
        </div>
      ))}
    </div>
  );
}
