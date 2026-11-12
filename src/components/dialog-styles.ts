import { buttonStyles } from "./button-styles.ts";

/** Shared header, corner close, scrolling body and footer recipes for dialogs and drawers.
 * Use when: styling the parts of a task overlay. Avoid when: positioning or animating its outer surface.
 */
export const dialogStyles = {
  title: "min-w-0 shrink-0 pe-12 font-display text-title font-extrabold",
  description: "min-w-0 shrink-0 pe-12 text-body text-ink-muted",
  body: "dialog-body min-h-0 min-w-0 -mx-3 p-3",
  footer: "dialog-footer flex shrink-0 flex-wrap justify-end gap-3",
  cornerClose: buttonStyles({ tone: "ghost", size: "sm", iconOnly: true, className: "dialog-corner-close" }),
};
