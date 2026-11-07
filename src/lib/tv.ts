import { cnMerge, createTV, type VariantProps } from "tailwind-variants";
import { durations, layers, themeNames } from "../tokens.ts";

const twMergeConfig = {
  extend: {
    theme: themeNames,
    classGroups: {
      duration: [{ duration: Object.keys(durations) }],
      z: [{ z: Object.keys(layers) }],
      press: ["press"],
      "press-tone": [
        {
          press: [
            "primary",
            "secondary",
            "strong",
            "danger",
            "ghost",
            "selected",
            "brand-tint",
            "sun",
            "leaf",
            "coral",
            "tide",
          ],
        },
      ],
    },
  },
};

/**
 * tailwind-variants, taught Kumiko's theme names so a `className` passed to a component overrides its defaults
 * correctly: `text-ink` is a colour and `text-body` a size, so one never cancels the other.
 * Use when: defining component variants. Avoid when: joining classes without variants; use cn.
 */
export const tv = createTV({ twMergeConfig });

/** Joins class names and resolves conflicts the same way components do.
 * Use when: combining consumer classes with defaults. Avoid when: defining variants; use tv.
 */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  cnMerge(...classes)({ twMergeConfig }) ?? "";

/** Extracts a recipe's variant props.
 * Use when: typing component variants. Avoid when: typing ordinary DOM props.
 */
export type { VariantProps };
