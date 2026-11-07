import { tv, type VariantProps } from "../lib/tv.ts";

// No "use client": server components call this to style links as buttons.

/**
 * The class recipe behind Button, exported so a link can look like a button:
 * `<a href="/jobs" className={buttonStyles({ variant: "primary" })}>Browse jobs</a>`.
 * Use when: sharing Button's appearance with a link. Avoid when: adding button semantics to a link.
 */
export const buttonStyles = tv({
  base: [
    "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-control border font-medium transition-[background-color,border-color,color,box-shadow,translate]",
    "motion-reduce:transition-[background-color,border-color,color,box-shadow]",
    "duration-hover ease-enter focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-focus active:not-data-disabled:translate-y-px",
    "data-disabled:cursor-not-allowed data-disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  variants: {
    variant: {
      primary: "border-transparent bg-brand text-brand-fg hover:not-data-disabled:bg-brand/88",
      secondary: "border-line bg-surface text-ink hover:not-data-disabled:bg-field",
      outline: "border-control-line bg-transparent text-ink hover:not-data-disabled:bg-ink/6",
      ghost: "border-transparent bg-transparent text-ink hover:not-data-disabled:bg-ink/6",
      danger: "border-transparent bg-danger text-danger-fg hover:not-data-disabled:bg-danger/88",
      link: "border-transparent bg-transparent text-brand-text underline decoration-1 underline-offset-4 hover:not-data-disabled:decoration-2",
    },
    size: {
      sm: "h-control-sm px-2.5 text-body-sm",
      md: "h-control px-3.5 text-body",
      lg: "h-control-lg px-5 text-title-sm",
    },
    iconOnly: { true: "px-0" },
  },
  compoundVariants: [
    { variant: "link", class: "h-auto px-0" },
    { iconOnly: true, size: "sm", class: "w-control-sm" },
    { iconOnly: true, size: "md", class: "w-control" },
    { iconOnly: true, size: "lg", class: "w-control-lg" },
  ],
  defaultVariants: { variant: "secondary", size: "md", iconOnly: false },
});

/** Button recipe variant props.
 * Use when: sharing Button's appearance. Avoid when: typing Button's events or native props.
 */
export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
