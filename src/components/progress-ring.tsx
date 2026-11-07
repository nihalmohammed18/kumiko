"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { ReactNode } from "react";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";

/** Props for a determinate ring with a required accessible name.
 * Use when: typing ProgressRing. Avoid when: progress is unknown; use SpinnerProps.
 */
export type ProgressRingProps = Omit<
  BaseProgress.Root.Props,
  "aria-label" | "aria-labelledby" | "className" | "value" | "children"
> &
  ({ "aria-label": string; "aria-labelledby"?: string } | { "aria-label"?: string; "aria-labelledby": string }) & {
    value: number;
    size?: "sm" | "md" | "lg";
    /** Shows Base UI's locale-formatted value when no custom centre content is supplied. */
    showValue?: boolean;
    children?: ReactNode;
    className?: string;
  };

const sizes = { sm: "size-10 text-caption", md: "size-14 text-body-sm", lg: "size-20 text-title-sm" };
const circumference = 2 * Math.PI * 45;

/** A circular progress indicator with a scaled stroke and an optional centre value.
 * Use when: showing measurable progress towards a goal.
 * Avoid when: showing a multi-step flow (use ProgressSteps) or an unknown wait (use Spinner).
 * Custom centre content is decorative; describe it with aria-valuetext or getAriaValueText.
 */
export function ProgressRing({
  value,
  min = 0,
  max = 100,
  size = "md",
  showValue = true,
  children,
  className,
  locale,
  ...props
}: ProgressRingProps) {
  const { locale: providerLocale } = useKumiko();
  const fraction = (value - min) / (max - min);
  // Match Base UI's clamped percentage, including empty and non-finite ranges.
  const progress = Number.isFinite(value) ? Math.min(1, Math.max(0, Number.isNaN(fraction) ? 0 : fraction)) : 0;
  return (
    <BaseProgress.Root
      {...props}
      value={value}
      min={min}
      max={max}
      locale={locale ?? providerLocale}
      data-slot="progress-ring"
      className={cn(
        "grid shrink-0 grid-cols-1 grid-rows-1 items-center justify-items-center text-ink",
        sizes[size],
        className,
      )}
    >
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 100 100"
        fill="none"
        className="col-start-1 row-start-1 size-full origin-center rtl:-scale-x-100"
      >
        <g transform="rotate(-90 50 50)">
          <circle
            data-slot="progress-ring-track"
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            className="stroke-line forced-colors:forced-color-adjust-none forced-colors:stroke-forced-ink"
          />
          <circle
            data-slot="progress-ring-indicator"
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            visibility={progress === 0 ? "hidden" : undefined}
            className="stroke-brand transition-[stroke-dashoffset] duration-move ease-move motion-reduce:transition-none forced-colors:forced-color-adjust-none forced-colors:stroke-forced-fill"
          />
        </g>
      </svg>
      {(children != null || showValue) && (
        <div
          data-slot="progress-ring-centre"
          aria-hidden
          className="col-start-1 row-start-1 min-w-0 max-w-[80%] wrap-anywhere text-center font-display font-bold tabular-nums"
        >
          {children ?? <BaseProgress.Value data-slot="progress-ring-value" />}
        </div>
      )}
    </BaseProgress.Root>
  );
}
