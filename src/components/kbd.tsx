import type { ComponentProps } from "react";
import { cn } from "../lib/tv.ts";

/** Native keycap props.
 * Use when: typing Kbd. Avoid when: defining keyboard behavior; bind that on the associated control.
 */
export type KbdProps = ComponentProps<"kbd">;

/** A static keycap with a small neutral edge.
 * Use when: showing shortcut keys such as Ctrl, K or Enter. Avoid when: rendering an actionable control; use Button.
 *
 * @example
 * <p>Press <Kbd>Enter</Kbd> to search jobs.</p>
 */
export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      {...props}
      data-slot="kbd"
      className={cn(
        "inline-flex min-w-6 h-6 items-center justify-center rounded-choice border-2 border-control-line bg-surface px-1.5 font-body text-label font-bold text-ink",
        "[box-shadow:0_calc(var(--kumiko-edge-h)/2)_0_var(--kumiko-edge-neutral)]",
        className,
      )}
    />
  );
}
