"use client";

import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { cn } from "../lib/tv.ts";

/** Props for a group's selected radio value.
 * Use when: typing RadioGroup. Avoid when: typing a set of independent selections; use CheckboxGroupProps.
 */
export interface RadioGroupProps<Value = string> extends Omit<BaseRadioGroup.Props<Value>, "className"> {
  className?: string;
}

/** Shares one controlled or uncontrolled value between keyboard-navigable radio options.
 * Use when: choosing exactly one related option. Avoid when: several options may apply; use CheckboxGroup.
 *
 * @example
 * <Field name="workplace">
 *   <Fieldset>
 *     <FieldsetLegend id="workplace-legend">Preferred workplace</FieldsetLegend>
 *     <RadioGroup aria-labelledby="workplace-legend" defaultValue="remote">
 *       <Radio value="remote">Remote</Radio>
 *       <Radio value="office">Office</Radio>
 *     </RadioGroup>
 *   </Fieldset>
 *   <FieldError />
 * </Field>
 */
export function RadioGroup<Value = string>({ className, ...props }: RadioGroupProps<Value>) {
  return <BaseRadioGroup {...props} data-slot="radio-group" className={cn("grid min-w-0 gap-3", className)} />;
}
