"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import { fieldStyles } from "./field-styles.ts";

/** Props for a single-line input and its control size.
 * Use when: typing Input. Avoid when: collecting several lines; use TextareaProps.
 */
export interface InputProps extends Omit<BaseInput.Props, "size" | "className"> {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** A single-line input that connects to Field's label and validation automatically.
 * Use when: entering text, email or similar values. Avoid when: entering several lines; use Textarea.
 *
 * @example
 * <Field name="email">
 *   <FieldLabel>Email</FieldLabel><Input type="email" autoComplete="email" required /><FieldError />
 * </Field>
 */
export function Input({ size, className, ...props }: InputProps) {
  return <BaseInput {...props} data-slot="input" className={fieldStyles({ size, className })} />;
}
