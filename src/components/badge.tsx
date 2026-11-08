import type { ComponentProps } from "react";
import { type BadgeTone, badgeStyles } from "./badge-styles.ts";

/** Native span props and a metadata badge's tone.
 * Use when: typing Badge. Avoid when: typing a metadata link's events; use native anchor props with badgeStyles.
 */
export interface BadgeProps extends ComponentProps<"span"> {
  tone?: BadgeTone;
}

/** A noninteractive metadata pill, with optional leading SVG content sized to 14px.
 * Use when: showing short metadata such as Remote, Paid or New. Avoid when: offering an action; use Button.
 *
 * @example
 * <Badge tone="success">Offer received</Badge>
 */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span {...props} data-slot="badge" className={badgeStyles({ tone, className })} />;
}
