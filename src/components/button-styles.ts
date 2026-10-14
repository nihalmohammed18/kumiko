import { tv, type VariantProps } from "../lib/tv.ts";

// No "use client": server components call this to style links as buttons.

/**
 * The class recipe behind Button, exported so a link can look like a button:
 * `<a href="/jobs" className={buttonStyles({ variant: "primary" })}>Browse jobs</a>`.
 */
export const buttonStyles = tv({
  base: [
    "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-control border font-medium transition-[background-color,border-color,color,box-shadow,translate]",
    "duration-fast ease-kumiko focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-focus active:not-data-disabled:translate-y-px",
    "data-disabled:cursor-not-allowed data-disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  variants: {
    variant: {
      primary: "border-transparent bg-brand text-brand-fg hover:not-data-disabled:bg-brand-hover",
      secondary: "border-line bg-surface text-fg hover:not-data-disabled:bg-surface-hover",
      outline: "border-line-strong bg-transparent text-fg hover:not-data-disabled:bg-fg/6",
      ghost: "border-transparent bg-transparent text-fg hover:not-data-disabled:bg-fg/6",
      danger: "border-transparent bg-danger text-danger-fg hover:not-data-disabled:bg-danger-hover",
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

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
