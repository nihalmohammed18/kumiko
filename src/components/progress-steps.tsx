import { Children, type ComponentProps, type ReactNode } from "react";
import { CheckIcon } from "../icons.tsx";
import { englishLabels, formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";

/** Labels, current index and translated state words for a segmented flow indicator.
 * Use when: typing ProgressSteps. Avoid when: measuring a continuous value; use ProgressRingProps.
 */
export interface ProgressStepsProps extends Omit<ComponentProps<"ol">, "aria-label" | "children"> {
  steps: readonly ReactNode[];
  /** Zero-based index of the current step. */
  current: number;
  "aria-label": string;
  stepCompleted?: string;
  stepUpcoming?: string;
  /** Visible step names; all falls back to current below a 28rem container width. Defaults to current. */
  labels?: "current" | "all" | "hidden";
  /** Template with {current} and {total} placeholders. Defaults to English. */
  stepOf?: string;
  /** Locale for the summary's numbers. Defaults to English. */
  locale?: string;
}

/** A row of equal pill segments announcing each step's label and completion state.
 * Use when: showing position in a multi-step flow. Avoid when: steps need to be clickable navigation.
 * Shows the current step above the bars by default; labels="all" names each segment in wide containers.
 * Server-safe: labels and locale default to English; pass translated templates and the locale for other languages.
 *
 * @example
 * <ProgressSteps aria-label="Application steps" steps={["Profile", "Resume", "Review"]} current={1} />
 */
export function ProgressSteps({
  steps,
  current,
  stepCompleted = englishLabels.stepCompleted,
  stepUpcoming = englishLabels.stepUpcoming,
  labels = "current",
  stepOf = englishLabels.stepOf,
  locale = "en",
  className,
  ...props
}: ProgressStepsProps) {
  // Each ReactNode label, including an array of nodes, occupies exactly one segment.
  const stepLabels = steps.map((label) => <>{label}</>);
  const numbers = new Intl.NumberFormat(locale);
  return (
    <div className={cn("@container/progress-steps min-w-0", className)}>
      {labels !== "hidden" && current >= 0 && current < steps.length && (
        <p
          aria-hidden
          className={cn(
            "mb-2 min-w-0 wrap-anywhere text-body-sm text-ink",
            labels === "all" && "@md/progress-steps:hidden",
          )}
        >
          {formatLabel(stepOf, locale, undefined, {
            current: numbers.format(current + 1),
            total: numbers.format(steps.length),
          })}
          {" · "}
          <strong className="font-bold">{steps[current]}</strong>
        </p>
      )}
      <ol {...props} data-slot="progress-steps" className="flex min-w-0 gap-1.5">
        {Children.map(stepLabels, (label, index) => (
          <li
            data-slot="progress-steps-step"
            aria-current={index === current ? "step" : undefined}
            className={cn(
              "grid min-w-0 flex-1 content-start gap-2 before:h-2.5 before:min-w-0 before:rounded-full before:content-[''] forced-colors:before:forced-color-adjust-none forced-colors:before:border-2 forced-colors:before:border-forced-ink",
              index < current
                ? "before:bg-brand forced-colors:before:bg-forced-fill"
                : index === current
                  ? "before:bg-brand-tint before:outline-2 before:-outline-offset-2 before:outline-brand-text forced-colors:before:bg-forced-surface forced-colors:before:outline-forced-fill"
                  : "before:bg-line forced-colors:before:bg-forced-surface",
            )}
          >
            <span className="sr-only">
              {label}
              {index < current ? `, ${stepCompleted}` : index > current ? `, ${stepUpcoming}` : null}
            </span>
            {labels === "all" && (
              <span
                aria-hidden
                className={cn(
                  "hidden min-w-0 items-start gap-1 wrap-anywhere text-body-sm @md/progress-steps:flex",
                  index === current ? "font-bold text-ink" : "text-ink-muted",
                )}
              >
                {index < current && <CheckIcon className="mt-0.5 size-3.5 shrink-0" />}
                <span className="min-w-0 wrap-anywhere">{label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
