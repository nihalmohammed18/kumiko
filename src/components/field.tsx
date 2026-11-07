"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { cn } from "../lib/tv.ts";

/** Props for a labeled, validated form field.
 * Use when: typing Field. Avoid when: grouping several fields; use FieldsetProps.
 */
export interface FieldProps extends Omit<BaseField.Root.Props, "className"> {
  className?: string;
}

/** Groups a control with its label, description and validation errors.
 * Use when: collecting one value. Avoid when: grouping several fields; use Fieldset.
 */
export function Field({ className, ...props }: FieldProps) {
  return (
    <BaseField.Root
      {...props}
      data-slot="field"
      className={cn(
        "grid grid-cols-1 min-w-0 gap-1.5 [&:has(select)_[data-slot=field-label]:not([data-disabled])]:cursor-pointer",
        "[&:has([data-slot=select-trigger]:not([data-disabled]))_[data-slot=field-label]:not([data-disabled])]:cursor-pointer",
        "[&:has([data-slot=select-trigger][data-disabled])_[data-slot=field-label]]:cursor-not-allowed",
        "[&:has([data-slot=number-field][data-disabled])_[data-slot=field-label]]:cursor-not-allowed",
        className,
      )}
    />
  );
}

/** Props for a field's accessible label.
 * Use when: typing FieldLabel. Avoid when: labeling a group; use FieldsetLegendProps.
 */
export interface FieldLabelProps extends Omit<BaseField.Label.Props, "className"> {
  className?: string;
}

/** Labels the control in its Field and reflects the Field's disabled state.
 * Use when: giving a control a visible name. Avoid when: adding helper text; use FieldDescription.
 */
export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <BaseField.Label
      {...props}
      data-slot="field-label"
      className={cn(
        "min-w-0 wrap-break-word text-label font-bold text-ink data-disabled:cursor-not-allowed data-disabled:text-disabled-text",
        className,
      )}
    />
  );
}

/** Props for a field's helper text.
 * Use when: typing FieldDescription. Avoid when: typing validation errors; use FieldErrorProps.
 */
export interface FieldDescriptionProps extends Omit<BaseField.Description.Props, "className"> {
  className?: string;
}

/** Adds helper text to the control's accessible description.
 * Use when: explaining a value or constraint. Avoid when: reporting validation failures; use FieldError.
 */
export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <BaseField.Description
      {...props}
      data-slot="field-description"
      className={cn("min-w-0 wrap-break-word text-body-sm text-ink-muted", className)}
    />
  );
}

/** Props for a field's validation message and validity match.
 * Use when: typing FieldError. Avoid when: typing persistent helper text; use FieldDescriptionProps.
 */
export interface FieldErrorProps extends Omit<BaseField.Error.Props, "className"> {
  className?: string;
}

/** Shows a native, custom or server validation error beneath the control.
 * Use when: explaining an invalid value. Avoid when: giving general guidance; use FieldDescription.
 */
export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <BaseField.Error
      {...props}
      data-slot="field-error"
      className={cn("min-w-0 wrap-break-word text-body-sm font-semibold text-danger-text", className)}
    />
  );
}
