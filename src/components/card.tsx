import { mergeProps } from "@base-ui/react/merge-props";
import { type ComponentProps, cloneElement, type ReactElement } from "react";
import { cn } from "../lib/tv.ts";

/** Native props for a card surface.
 * Use when: typing Card. Avoid when: typing its title or navigation; use the corresponding part's props.
 */
export interface CardProps extends ComponentProps<"div"> {}

/** A container for a job, company or settings group, with a tactile edge when it contains CardLink.
 * Use when: grouping related content on a surface. Avoid when: presenting a modal; use Dialog.
 *
 * @example
 * <Card>
 *   <CardTitle><CardLink href="/jobs/frontend">Frontend engineer</CardLink></CardTitle>
 *   <CardDescription>Cedar Labs · Remote</CardDescription>
 *   <Badge>Full time</Badge>
 * </Card>
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      {...props}
      data-slot="card"
      className={cn(
        "card-press @container relative grid min-w-0 gap-4 rounded-card border-2 border-line bg-surface p-6 text-ink",
        className,
      )}
    />
  );
}

/** Native heading props and the card title's heading level.
 * Use when: typing CardTitle. Avoid when: adding supporting text; use CardDescriptionProps.
 */
export interface CardTitleProps extends ComponentProps<"h3"> {
  level?: 2 | 3 | 4;
}

/** A wrapping card heading, rendered as h3 unless its level is specified.
 * Use when: naming a Card. Avoid when: writing a description; use CardDescription.
 */
export function CardTitle({ level = 3, className, ...props }: CardTitleProps) {
  const Heading = level === 2 ? "h2" : level === 4 ? "h4" : "h3";
  return (
    <Heading
      {...props}
      data-slot="card-title"
      className={cn("min-w-0 wrap-anywhere font-display text-title-sm font-bold", className)}
    />
  );
}

/** Native paragraph props for a card's supporting text.
 * Use when: typing CardDescription. Avoid when: naming the card; use CardTitleProps.
 */
export interface CardDescriptionProps extends ComponentProps<"p"> {}

/** Muted supporting text within a card.
 * Use when: explaining the card's content. Avoid when: naming its link; put CardLink in CardTitle.
 */
export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      {...props}
      data-slot="card-description"
      className={cn("min-w-0 wrap-anywhere text-body-sm text-ink-muted", className)}
    />
  );
}

/** Native navigation props and an optional framework link element.
 * Use when: typing CardLink. Avoid when: running an action; use ButtonProps.
 */
export interface CardLinkProps extends ComponentProps<"a"> {
  render?: ReactElement<Record<string, unknown>>;
}

/** Stretches a title's link over its card while keeping only the title as the accessible name.
 * Use when: a Card has one destination; place this inside CardTitle. Other controls in the card stay clickable.
 * Avoid when: a card has several equally important destinations; use ordinary Links.
 */
export function CardLink({ className, render, children, ...props }: CardLinkProps) {
  const anchorProps = mergeProps<"a">(props, render?.props);
  if (anchorProps.target === "_blank" && anchorProps.rel === undefined) anchorProps.rel = "noopener noreferrer";
  const linkProps = {
    ...anchorProps,
    "data-slot": "card-link",
    className: cn("cursor-pointer", render?.props.className as string | undefined, className),
    children,
  };
  return render ? cloneElement(render, linkProps) : <a {...linkProps} />;
}
