import { type ComponentProps, cloneElement, type ReactElement } from "react";
import { cn } from "../lib/tv.ts";

/** Props for a text navigation link.
 * Use when: typing Link or its framework link. Avoid when: typing a primary call to action; use LinkButtonProps.
 */
export interface LinkProps extends Omit<ComponentProps<"a">, "className"> {
  className?: string;
  /** Render through a framework link instead of <a>, e.g. render={<NextLink href="/jobs" />}. */
  render?: ReactElement<Record<string, unknown>>;
}

/** An underlined navigation link for running text and standalone links.
 * Use when: linking within a sentence or offering a text link such as "View all".
 * Avoid when: presenting a primary call to action; use LinkButton.
 */
export function Link({ className, render, children, ...props }: LinkProps) {
  const classes = cn(
    "cursor-pointer text-brand-text underline decoration-2 underline-offset-4 rounded-sm",
    "hover:decoration-[3px] active:bg-brand-tint focus-visible:outline-(length:--kumiko-ring-width)",
    "focus-visible:outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid",
    className,
  );
  const anchorProps = { ...props, ...render?.props };
  if (anchorProps.target === "_blank" && anchorProps.rel === undefined) anchorProps.rel = "noopener noreferrer";
  if (render) {
    return cloneElement(render, {
      ...anchorProps,
      "data-slot": "link",
      className: cn(render.props.className as string | undefined, classes),
      children,
    });
  }
  return (
    <a {...anchorProps} data-slot="link" className={classes}>
      {children}
    </a>
  );
}
