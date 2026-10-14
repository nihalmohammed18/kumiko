import { cnMerge, createTV, type VariantProps } from "tailwind-variants";
import { themeNames } from "../tokens.ts";

const twMergeConfig = { extend: { theme: themeNames } };

/**
 * tailwind-variants, taught Kumiko's theme names so a `className` passed to a component overrides its defaults
 * correctly: `text-fg` is a colour and `text-body` a size, so one never cancels the other.
 */
export const tv = createTV({ twMergeConfig });

/** Joins class names and resolves conflicts the same way components do. */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  cnMerge(...classes)({ twMergeConfig }) ?? "";

export type { VariantProps };
