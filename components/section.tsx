import { cn } from "@/lib/utils";

type Props = {
  /** "01" */
  number?: string;
  title: string;
  /** Anchor id for the table of contents. */
  id?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({ number, title, id, children, className }: Props) {
  return (
    <section id={id} className={cn("scroll-mt-20", className)}>
      <div className="mb-5 flex items-baseline gap-3 border-b border-border pb-2.5">
        {number ? (
          <span className="font-mono text-2xs tabular-nums text-fg-faint">
            {number}
          </span>
        ) : null}
        <h2 className="font-mono text-2xs uppercase tracking-[0.16em] text-fg-secondary">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-2xs uppercase tracking-[0.16em] text-fg-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
