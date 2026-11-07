/** Plural forms selected by Intl.PluralRules, with a required fallback.
 * Use when: a label depends on a count. Avoid when: the same text works for every count.
 */
export type Plural = { one: string; other: string; zero?: string; two?: string; few?: string; many?: string };

/** Plain text or plural data for a translated label.
 * Use when: defining or overriding Kumiko's labels. Avoid when: storing translation functions.
 */
export type Label = string | Plural;

/** English fallback labels, available without retaining the other language catalogs.
 * Use when: initializing the provider's defaults. Avoid when: localizing a component; read the provider's labels.
 */
export const englishLabels = {
  close: "Close",
  loading: "Loading",
  decrement: "Decrease",
  increment: "Increase",
  clear: "Clear",
  noMatches: "No matches",
  moreCount: { one: "{count} more", other: "{count} more" },
  chooseFile: "Choose file",
  chooseFiles: "Choose files",
  dropFile: "Drag a file here",
  dropFiles: "Drag files here",
  dropNow: "Drop to add",
  remove: "Remove",
  fileRemoved: "File removed",
  fileTypeRejected: "This file type isn't accepted",
  fileSizeRejected: "This file is too large",
  filesAdded: { one: "{count} file added", other: "{count} files added" },
  fileCountRejected: { one: "You can add only {count} file", other: "You can add up to {count} files" },
} satisfies Record<string, Label>;

/** Kumiko's built-in English, Arabic and Urdu labels, with matching keys in every language.
 * Use when: choosing defaults for a locale. Avoid when: formatting plural forms or numbers; use formatLabel.
 */
export const labels = {
  en: englishLabels,
  ar: {
    close: "إغلاق",
    loading: "جارٍ التحميل",
    decrement: "إنقاص",
    increment: "زيادة",
    clear: "مسح",
    noMatches: "لا توجد نتائج",
    moreCount: {
      one: "واحد آخر",
      two: "اثنان آخران",
      few: "{count} آخرون",
      many: "{count} آخرون",
      other: "{count} آخرون",
    },
    chooseFile: "اختر ملفًا",
    chooseFiles: "اختر ملفات",
    dropFile: "اسحب ملفًا إلى هنا",
    dropFiles: "اسحب الملفات إلى هنا",
    dropNow: "أفلِت للإضافة",
    remove: "إزالة",
    fileRemoved: "تمت إزالة الملف",
    fileTypeRejected: "نوع هذا الملف غير مقبول",
    fileSizeRejected: "هذا الملف كبير جدًا",
    filesAdded: {
      one: "تمت إضافة ملف واحد",
      two: "تمت إضافة ملفين",
      few: "تمت إضافة {count} ملفات",
      many: "تمت إضافة {count} ملفًا",
      other: "تمت إضافة {count} ملف",
    },
    fileCountRejected: {
      one: "يمكنك إضافة ملف واحد فقط",
      two: "يمكنك إضافة ملفين فقط",
      few: "يمكنك إضافة {count} ملفات كحد أقصى",
      many: "يمكنك إضافة {count} ملفًا كحد أقصى",
      other: "يمكنك إضافة {count} ملف كحد أقصى",
    },
  },
  ur: {
    close: "بند کریں",
    loading: "لوڈ ہو رہا ہے",
    decrement: "کم کریں",
    increment: "بڑھائیں",
    clear: "صاف کریں",
    noMatches: "کوئی نتیجہ نہیں",
    moreCount: { one: "{count} اور", other: "{count} اور" },
    chooseFile: "فائل منتخب کریں",
    chooseFiles: "فائلیں منتخب کریں",
    dropFile: "فائل یہاں گھسیٹیں",
    dropFiles: "فائلیں یہاں گھسیٹیں",
    dropNow: "شامل کرنے کے لیے چھوڑیں",
    remove: "ہٹائیں",
    fileRemoved: "فائل ہٹا دی گئی",
    fileTypeRejected: "اس قسم کی فائل قبول نہیں کی جاتی",
    fileSizeRejected: "یہ فائل بہت بڑی ہے",
    filesAdded: { one: "{count} فائل شامل کی گئی", other: "{count} فائلیں شامل کی گئیں" },
    fileCountRejected: {
      one: "آپ صرف {count} فائل شامل کر سکتے ہیں",
      other: "آپ زیادہ سے زیادہ {count} فائلیں شامل کر سکتے ہیں",
    },
  },
} satisfies Record<"en" | "ar" | "ur", Record<keyof typeof englishLabels, Label>>;

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
