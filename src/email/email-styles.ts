import { text } from "../tokens.ts";

/** Converts token type sizes to pixels at the email kit's 16px root.
 * Use when: styling email text without rem support. Avoid when: sizing browser UI text.
 */
export function emailTypeStyle(role: keyof typeof text) {
  const pixels = (value: string) => `${Number.parseFloat(value) * (value.endsWith("rem") ? 16 : 1)}px`;
  return { fontSize: pixels(text[role][0]), lineHeight: pixels(text[role][1]) };
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
