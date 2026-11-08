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
 *
 * @example
 * <Form onFormSubmit={(values) => toast.success("Job alerts enabled for " + String(values.email))}>
 *   <Field name="name"><FieldLabel>Name</FieldLabel><Input autoComplete="name" required /><FieldError /></Field>
 *   <Field name="email"><FieldLabel>Email</FieldLabel><Input type="email" autoComplete="email" required /><FieldError /></Field>
 *   <Field name="password">
 *     <FieldLabel>Password</FieldLabel><Input type="password" autoComplete="new-password" minLength={12} required />
 *     <FieldDescription>Use at least 12 characters.</FieldDescription><FieldError />
 *   </Field>
 *   <Button tone="primary" type="submit">Create job seeker account</Button>
 * </Form>
 */
export function Form({ className, ...props }: FormProps) {
  return <BaseForm {...props} data-slot="form" className={cn("grid min-w-0 gap-6", className)} />;
}
