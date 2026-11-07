import { tv, type VariantProps } from "../lib/tv.ts";

/** The shared appearance of text fields and native selects, with 16px text at every size.
 * Use when: styling a form control. Avoid when: styling a pressable; use buttonStyles.
 */
export const fieldStyles = tv({
  base: [
    "w-full min-w-0 rounded-control border-2 border-control-line bg-field px-4 font-body text-body text-ink placeholder:text-ink-muted cursor-text",
    "transition-[border-color,background-color] duration-hover ease-enter motion-reduce:transition-none",
    "hover:not-data-disabled:not-disabled:[&:not([readonly])]:border-ink-muted",
    "focus-visible:outline-solid focus-visible:outline-(length:--kumiko-ring-width) focus-visible:outline-offset-2 focus-visible:outline-focus",
    "data-invalid:not-data-disabled:border-danger",
    "data-disabled:bg-disabled-fill data-disabled:text-disabled-text data-disabled:border-disabled-line data-disabled:cursor-not-allowed data-disabled:placeholder:text-disabled-text",
    // :read-only also matches selects; the readonly attribute identifies an actual read-only text field.
    "read-only:[&[readonly]]:not-data-disabled:bg-transparent read-only:[&[readonly]]:not-data-disabled:border-line",
  ],
  variants: {
    size: {
      sm: "min-h-control-sm",
      md: "min-h-control",
      lg: "min-h-control-lg",
    },
  },
  defaultVariants: { size: "md" },
});

/** Field recipe size props.
 * Use when: sharing a form control's sizing. Avoid when: typing its native events or value.
 */
export type FieldStyleProps = VariantProps<typeof fieldStyles>;
