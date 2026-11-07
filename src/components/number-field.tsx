"use client";

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import type { ReactElement } from "react";
import { MinusIcon, PlusIcon } from "../icons.tsx";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { buttonStyles } from "./button-styles.ts";
import { fieldStyles } from "./field-styles.ts";

/** Props for a numeric input with steppers, formatting and Field validation.
 * Use when: typing NumberField. Avoid when: adjusting an approximate range; use SliderProps.
 */
export interface NumberFieldProps extends Omit<BaseNumberField.Root.Props, "children" | "className"> {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Native input props, including its accessible name, placeholder and visible input ref. */
  inputProps?: Omit<BaseNumberField.Input.Props, "className"> & { className?: string };
}

// Base UI keeps steppers focusable at bounds; Kumiko uses native disabled buttons, including in read-only fields.
const renderStepper: Exclude<BaseNumberField.Increment.Props["render"], ReactElement | undefined> = (props, state) => (
  <button
    {...props}
    disabled={state.disabled || state.readOnly}
    data-disabled={state.disabled || state.readOnly ? "" : undefined}
  />
);

/** A locale-aware numeric input with ghost decrement and increment presses inside its field boundary.
 * Use when: entering an exact quantity with bounds or steps. Avoid when: free-form text or a range is needed.
 */
export function NumberField({
  size,
  className,
  locale,
  inputProps,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: NumberFieldProps) {
  const { locale: providerLocale, labels } = useKumiko();
  const stepperStyles = buttonStyles({ tone: "ghost", size, iconOnly: true });
  return (
    <BaseNumberField.Root
      {...props}
      locale={locale ?? providerLocale}
      data-slot="number-field"
      className={cn("relative min-w-0", className)}
    >
      <BaseNumberField.Group
        data-slot="number-field-group"
        className={fieldStyles({
          size,
          className: cn(
            "flex items-stretch gap-1 p-1",
            "has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-(length:--kumiko-ring-width) has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
            "data-readonly:not-data-disabled:bg-transparent data-readonly:not-data-disabled:border-line",
          ),
        })}
      >
        <BaseNumberField.Decrement
          data-slot="number-field-decrement"
          aria-label={formatLabel(labels.decrement, providerLocale)}
          render={renderStepper}
          className={stepperStyles}
        >
          <MinusIcon />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          {...(ariaLabel !== undefined && { "aria-label": ariaLabel })}
          {...(ariaLabelledBy !== undefined && { "aria-labelledby": ariaLabelledBy })}
          {...(ariaDescribedBy !== undefined && { "aria-describedby": ariaDescribedBy })}
          {...inputProps}
          data-slot="number-field-input"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-center tabular-nums cursor-text data-disabled:cursor-not-allowed focus-visible:outline-solid focus-visible:outline-0",
            inputProps?.className,
          )}
        />
        <BaseNumberField.Increment
          data-slot="number-field-increment"
          aria-label={formatLabel(labels.increment, providerLocale)}
          render={renderStepper}
          className={stepperStyles}
        >
          <PlusIcon />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
