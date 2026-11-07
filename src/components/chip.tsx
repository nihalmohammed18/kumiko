"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { CheckIcon } from "../icons.tsx";
import { cn } from "../lib/tv.ts";

/** Props for a filter chip's pressed state and selected accent.
 * Use when: typing Chip. Avoid when: typing a set of filters; use ChipGroupProps.
 */
export interface ChipProps extends Omit<BaseToggle.Props, "className"> {
  accent?: "brand" | "sun" | "leaf" | "coral" | "tide";
  className?: string;
}

const accents = {
  brand: "data-pressed:press-brand-tint",
  sun: "data-pressed:press-sun",
  leaf: "data-pressed:press-leaf",
  coral: "data-pressed:press-coral",
  tide: "data-pressed:press-tide",
};

/** A tactile pill filter with a check mark when selected.
 * Use when: toggling a filter such as Remote or Paid. Avoid when: an on/off setting applies immediately; use Switch.
 */
export function Chip({ accent = "brand", children, className, ...props }: ChipProps) {
  return (
    <BaseToggle
      {...props}
      data-slot="chip"
      className={cn(
        "group/chip press press-secondary [--press-radius:var(--kumiko-radius-pill)] inline-flex min-h-control-sm min-w-0 max-w-full items-center gap-1.5 px-4 font-body text-label font-extrabold focus-visible:transition-none",
        accents[accent],
        className,
      )}
    >
      <span
        aria-hidden
        data-slot="chip-check"
        className="invisible inline-grid size-4 shrink-0 place-items-center group-data-pressed/chip:visible"
      >
        <CheckIcon className="size-4" />
      </span>
      <span className="min-w-0 wrap-break-word">{children}</span>
    </BaseToggle>
  );
}

/** Props for a named group of combinable filter chips.
 * Use when: typing ChipGroup's values and label. Avoid when: typing an individual filter; use ChipProps.
 */
export interface ChipGroupProps extends Omit<BaseToggleGroup.Props, "className" | "aria-label"> {
  "aria-label": string;
  className?: string;
}

/** Shares controlled or uncontrolled filter values between chips, with multiple selection by default.
 * Use when: related filters can combine. Avoid when: selecting a panel to display; use Tabs.
 */
export function ChipGroup({ multiple = true, className, ...props }: ChipGroupProps) {
  return (
    <BaseToggleGroup
      {...props}
      data-slot="chip-group"
      multiple={multiple}
      className={cn("flex min-w-0 flex-wrap gap-2", className)}
    />
  );
}
