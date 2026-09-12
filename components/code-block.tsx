import { tokenizeGoLines, tokenClass } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

type Props = {
  code: string;
  filename?: string;
  language?: string;
  /** Hide the line-number gutter — used for short snippet listings. */
  plain?: boolean;
  className?: string;
};

/**
 * Server component: highlighting happens at build time, so the browser
 * downloads no tokenizer and no theme.
 */
export function CodeBlock({
  code,
  filename,
  language = "Go",
  plain = false,
  className,
}: Props) {
  const lines = tokenizeGoLines(code.replace(/\n+$/, ""));
  const gutterWidth = String(lines.length).length;

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-[#0c0c0e]",
        className,
      )}
    >
      {filename ? (
        <figcaption className="flex items-center gap-3 border-b border-border bg-surface/60 px-3 py-2">
          <span className="truncate font-mono text-2xs text-fg-secondary">
            {filename}
          </span>
          <span className="ml-auto font-mono text-2xs uppercase tracking-wider text-fg-faint">
            {language}
          </span>
          <CopyButton value={code} />
        </figcaption>
      ) : (
        <CopyButton
          value={code}
          className="absolute right-1.5 top-1.5 z-10 bg-[#0c0c0e]/80 backdrop-blur-sm transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
        />
      )}

      <div className="overflow-x-auto">
        <pre className="min-w-full py-3 font-mono text-[12.5px] leading-[1.65]">
          <code className="block">
            {lines.map((tokens, i) => (
              <span key={i} className="block whitespace-pre px-3">
                {!plain && (
                  <span
                    aria-hidden
                    className="mr-4 inline-block select-none text-right text-[#3f3f46]"
                    style={{ width: `${gutterWidth}ch` }}
                  >
                    {i + 1}
                  </span>
                )}
                {tokens.length === 0 ? (
                  <span> </span>
                ) : (
                  tokens.map((t, j) => (
                    <span key={j} className={tokenClass[t.t]}>
                      {t.v}
                    </span>
                  ))
                )}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}

/** Inline monospace code, for prose. */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[0.85em] text-code">
      {children}
    </code>
  );
}
