import { tv, type VariantProps } from "../lib/tv.ts";

/** The server-safe pill recipe shared by Badge and links styled as metadata.
 * Use when: a link needs Badge's appearance. Avoid when: adding action semantics to a Badge; use Link or Button.
 */
export const badgeStyles = tv({
  base: [
    "inline-flex min-w-0 max-w-full items-center gap-1 rounded-full px-3 py-1 font-body text-label font-extrabold",
    "uppercase tracking-[0.04em] arabic:normal-case arabic:tracking-normal wrap-break-word",
    "[&_svg]:size-3.5 [&_svg]:shrink-0 forced-colors:border forced-colors:border-forced-ink",
  ],
  variants: {
    tone: {
      neutral: "bg-field text-ink-muted",
      brand: "bg-brand-tint text-brand-text",
      sun: "bg-sun-tint text-sun-text",
      leaf: "bg-leaf-tint text-leaf-text",
      coral: "bg-coral-tint text-coral-text",
      tide: "bg-tide-tint text-tide-text",
      success: "bg-success-tint text-success-text",
      warning: "bg-warning-tint text-warning-text",
      danger: "bg-danger-tint text-danger-text",
      info: "bg-info-tint text-info-text",
    },
  },
  defaultVariants: { tone: "neutral" },
});

/** Accent and status families available to a metadata badge.
 * Use when: typing Badge's tone. Avoid when: choosing a pressable's appearance; use ButtonTone.
 */
export type BadgeTone = NonNullable<VariantProps<typeof badgeStyles>["tone"]>;
