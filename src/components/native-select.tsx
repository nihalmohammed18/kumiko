"use client";

import { Field as BaseField } from "@base-ui/react/field";
import type { ComponentProps } from "react";
import { ChevronDownIcon } from "../icons.tsx";
import { cn } from "../lib/tv.ts";
import { fieldStyles } from "./field-styles.ts";

/** Native single-select props, with Field's value callback and Kumiko's size.
 * Use when: typing NativeSelect. Avoid when: collecting multiple selections or showing a listbox.
 */
export interface NativeSelectProps extends Omit<ComponentProps<"select">, "size" | "multiple"> {
  size?: "sm" | "md" | "lg";
  onValueChange?: BaseField.Control.Props["onValueChange"];
}

/** A native single-choice select connected to Field's label and validation.
 * Use when: choosing from a short list with the platform's picker. Avoid when: needing a searchable or custom popup.
 */
export function NativeSelect({
  size,
  className,
  id,
  name,
  disabled,
  autoFocus,
  value,
  defaultValue,
  onValueChange,
  ...props
}: NativeSelectProps) {
  return (
    <div className="relative min-w-0 text-ink-muted has-[:disabled]:text-disabled-text">
      <BaseField.Control
        {...{ id, name, disabled, autoFocus, value, defaultValue, onValueChange }}
        data-slot="native-select"
        render={<select {...props} data-slot="native-select" />}
        className={fieldStyles({
          size,
          pressable: true,
          className: cn(
            "appearance-none pe-11 cursor-pointer disabled:bg-disabled-fill disabled:text-disabled-text disabled:border-disabled-line disabled:cursor-not-allowed",
            className,
          ),
        })}
      />
      <ChevronDownIcon className="pointer-events-none absolute inset-y-0 end-4 my-auto size-5" />
    </div>
  );
}
