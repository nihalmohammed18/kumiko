"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { type ReactNode, useEffect, useId, useRef } from "react";
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
  /** Shows beside the spinner while loading; reserves its width at rest and announces strings once. */
  loadingLabel?: ReactNode;
  className?: string;
}

function useLoadingAnnouncement(loading: boolean, loadingLabel?: ReactNode) {
  const { announce, labels, locale } = useKumiko();
  const message = typeof loadingLabel === "string" ? loadingLabel : formatLabel(labels.loading, locale);
  const wasLoading = useRef(false);
  useEffect(() => {
    // Provider cleanup cancels frames during effect replay; announce after that replay finishes.
    if (loading && !wasLoading.current) queueMicrotask(() => announce(message));
    wasLoading.current = loading;
  }, [loading, announce, message]);
}

/**
 * Runs an action: saving, submitting a form, opening a dialog.
 *
 * Use when: something happens on this page. Pick one `primary` button per view; use `danger` only for
 * destructive actions, and `type="submit"` inside forms.
 * For a disabled reason, show text linked with aria-describedby and use focusableWhenDisabled; Tooltip's Disabled reason story shows this pattern.
 * Avoid when: navigating; use LinkButton or Link.
 *
 * @example
 * <Button tone="primary" type="submit">Submit application</Button>
 */
export function Button({
  tone = "secondary",
  size = "md",
  loading = false,
  loadingLabel,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const labelId = useId();
  useLoadingAnnouncement(loading, loadingLabel);
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
          id={loading && loadingLabel != null ? undefined : labelId}
          aria-hidden={loading && loadingLabel != null ? true : undefined}
          className={cn(
            "col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-2",
            loading && "invisible",
          )}
        >
          {children}
        </span>
        {loadingLabel != null ? (
          <span
            data-slot="button-loading-label"
            id={loading ? labelId : undefined}
            aria-hidden={!loading}
            className={cn(
              "col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-2",
              !loading && "invisible",
            )}
          >
            <Spinner />
            {loadingLabel}
          </span>
        ) : loading ? (
          <Spinner className="col-start-1 row-start-1 place-self-center" />
        ) : null}
      </span>
    </BaseButton>
  );
}

/** Props for an icon-only action button, including its required accessible name.
 * Use when: typing IconButton. Avoid when: the action needs a visible label; use ButtonProps.
 */
export interface IconButtonProps extends Omit<ButtonProps, "loadingLabel"> {
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
