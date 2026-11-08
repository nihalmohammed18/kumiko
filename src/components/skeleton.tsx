import type { ComponentProps } from "react";
import { cn } from "../lib/tv.ts";

/** Native div props, a placeholder shape and classes defining its dimensions.
 * Use when: typing Skeleton. Avoid when: rendering content inside a placeholder.
 */
export interface SkeletonProps extends Omit<ComponentProps<"div">, "children"> {
  shape?: "block" | "text" | "circle";
}

/** A decorative loading placeholder with a reading-direction shimmer that stops under reduced motion.
 * Use when: the pending content's layout is known; size it with className and mark its container aria-busy="true".
 * Avoid when: progress is measurable (use ProgressRing) or the content's shape is unknown (use Spinner).
 *
 * @example
 * <section aria-label="Loading applications" aria-busy="true">
 *   <Skeleton shape="text" className="w-48" /><Skeleton className="h-24" />
 * </section>
 */
export function Skeleton({ shape = "block", className, ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "skeleton bg-line forced-colors:forced-color-adjust-none forced-colors:bg-forced-disabled forced-colors:after:bg-forced-surface",
        shape === "text" ? "h-lh rounded-full" : shape === "circle" ? "aspect-square rounded-full" : "rounded-control",
        className,
      )}
    />
  );
}
