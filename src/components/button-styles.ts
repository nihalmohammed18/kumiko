import { tv, type VariantProps } from "../lib/tv.ts";

// No "use client": server components call this to style links as buttons.

/**
 * The class recipe behind Button, exported so a link can look like a button:
 * `<a href="/jobs" className={buttonStyles({ tone: "primary" })}>Browse jobs</a>`.
 * Use when: sharing Button's appearance with a link. Avoid when: adding button semantics to a link.
 */
export const buttonStyles = tv({
  base: [
    "press inline-flex shrink-0 select-none items-center justify-center gap-2 font-body font-extrabold",
    "uppercase tracking-[0.06em] arabic:normal-case arabic:tracking-normal text-balance",
    "[&_svg]:size-(--icon-size) [&_svg]:shrink-0",
  ],
  variants: {
    tone: {
      primary: "press-primary",
      secondary: "press-secondary",
      strong: "press-strong",
      danger: "press-danger",
      ghost: "press-ghost",
    },
    size: {
      sm: "min-h-control-sm px-4 py-1.5 text-label [--icon-size:1rem]",
      md: "min-h-control px-5 py-2 text-button [--icon-size:1.125rem]",
      lg: "min-h-control-lg px-6 py-2.5 text-body [--icon-size:1.25rem]",
    },
    iconOnly: { true: "p-0" },
  },
  compoundVariants: [
    { iconOnly: true, size: "sm", class: "size-control-sm" },
    { iconOnly: true, size: "md", class: "size-control" },
    { iconOnly: true, size: "lg", class: "size-control-lg" },
  ],
  defaultVariants: { tone: "secondary", size: "md", iconOnly: false },
});

/** Button recipe variant props.
 * Use when: sharing Button's appearance. Avoid when: typing Button's events or native props.
 */
export type ButtonStyleProps = VariantProps<typeof buttonStyles>;

/** The shared tones for Button and LinkButton.
 * Use when: typing a button's tone. Avoid when: typing its native props; use ButtonProps or LinkButtonProps.
 */
export type ButtonTone = NonNullable<ButtonStyleProps["tone"]>;
