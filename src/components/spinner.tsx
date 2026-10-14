import type { ComponentProps } from "react";
import { cn } from "../lib/tv.ts";

export interface SpinnerProps extends ComponentProps<"span"> {
  /** Announced to screen readers. Leave it out when nearby text already says something is loading. */
  label?: string;
}

/**
 * A spinning ring that shows something is loading.
 *
 * Use when: waiting takes under a few seconds and there's no progress to report.
 * Avoid when: you know how far along it is (use Progress) or the layout of the result is known (use Skeleton).
 */
export function Spinner({ label, className, ...props }: SpinnerProps) {
  const ring = (
    <span
      data-slot="spinner"
      aria-hidden
      className={cn(
        "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-e-transparent",
        className,
      )}
      {...props}
    />
  );
  if (!label) return ring;
  return (
    <span role="status" className="inline-flex">
      {ring}
      <span className="sr-only">{label}</span>
    </span>
  );
}
