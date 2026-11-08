"use client";

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { cn } from "../lib/tv.ts";

/** Props for a group's selected checkbox values.
 * Use when: typing CheckboxGroup. Avoid when: typing a single choice; use CheckboxProps.
 */
export interface CheckboxGroupProps extends Omit<BaseCheckboxGroup.Props, "className"> {
  className?: string;
}

/** Shares a controlled or uncontrolled set of values between checkboxes.
 * Use when: selecting several related options. Avoid when: selecting exactly one option; use RadioGroup.
 *
 * @example
 * <Field name="workplaces">
 *   <FieldLabel>Preferred workplaces</FieldLabel>
 *   <CheckboxGroup defaultValue={["remote"]}>
 *     <Checkbox value="remote">Remote</Checkbox>
 *     <Checkbox value="hybrid">Hybrid</Checkbox>
 *   </CheckboxGroup>
 *   <FieldError />
 * </Field>
 */
export function CheckboxGroup({ className, ...props }: CheckboxGroupProps) {
  return <BaseCheckboxGroup {...props} data-slot="checkbox-group" className={cn("grid min-w-0 gap-3", className)} />;
}
