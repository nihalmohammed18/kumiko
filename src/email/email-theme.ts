import type { ComponentProps, JSX } from "react";
import { emailColors } from "../tokens.ts";

/** Plain colour roles for an email.
 * Use when: branding email parts. Avoid when: supplying CSS variables or web component themes.
 */
export interface EmailTheme {
  brand: string;
  "brand-fg": string;
  edge: string;
  ink: string;
  "ink-muted": string;
  canvas: string;
  surface: string;
  line: string;
  field: string;
}

/** Kumiko's light email palette, with the darker brand text token as the press edge.
 * Use when: extending the default email colours. Avoid when: expecting automatic email client dark mode.
 */
export const defaultEmailTheme: Readonly<EmailTheme> = {
  brand: emailColors.brand,
  "brand-fg": emailColors["brand-fg"],
  edge: emailColors["brand-text"],
  ink: emailColors.ink,
  "ink-muted": emailColors["ink-muted"],
  canvas: emailColors.canvas,
  surface: emailColors.surface,
  line: emailColors.line,
  field: emailColors.field,
};

/** Native email part props with an explicit colour theme and guaranteed inline styling.
 * Use when: defining an email part's props. Avoid when: relying on a parent Email to propagate its theme.
 */
export type EmailPartProps<Tag extends keyof JSX.IntrinsicElements> = Omit<
  ComponentProps<Tag>,
  "className" | "style"
> & {
  /** Pass the same overrides to Email and each coloured part; no React context or client hooks are used. */
  theme?: Partial<EmailTheme>;
};

/** Resolves a part's explicit theme against Kumiko's light palette.
 * Use when: rendering inline email colours. Avoid when: resolving CSS custom properties.
 */
export function resolveEmailTheme(theme?: Partial<EmailTheme>): EmailTheme {
  return { ...defaultEmailTheme, ...theme };
}
