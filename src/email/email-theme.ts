import type { ComponentProps, JSX } from "react";
import { emailColors } from "../tokens.ts";

/** Plain colour roles for an email.
 * Use when: branding email parts. Avoid when: supplying CSS variables or web component themes.
 */
export interface EmailTheme {
  brand: string;
  "brand-fg": string;
  "brand-tint": string;
  "brand-text": string;
  edge: string;
  "edge-neutral": string;
  ink: string;
  "ink-muted": string;
  canvas: string;
  surface: string;
  line: string;
  field: string;
  "sun-tint": string;
  "sun-text": string;
  "leaf-tint": string;
  "leaf-text": string;
  "coral-tint": string;
  "coral-text": string;
  "tide-tint": string;
  "tide-text": string;
}

/** Kumiko's light email palette, with the darker brand text token as the press edge.
 * Use when: extending the default email colours. Avoid when: expecting automatic email client dark mode.
 */
export const defaultEmailTheme: Readonly<EmailTheme> = {
  ...emailColors,
  edge: emailColors["brand-text"],
};

/** The five default accent families used by email art panels and avatars.
 * Use when: selecting a stable email accent. Avoid when: treating these names as literal colours.
 */
export const emailTones = ["brand", "sun", "leaf", "coral", "tide"] as const;

/** An email accent family.
 * Use when: typing hero and chip tones. Avoid when: specifying a custom colour; use EmailTheme.
 */
export type EmailTone = (typeof emailTones)[number];

/** Resolves a tint and readable text pair from an explicit email theme.
 * Use when: styling chips, heroes or company initials. Avoid when: choosing a primary button's solid fill.
 */
export function emailTintStyle(colors: EmailTheme, tone: EmailTone | "neutral") {
  return {
    backgroundColor: tone === "neutral" ? colors.field : colors[`${tone}-tint`],
    color: tone === "neutral" ? colors["ink-muted"] : colors[`${tone}-text`],
  };
}

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
