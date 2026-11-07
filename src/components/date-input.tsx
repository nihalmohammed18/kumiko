"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import { fieldStyles } from "./field-styles.ts";
import type { InputProps } from "./input.tsx";

/** Input props for a native date control, with the date type guaranteed.
 * Use when: typing DateInput. Avoid when: collecting free-form date text; use InputProps.
 */
export type DateInputProps = Omit<InputProps, "type">;

/** A native date input using the platform's date picker and Field validation.
 * Use when: collecting one calendar date. Avoid when: needing a custom calendar or a date range.
 */
export function DateInput({ size, className, ...props }: DateInputProps) {
  return <BaseInput {...props} data-slot="date-input" type="date" className={fieldStyles({ size, className })} />;
}
