"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { type ButtonStyleProps, buttonStyles } from "./button-styles.ts";
import { Spinner } from "./spinner.tsx";

type ButtonVariants = Omit<ButtonStyleProps, "iconOnly">;

export interface ButtonProps extends Omit<BaseButton.Props, "className">, ButtonVariants {
  className?: string;
  /** Shows a spinner and blocks clicks while keeping focus on the button. */
  loading?: boolean;
}

/**
 * Runs an action: saving, submitting a form, opening a dialog.
 *
 * Use when: something happens on this page. Pick one `primary` button per view; the rest are `secondary` or
 * `ghost`. Use `danger` only for destructive actions, and `type="submit"` inside forms.
 * Avoid when: it takes the user somewhere else. Use a link styled with `buttonStyles` instead.
 */
export function Button({ variant, size, loading = false, disabled, className, children, ...props }: ButtonProps) {
  return (
    <BaseButton
      data-slot="button"
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </BaseButton>
  );
}

export interface IconButtonProps extends ButtonProps {
  /** Required: an icon alone tells screen reader users nothing. */
  "aria-label": string;
}

/**
 * A square button that shows only an icon.
 *
 * Use when: the icon is universally understood (close, more, copy) and space is tight.
 * Avoid when: the action needs words to be clear; use Button with an icon and a label.
 */
export function IconButton({
  variant = "ghost",
  size,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <BaseButton
      data-slot="icon-button"
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, iconOnly: true, className })}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </BaseButton>
  );
}
