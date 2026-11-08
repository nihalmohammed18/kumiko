"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { useId } from "react";
import { cn } from "../lib/tv.ts";
import { ChoiceLabel } from "./choice-label.tsx";
import { choiceBoxStyles, choiceLabelStyles } from "./choice-styles.ts";

/** Props for one radio option's value and optional label.
 * Use when: typing Radio. Avoid when: typing the group's selected value; use RadioGroupProps.
 */
export interface RadioProps<Value = string> extends Omit<BaseRadio.Root.Props<Value>, "className"> {
  className?: string;
}

/** A compact radio option with a dot mark and an optional wrapping label.
 * Use when: choosing one value in a RadioGroup. Avoid when: options can be selected together; use Checkbox.
 *
 * @example
 * <Field name="employment">
 *   <Fieldset>
 *     <FieldsetLegend id="employment-legend">Employment type</FieldsetLegend>
 *     <RadioGroup aria-labelledby="employment-legend" defaultValue="full-time">
 *       <Radio value="full-time">Full time</Radio>
 *       <Radio value="contract">Contract</Radio>
 *     </RadioGroup>
 *   </Fieldset>
 *   <FieldError />
 * </Field>
 */
export function Radio<Value = string>({ children, className, id: idProp, render, ...props }: RadioProps<Value>) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const control = (
    <BaseRadio.Root
      {...props}
      id={id}
      data-slot="radio"
      render={
        props.nativeButton && children != null
          ? (controlProps, state) => (
              <ChoiceLabel controlProps={controlProps} render={render} state={state}>
                {children}
              </ChoiceLabel>
            )
          : render
      }
      className={cn(
        choiceBoxStyles,
        "rounded-pill data-checked:not-data-disabled:border-brand-text hover:not-data-disabled:data-checked:border-ink-muted",
        "forced-colors:not-data-disabled:data-checked:forced-color-adjust-none forced-colors:not-data-disabled:data-checked:bg-forced-fill forced-colors:not-data-disabled:data-checked:border-forced-fill forced-colors:hover:not-data-disabled:data-checked:border-forced-fg",
        className,
      )}
    >
      <BaseRadio.Indicator
        aria-hidden
        className="size-3 rounded-pill bg-brand-text data-disabled:bg-disabled-text forced-colors:not-data-disabled:bg-forced-fg forced-colors:data-disabled:bg-forced-disabled"
      />
    </BaseRadio.Root>
  );
  return children == null || props.nativeButton ? (
    control
  ) : (
    <label htmlFor={id} className={choiceLabelStyles}>
      {control}
      <span className="min-w-0 wrap-break-word">{children}</span>
    </label>
  );
}
