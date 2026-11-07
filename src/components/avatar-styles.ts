import { tv } from "../lib/tv.ts";

/** Shared dimensions and fallback accents for avatars and their group's overflow count.
 * Use when: styling Avatar's image or count shell. Avoid when: styling an interactive profile link; add Link separately.
 */
export const avatarStyles = tv({
  base: "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-bold",
  variants: {
    size: {
      sm: "size-8 text-label",
      md: "size-10 text-body",
      lg: "size-14 text-title",
    },
    accent: {
      brand: "bg-brand-tint text-brand-text",
      sun: "bg-sun-tint text-sun-text",
      leaf: "bg-leaf-tint text-leaf-text",
      coral: "bg-coral-tint text-coral-text",
      tide: "bg-tide-tint text-tide-text",
    },
  },
  defaultVariants: { size: "md", accent: "brand" },
});
