"use client";

import { Form as BaseForm } from "@base-ui/react/form";
import { cn } from "../lib/tv.ts";

/** Props for form submission, validation timing and server errors.
 * Use when: typing Form. Avoid when: typing one control; use FieldProps or InputProps.
 */
export interface FormProps extends Omit<BaseForm.Props, "className"> {
  className?: string;
}

/** Validates its Fields and submits their named values, with support for server errors.
 * Use when: submitting related values together. Avoid when: laying out controls without submission; use Fieldset.
 */
export function Form({ className, ...props }: FormProps) {
  return <BaseForm {...props} data-slot="form" className={cn("grid min-w-0 gap-6", className)} />;
}
