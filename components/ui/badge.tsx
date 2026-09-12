import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded font-mono text-2xs leading-none transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border border-border bg-surface px-2 py-1 text-fg-secondary",
        chip: "border border-border bg-surface px-2 py-1 text-fg-secondary hover:border-border-strong hover:text-fg",
        accent:
          "border border-accent/25 bg-accent/10 px-2 py-1 text-accent",
        ghost: "px-0 py-0 text-fg-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
