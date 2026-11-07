"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { useId } from "react";
import { CheckIcon, MinusIcon } from "../icons.tsx";
import { cn } from "../lib/tv.ts";
import { ChoiceLabel } from "./choice-label.tsx";
import { choiceBoxStyles, choiceLabelStyles } from "./choice-styles.ts";

/** Props for a checked, unchecked or indeterminate choice and its optional label.
 * Use when: typing Checkbox. Avoid when: typing several choices' shared value; use CheckboxGroupProps.
 */
export interface CheckboxProps extends Omit<BaseCheckbox.Root.Props, "className"> {
  className?: string;
}

/** A compact checkbox with a check or minus mark and an optional wrapping label.
 * Use when: selecting any number of independent options. Avoid when: one option excludes the others; use RadioGroup.
 */
export function Checkbox({ children, className, id: idProp, render, ...props }: CheckboxProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const control = (
    <BaseCheckbox.Root
      {...props}
      id={id}
      data-slot="checkbox"
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
        "rounded-choice data-checked:not-data-disabled:bg-brand data-checked:not-data-disabled:border-brand-text data-indeterminate:not-data-disabled:bg-brand data-indeterminate:not-data-disabled:border-brand-text",
        "hover:not-data-disabled:data-checked:border-ink-muted hover:not-data-disabled:data-indeterminate:border-ink-muted",
        "forced-colors:not-data-disabled:data-checked:forced-color-adjust-none forced-colors:not-data-disabled:data-checked:bg-forced-fill forced-colors:not-data-disabled:data-checked:border-forced-fill",
        "forced-colors:not-data-disabled:data-indeterminate:forced-color-adjust-none forced-colors:not-data-disabled:data-indeterminate:bg-forced-fill forced-colors:not-data-disabled:data-indeterminate:border-forced-fill",
        "forced-colors:hover:not-data-disabled:data-checked:border-forced-fg forced-colors:hover:not-data-disabled:data-indeterminate:border-forced-fg",
        className,
      )}
    >
      <BaseCheckbox.Indicator
        aria-hidden
        className="inline-grid place-items-center text-brand-fg data-disabled:text-disabled-text forced-colors:not-data-disabled:text-forced-fg"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? <MinusIcon className="size-4.5" /> : <CheckIcon className="size-4.5" />}
          </span>
        )}
      />
    </BaseCheckbox.Root>
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
