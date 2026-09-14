"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { SearchCommand, loadSearchIndex } from "./search-command";
import { Gopher } from "./gopher";
import { cn } from "@/lib/utils";

type NavItem = { title: string; href: string };

const SearchContext = React.createContext<() => void>(() => {});
export const useSearch = () => React.useContext(SearchContext);

export function Shell({
  patternNav,
  referenceNav,
  patternCategory,
  children,
}: {
  patternNav: NavItem[];
  referenceNav: NavItem[];
  /** pattern slug → category slug, so a pattern page lights up its category */
  patternCategory: Record<string, string>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const rawPath = usePathname();

  // The menu closes on navigation. Deriving it from the path it was opened
  // at does that without an effect that fights the router.
  const [menuAt, setMenuAt] = React.useState<string | null>(null);
  const menu = menuAt === rawPath;
  const setMenu = React.useCallback(
    (next: boolean) => setMenuAt(next ? rawPath : null),
    [rawPath],
  );

  // A pattern page should highlight its category, not "All patterns".
  const pathname = React.useMemo(() => {
    if (rawPath.startsWith("/patterns/")) {
      const cat = patternCategory[rawPath.split("/")[2] ?? ""];
      if (cat) return `/categories/${cat}`;
    }
    return rawPath;
  }, [rawPath, patternCategory]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "/" && !open) {
        const el = document.activeElement;
        const typing =
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          (el as HTMLElement | null)?.isContentEditable;
        if (!typing) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Warm the search index once the page is idle, so ⌘K opens instantly.
  React.useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(() => void loadSearchIndex());
      return;
    }
    const t = setTimeout(() => void loadSearchIndex(), 1500);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const openSearch = React.useCallback(() => setOpen(true), []);

  return (
    <SearchContext.Provider value={openSearch}>
      {/* ── mobile top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="logo-brand flex items-center gap-2.5">
          <Gopher height={30} />
          <span className="font-mono text-[13px] tracking-tight text-fg">
            go<span className="text-accent">/</span>dsa
          </span>
        </Link>

        <button
          type="button"
          onClick={openSearch}
          aria-label="Search"
          className="ml-auto grid size-9 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <Search className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => setMenu(!menu)}
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          className="-mr-2 grid size-9 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface hover:text-fg"
        >
          {menu ? (
            <X className="size-4" strokeWidth={1.5} />
          ) : (
            <Menu className="size-4" strokeWidth={1.5} />
          )}
        </button>
      </header>

      {menu ? (
        <nav className="fixed inset-x-0 bottom-0 top-14 z-30 overflow-y-auto overscroll-contain border-t border-border bg-bg px-4 py-6 lg:hidden animate-in-fade">
          <NavGroup label="Patterns" items={patternNav} pathname={pathname} large />
          <NavGroup
            label="Reference"
            items={referenceNav}
            pathname={pathname}
            className="mt-8"
            large
          />
          <GopherCredit className="mt-10 border-t px-0" />
        </nav>
      ) : null}

      {/* ── desktop sidebar ────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-border bg-bg lg:flex">
        <div className="px-6 pb-6 pt-7">
          <Link
            href="/"
            aria-label="go/dsa — home"
            className="logo-brand inline-flex rounded-md"
          >
            <Gopher height={36} />
          </Link>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={openSearch}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md border border-border bg-surface/60 px-2.5 py-1.5",
              "text-left text-[12.5px] text-fg-muted transition-colors duration-150",
              "hover:border-border-strong hover:text-fg-secondary",
            )}
          >
            <Search className="size-3.5 shrink-0" strokeWidth={1.5} />
            <span className="flex-1">Search</span>
            <kbd className="font-mono text-2xs text-fg-faint">⌘K</kbd>
          </button>
        </div>

        <nav className="mt-7 flex-1 overflow-y-auto px-4 pb-8">
          <NavGroup label="Patterns" items={patternNav} pathname={pathname} />
          <NavGroup
            label="Reference"
            items={referenceNav}
            pathname={pathname}
            className="mt-7"
          />
        </nav>

        <GopherCredit />
      </aside>

      <div className="lg:pl-[232px]">{children}</div>

      <SearchCommand open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  className,
  large,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  className?: string;
  large?: boolean;
}) {
  return (
    <div className={className}>
      <p className="px-2 pb-2 font-mono text-2xs uppercase tracking-[0.16em] text-fg-faint">
        {label}
      </p>
      <ul>
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" &&
              item.href !== "/patterns" &&
              pathname.startsWith(item.href + "/"));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative block rounded-md px-2 transition-colors duration-150",
                  large ? "py-2.5 text-[14px]" : "py-1.5 text-[13px]",
                  active
                    ? "bg-surface text-fg"
                    : "text-fg-muted hover:bg-surface/60 hover:text-fg-secondary",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 -left-px w-px bg-accent"
                  />
                ) : null}
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * CC BY asks for the credit to travel with the artwork, so it lives in the
 * sidebar rather than only in a footer.
 */
function GopherCredit({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "border-t border-border px-4 py-3 text-[10.5px] leading-relaxed text-fg-faint",
        className,
      )}
    >
      Gopher by{" "}
      <a
        href="http://reneefrench.blogspot.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 transition-colors hover:text-fg-muted"
      >
        Renée French
      </a>
      ,{" "}
      <a
        href="https://creativecommons.org/licenses/by/3.0/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 transition-colors hover:text-fg-muted"
      >
        CC BY 3.0
      </a>
    </p>
  );
}

/** The search affordance used inside page content. */
export function SearchTrigger({ className }: { className?: string }) {
  const open = useSearch();
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-border bg-surface/50 px-4 py-3",
        "text-left transition-[border-color,background-color] duration-200",
        "hover:border-border-strong hover:bg-surface",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-fg-faint" strokeWidth={1.5} />
      <span className="flex-1 truncate text-[13.5px] text-fg-muted">
        Search patterns, algorithms, problems…
      </span>
      <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-2xs text-fg-faint">
        ⌘K
      </kbd>
    </button>
  );
}
