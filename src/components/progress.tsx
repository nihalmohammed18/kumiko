"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ReactNode } from "react";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";

/** Props for a determinate progress bar, its optional label and formatted value.
 * Use when: typing Progress. Avoid when: representing unknown progress; use SpinnerProps.
 */
export interface ProgressProps extends Omit<BaseProgress.Root.Props, "value" | "children" | "className"> {
  value: number;
  label?: ReactNode;
  showValue?: boolean;
  className?: string;
}

/** Shows task completion with a rounded fill and a value formatted in the provider's locale.
 * Use when: the total is known; pass aria-label when there is no visible label.
 * Avoid when: the duration is unknown; use Spinner.
 *
 * @example
 * <Progress label="Application completeness" value={60} />
 */
export function Progress({ label, showValue = true, locale, className, ...props }: ProgressProps) {
  const settings = useKumiko();
  return (
    <BaseProgress.Root
      {...props}
      locale={locale ?? settings.locale}
      data-slot="progress"
      className={cn("grid min-w-0 gap-2", className)}
    >
      {(label != null || showValue) && (
        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {label != null && (
            <BaseProgress.Label
              data-slot="progress-label"
              className="min-w-0 wrap-anywhere text-label font-bold text-ink"
            >
              {label}
            </BaseProgress.Label>
          )}
          {showValue && (
            <BaseProgress.Value
              data-slot="progress-value"
              className="ms-auto font-display font-bold tabular-nums text-ink"
            />
          )}
        </div>
      )}
      <BaseProgress.Track
        data-slot="progress-track"
        className="h-4 w-full overflow-hidden rounded-full bg-line forced-colors:bg-forced-surface forced-colors:outline-solid forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-forced-ink"
      >
        <BaseProgress.Indicator
          data-slot="progress-indicator"
          className="relative h-full overflow-hidden rounded-full bg-brand transition-[width] duration-move ease-move motion-reduce:transition-none before:absolute before:inset-0 before:rounded-full before:border-2 before:border-brand-text forced-colors:forced-color-adjust-none forced-colors:bg-forced-fill forced-colors:before:border-forced-fill"
        >
          <span
            aria-hidden
            className="progress-stripe absolute start-1 h-1 w-[min(44%,120px)] rounded-full [inset-block-start:4px] forced-colors:hidden"
          />
        </BaseProgress.Indicator>
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
