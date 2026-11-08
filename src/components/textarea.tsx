"use client";

import { Field as BaseField } from "@base-ui/react/field";
import type { ComponentProps } from "react";
import { cn } from "../lib/tv.ts";
import { fieldStyles } from "./field-styles.ts";

/** Native textarea props, with Field's value callback and Kumiko's control size.
 * Use when: typing Textarea. Avoid when: collecting a single line; use InputProps.
 */
export interface TextareaProps extends ComponentProps<"textarea"> {
  size?: "sm" | "md" | "lg";
  onValueChange?: BaseField.Control.Props["onValueChange"];
}

/** A resizable multiline control connected to Field's label and validation.
 * Use when: entering a message or description. Avoid when: collecting a single line; use Input.
 *
 * @example
 * <Field name="coverLetter">
 *   <FieldLabel>Cover letter</FieldLabel><Textarea rows={5} required /><FieldError />
 * </Field>
 */
export function Textarea({
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
}: TextareaProps) {
  return (
    <BaseField.Control
      {...{ id, name, disabled, autoFocus, value, defaultValue, onValueChange }}
      data-slot="textarea"
      render={<textarea {...props} data-slot="textarea" />}
      className={fieldStyles({ size, className: cn("min-h-24 py-3 resize-y", className) })}
    />
  );
}
