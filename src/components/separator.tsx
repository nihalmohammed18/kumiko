import type { ComponentProps } from "react";
import { cn } from "../lib/tv.ts";

/** Native divider props and its orientation.
 * Use when: typing Separator. Avoid when: splitting navigation into groups; use a labeled region.
 */
export interface SeparatorProps extends Omit<ComponentProps<"hr">, "children"> {
  orientation?: "horizontal" | "vertical";
}

/** A server-safe, accessible two-pixel divider in either orientation.
 * Use when: separating adjacent groups of content. Avoid when: spacing alone establishes the grouping.
 *
 * @example
 * <section><h2>Saved jobs</h2><Separator /><p>Frontend engineer at Cedar Labs</p></section>
 */
export function Separator({ orientation = "horizontal", className, ...props }: SeparatorProps) {
  return (
    // A native hr is a separator to assistive technology; aria-orientation tells it which way a vertical one runs.
    <hr
      {...props}
      data-slot="separator"
      data-orientation={orientation}
      aria-orientation={orientation}
      className={cn(
        "m-0 shrink-0 border-0 bg-line forced-colors:bg-forced-ink",
        orientation === "vertical" ? "h-auto w-0.5 self-stretch" : "h-0.5 w-full",
        className,
      )}
    />
  );
}
