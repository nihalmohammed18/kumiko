import { Children, type ComponentProps, type ReactNode } from "react";
import { labels } from "../labels.ts";
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
}

/** A row of equal pill segments announcing each step's label and completion state.
 * Use when: showing position in a multi-step flow. Avoid when: steps need to be clickable navigation.
 * Server-safe: state words default to English. Client code passes useKumiko().labels through formatLabel.
 *
 * @example
 * <ProgressSteps aria-label="Application steps" steps={["Profile", "Resume", "Review"]} current={1} />
 */
export function ProgressSteps({
  steps,
  current,
  stepCompleted = labels.en.stepCompleted,
  stepUpcoming = labels.en.stepUpcoming,
  className,
  ...props
}: ProgressStepsProps) {
  // Each ReactNode label, including an array of nodes, occupies exactly one segment.
  const stepLabels = steps.map((label) => <>{label}</>);
  return (
    <ol {...props} data-slot="progress-steps" className={cn("flex min-w-0 gap-1.5", className)}>
      {Children.map(stepLabels, (label, index) => (
        <li
          data-slot="progress-steps-step"
          aria-current={index === current ? "step" : undefined}
          className={cn(
            "h-2.5 min-w-0 flex-1 rounded-full forced-colors:forced-color-adjust-none forced-colors:border-2 forced-colors:border-forced-ink",
            index < current
              ? "bg-brand forced-colors:bg-forced-fill"
              : index === current
                ? "bg-brand-tint outline-2 -outline-offset-2 outline-brand-text forced-colors:bg-forced-surface forced-colors:outline-forced-fill"
                : "bg-line forced-colors:bg-forced-surface",
          )}
        >
          <span className="sr-only">
            {label}
            {index < current ? `, ${stepCompleted}` : index > current ? `, ${stepUpcoming}` : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
