/** Plural forms selected by Intl.PluralRules, with a required fallback.
 * Use when: a label depends on a count. Avoid when: the same text works for every count.
 */
export type Plural = { one: string; other: string; zero?: string; two?: string; few?: string; many?: string };

/** Plain text or plural data for a translated label.
 * Use when: defining or overriding Kumiko's labels. Avoid when: storing translation functions.
 */
export type Label = string | Plural;

const en = { close: "Close", loading: "Loading", decrement: "Decrease", increment: "Increase" } satisfies Record<
  string,
  Label
>;

/** Kumiko's built-in English, Arabic and Urdu labels, with matching keys in every language.
 * Use when: choosing defaults for a locale. Avoid when: formatting plural forms or numbers; use formatLabel.
 */
export const labels = {
  en,
  ar: { close: "إغلاق", loading: "جارٍ التحميل", decrement: "إنقاص", increment: "زيادة" },
  ur: { close: "بند کریں", loading: "لوڈ ہو رہا ہے", decrement: "کم کریں", increment: "بڑھائیں" },
} satisfies Record<"en" | "ar" | "ur", Record<keyof typeof en, Label>>;

/** A key present in every built-in label set.
 * Use when: typing individual label overrides. Avoid when: choosing a locale.
 */
export type LabelKey = keyof typeof labels.en;

/** Resolves plural forms and formats every {count} with Intl in the same locale.
 * Use when: displaying labels with local plural forms and digits. Avoid when: formatting dates or currency.
 */
export function formatLabel(label: Label, locale: string, count?: number): string {
  const text =
    typeof label === "string"
      ? label
      : (label[count === undefined ? "other" : new Intl.PluralRules(locale).select(count)] ?? label.other);
  return count === undefined ? text : text.replaceAll("{count}", new Intl.NumberFormat(locale).format(count));
}
