import { email } from "../tokens.ts";

/** Email font stacks with rounded system fallbacks when optional web fonts are unavailable.
 * Use when: styling email text. Avoid when: styling browser UI; use the theme's font utilities.
 */
export const emailFonts = {
  display: "Fredoka, 'Arial Rounded MT Bold', Nunito, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  body: "Nunito, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  plain: "Arial, Helvetica, sans-serif",
} as const;

/** Resolves email typography, converting token sizes to pixels at a 16px root.
 * Use when: styling email text with its rounded or body stack. Avoid when: styling browser UI text.
 */
export function emailTypeStyle(role: keyof typeof email.text) {
  const pixels = (value: string) => `${Number.parseFloat(value) * (value.endsWith("rem") ? 16 : 1)}px`;
  const body = role === "body" || role === "subline" || role === "chip" || role === "footer";
  return {
    fontFamily: role === "plain" ? emailFonts.plain : body ? emailFonts.body : emailFonts.display,
    fontSize: pixels(email.text[role][0]),
    lineHeight: pixels(email.text[role][1]),
    fontWeight: body || role === "plain" ? undefined : 700,
  };
}

/** Chooses a legacy email alignment, inheriting the document's direction when omitted.
 * Use when: providing an align/text-align fallback. Avoid when: positioning browser UI with physical properties.
 */
export function emailAlignment(dir?: string) {
  return dir === "rtl" ? "right" : dir === "ltr" ? "left" : undefined;
}

/** Identifies languages whose joined letters must not be spaced or uppercased.
 * Use when: rendering Arabic or Urdu email labels. Avoid when: choosing an email's reading direction.
 */
export function emailJoinedScript(lang?: string) {
  return /^(ar|ur)(-|$)/i.test(lang ?? "");
}
