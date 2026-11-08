import { type ComponentProps, cloneElement, type ReactElement } from "react";
import { cn } from "../lib/tv.ts";
import { type ButtonTone, buttonStyles } from "./button-styles.ts";

/** Props for a navigation link with Button's appearance.
 * Use when: typing LinkButton or its framework link. Avoid when: an action can be unavailable; use ButtonProps.
 */
export interface LinkButtonProps extends Omit<ComponentProps<"a">, "className"> {
  tone?: ButtonTone;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Render through a framework link instead of <a>, e.g. render={<NextLink href="/jobs" />}. */
  render?: ReactElement<Record<string, unknown>>;
}

/** A real navigation link with Button's tactile appearance.
 * Use when: navigating should look like a button, such as "Browse jobs".
 * Avoid when: running an action or it can be unavailable; use Button.
 *
 * @example
 * <LinkButton href="/jobs" tone="primary">Browse jobs</LinkButton>
 */
export function LinkButton({
  tone = "secondary",
  size = "md",
  className,
  render,
  children,
  ...props
}: LinkButtonProps) {
  const classes = buttonStyles({ tone, size, className });
  const label = (
    <span data-slot="button-label" className="inline-flex min-w-0 items-center justify-center gap-2">
      {children}
    </span>
  );
  if (render) {
    return cloneElement(render, {
      ...props,
      ...render.props,
      "data-slot": "link-button",
      className: cn(render.props.className as string | undefined, classes),
      children: label,
    });
  }
  return (
    <a {...props} data-slot="link-button" className={classes}>
      {label}
    </a>
  );
}
