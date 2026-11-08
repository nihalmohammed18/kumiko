"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { useId } from "react";
import { cn } from "../lib/tv.ts";
import { ChoiceLabel } from "./choice-label.tsx";
import { choiceFocusStyles, choiceLabelStyles } from "./choice-styles.ts";

/** Props for an immediate on/off setting and its optional label.
 * Use when: typing Switch. Avoid when: typing a choice submitted with a form; use CheckboxProps.
 */
export interface SwitchProps extends Omit<BaseSwitch.Root.Props, "className"> {
  className?: string;
}

/** An on/off track with a tactile thumb and an optional label before it.
 * Use when: a setting takes effect immediately. Avoid when: confirming terms or selecting form options; use Checkbox.
 */
export function Switch({ children, className, id: idProp, render, ...props }: SwitchProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const control = (
    <BaseSwitch.Root
      {...props}
      id={id}
      data-slot="switch"
      render={
        props.nativeButton && children != null
          ? (controlProps, state) => (
              <ChoiceLabel controlProps={controlProps} render={render} state={state} textFirst>
                {children}
              </ChoiceLabel>
            )
          : render
      }
      className={cn(
        "group/switch inline-flex h-10 w-16 shrink-0 items-start rounded-pill border-2 border-control-line bg-field p-1 cursor-pointer",
        "data-checked:not-data-disabled:bg-brand data-checked:not-data-disabled:border-brand-text hover:not-data-disabled:border-ink-muted hover:not-data-disabled:data-checked:border-ink-muted active:not-data-disabled:border-ink active:not-data-disabled:data-checked:border-ink",
        "motion-safe:transition-[border-color,background-color] motion-safe:duration-hover motion-safe:ease-enter focus-visible:transition-none",
        choiceFocusStyles,
        "data-invalid:not-data-disabled:border-danger hover:not-data-disabled:data-invalid:border-danger-text active:not-data-disabled:data-invalid:border-ink",
        "data-disabled:bg-disabled-fill data-disabled:border-disabled-line data-disabled:cursor-not-allowed forced-colors:data-disabled:border-forced-disabled",
        "forced-colors:not-data-disabled:data-checked:forced-color-adjust-none forced-colors:not-data-disabled:data-checked:bg-forced-fill forced-colors:not-data-disabled:data-checked:border-forced-fill forced-colors:hover:not-data-disabled:data-checked:border-forced-fg forced-colors:active:not-data-disabled:data-checked:border-forced-ink",
        className,
      )}
    >
      <BaseSwitch.Thumb
        aria-hidden
        data-slot="switch-thumb"
        className={cn(
          "press press-secondary h-6 w-7 shrink-0 [--press-radius:var(--kumiko-radius-pill)]",
          "data-checked:translate-x-6 rtl:data-checked:-translate-x-6 group-active/switch:not-data-disabled:translate-y-(--kumiko-edge-h) group-active/switch:not-data-disabled:shadow-none",
          "transition-none motion-safe:transition-[translate,box-shadow] motion-safe:duration-press-out motion-safe:ease-enter group-active/switch:not-data-disabled:motion-safe:duration-press-in group-focus-visible/switch:transition-none",
          "forced-colors:[--press-fill:var(--kumiko-forced-surface)] forced-colors:[--press-text:var(--kumiko-forced-ink)] forced-colors:[--press-line:var(--kumiko-forced-ink)] forced-colors:shadow-none forced-colors:data-disabled:border-forced-disabled",
        )}
      />
    </BaseSwitch.Root>
  );
  return children == null || props.nativeButton ? (
    control
  ) : (
    <label htmlFor={id} className={choiceLabelStyles}>
      <span className="min-w-0 wrap-break-word">{children}</span>
      {control}
    </label>
  );
}
