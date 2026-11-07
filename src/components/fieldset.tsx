"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { cn } from "../lib/tv.ts";

/** Props for a group of related fields.
 * Use when: typing Fieldset. Avoid when: typing submission behavior; use FormProps.
 */
export interface FieldsetProps extends Omit<BaseFieldset.Root.Props, "className"> {
  className?: string;
}

/** Groups related fields under one accessible legend.
 * Use when: a form has a named section. Avoid when: grouping one control and its helper text; use Field.
 */
export function Fieldset({ className, ...props }: FieldsetProps) {
  return (
    <BaseFieldset.Root {...props} data-slot="fieldset" className={cn("grid grid-cols-1 min-w-0 gap-4", className)} />
  );
}

/** Props for a fieldset's accessible legend.
 * Use when: typing FieldsetLegend. Avoid when: labeling one control; use FieldLabelProps.
 */
export interface FieldsetLegendProps extends Omit<BaseFieldset.Legend.Props, "className"> {
  className?: string;
}

/** Gives a group of related fields its accessible name.
 * Use when: naming a Fieldset. Avoid when: labeling one control; use FieldLabel.
 */
export function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return (
    <BaseFieldset.Legend
      {...props}
      data-slot="fieldset-legend"
      className={cn("min-w-0 wrap-break-word font-display text-title-sm font-bold text-ink", className)}
    />
  );
}
