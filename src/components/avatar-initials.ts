/** Takes the first grapheme of the first two name words and uppercases them in the provider's locale.
 * Use when: deriving an avatar's initials. Avoid when: generating its accessible name; use the full name.
 */
export function avatarInitials(name: string, locale: string): string {
  const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => segmenter.segment(word).containing(0)?.segment ?? "")
    .join("")
    .toLocaleUpperCase(locale);
}
