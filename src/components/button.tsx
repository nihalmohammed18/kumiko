"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { useEffect, useId, useRef } from "react";
import { formatLabel } from "../labels.ts";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { buttonStyles } from "./button-styles.ts";
import { Spinner } from "./spinner.tsx";

/** Props for Button's tone, size and loading state.
 * Use when: typing an action button. Avoid when: typing a navigation link; use LinkButtonProps.
 */
export interface ButtonProps extends Omit<BaseButton.Props, "className"> {
  tone?: "primary" | "secondary" | "strong" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Shows a spinner, keeps the button focusable and its width, and announces the loading label once. */
  loading?: boolean;
  className?: string;
}

function useLoadingAnnouncement(loading: boolean) {
  const { announce, labels, locale } = useKumiko();
  const wasLoading = useRef(false);
  useEffect(() => {
    // Provider cleanup cancels frames during effect replay; announce after that replay finishes.
    if (loading && !wasLoading.current) queueMicrotask(() => announce(formatLabel(labels.loading, locale)));
    wasLoading.current = loading;
  }, [loading, announce, labels.loading, locale]);
}

/**
 * Runs an action: saving, submitting a form, opening a dialog.
 *
 * Use when: something happens on this page. Pick one `primary` button per view; use `danger` only for
 * destructive actions, and `type="submit"` inside forms.
 * Avoid when: navigating; use LinkButton or Link.
 */
export function Button({
  tone = "secondary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const labelId = useId();
  useLoadingAnnouncement(loading);
  return (
    <BaseButton
      {...props}
      data-slot="button"
      data-tone={tone}
      data-size={size}
      data-loading={loading ? "" : undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={loading || props.focusableWhenDisabled}
      aria-busy={loading || undefined}
      aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] === undefined ? labelId : undefined)}
      className={buttonStyles({ tone, size, className })}
    >
      <span className="grid min-w-0">
        <span
          data-slot="button-label"
          id={labelId}
          className={cn(
            "col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-2",
            loading && "invisible",
          )}
        >
          {children}
        </span>
        {loading && <Spinner className="col-start-1 row-start-1 place-self-center" />}
      </span>
    </BaseButton>
  );
}

/** Props for an icon-only action button, including its required accessible name.
 * Use when: typing IconButton. Avoid when: the action needs a visible label; use ButtonProps.
 */
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
  tone = "ghost",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: IconButtonProps) {
  useLoadingAnnouncement(loading);
  return (
    <BaseButton
      {...props}
      data-slot="icon-button"
      data-tone={tone}
      data-size={size}
      data-loading={loading ? "" : undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={loading || props.focusableWhenDisabled}
      aria-busy={loading || undefined}
      className={buttonStyles({ tone, size, iconOnly: true, className })}
    >
      {loading ? <Spinner /> : children}
    </BaseButton>
  );
}
