type Language = "en" | "ar" | "ur";
type Copy<T> = Record<Language, T>;

function languageFor(locale: unknown): Language {
  const language = typeof locale === "string" ? locale.split("-")[0] : "en";
  return language === "ar" || language === "ur" ? language : "en";
}

/** Resolves Storybook's independent language and direction controls.
 * Use when: configuring the preview or its play assertions. Avoid when: configuring a product's provider.
 */
export function storySettings(globals: { locale?: unknown; dir?: unknown }) {
  const language = languageFor(globals.locale);
  const dir = globals.dir === "ltr" || globals.dir === "rtl" ? globals.dir : language === "en" ? "ltr" : "rtl";
  return { language, locale: language === "ar" ? "ar-u-nu-arab" : language, dir };
}

/** Selects translated story text by language, including a provider's BCP 47 locale.
 * Use when: rendering showcase copy or querying it in play tests. Avoid when: translating component labels.
 */
export function pickStoryCopy<T>(copy: Copy<T>, locale: unknown): T {
  return copy[languageFor(locale)];
}

interface EmptyStateCopy {
  title: string;
  description: string;
  action: string;
}

/** English, Arabic and Urdu copy for the multilingual showcase stories.
 * Use when: previewing real translated content. Avoid when: adding strings to the shipped component library.
 */
export const storyCopy = {
  formSignUp: {
    en: {
      title: "Create your account",
      name: "Name",
      email: "Email",
      country: "Country",
      chooseCountry: "Choose a country",
      india: "India",
      uk: "United Kingdom",
      us: "United States",
      nameRequired: "Enter your name.",
      emailRequired: "Enter your email.",
      emailInvalid: "Enter a valid email address.",
      countryRequired: "Choose a country.",
      submit: "Sign up",
    },
    ar: {
      title: "أنشئ حسابك",
      name: "الاسم",
      email: "البريد الإلكتروني",
      country: "البلد",
      chooseCountry: "اختر بلدًا",
      india: "الهند",
      uk: "المملكة المتحدة",
      us: "الولايات المتحدة",
      nameRequired: "أدخل اسمك.",
      emailRequired: "أدخل بريدك الإلكتروني.",
      emailInvalid: "أدخل بريدًا إلكترونيًا صحيحًا.",
      countryRequired: "اختر بلدًا.",
      submit: "إنشاء حساب",
    },
    ur: {
      title: "اپنا اکاؤنٹ بنائیں",
      name: "نام",
      email: "ای میل",
      country: "ملک",
      chooseCountry: "ملک منتخب کریں",
      india: "بھارت",
      uk: "برطانیہ",
      us: "امریکہ",
      nameRequired: "اپنا نام درج کریں۔",
      emailRequired: "اپنی ای میل درج کریں۔",
      emailInvalid: "درست ای میل درج کریں۔",
      countryRequired: "ملک منتخب کریں۔",
      submit: "اکاؤنٹ بنائیں",
    },
  } satisfies Copy<{
    title: string;
    name: string;
    email: string;
    country: string;
    chooseCountry: string;
    india: string;
    uk: string;
    us: string;
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    countryRequired: string;
    submit: string;
  }>,
  emptyStateFirstRun: {
    en: {
      title: "No applications yet",
      description: "Find a role you love and send your first application.",
      action: "Browse jobs",
    },
    ar: {
      title: "لم تتقدم لأي وظيفة بعد",
      description: "ابحث عن وظيفة تحبها وأرسل أول طلب توظيف.",
      action: "تصفح الوظائف",
    },
    ur: {
      title: "ابھی کوئی درخواست نہیں",
      description: "اپنی پسند کی ملازمت تلاش کریں اور پہلی درخواست بھیجیں۔",
      action: "ملازمتیں دیکھیں",
    },
  } satisfies Copy<EmptyStateCopy>,
  emptyStateNoResults: {
    en: {
      title: "No jobs match these filters",
      description: "Try widening your search to find more opportunities.",
      action: "Clear filters",
    },
    ar: {
      title: "لا توجد وظائف تطابق هذه الفلاتر",
      description: "وسّع بحثك للعثور على فرص أكثر.",
      action: "إزالة الفلاتر",
    },
    ur: {
      title: "ان فلٹرز کے مطابق کوئی ملازمت نہیں",
      description: "مزید مواقع کے لیے اپنی تلاش کا دائرہ بڑھائیں۔",
      action: "فلٹر صاف کریں",
    },
  } satisfies Copy<EmptyStateCopy>,
  emptyStateFailure: {
    en: {
      title: "We couldn't load your applications",
      description: "Your applications are safe. Try loading them again.",
      action: "Try again",
    },
    ar: {
      title: "تعذّر تحميل طلباتك",
      description: "طلباتك محفوظة. حاول تحميلها مرة أخرى.",
      action: "حاول مجددًا",
    },
    ur: {
      title: "آپ کی درخواستیں لوڈ نہیں ہو سکیں",
      description: "آپ کی درخواستیں محفوظ ہیں۔ دوبارہ کوشش کریں۔",
      action: "دوبارہ کوشش کریں",
    },
  } satisfies Copy<EmptyStateCopy>,
  streakStates: {
    en: { zero: "Not started", pending: "Today pending", done: "Today done", goal: "Working toward a goal" },
    ar: { zero: "لم يبدأ بعد", pending: "لم تكتمل مهمة اليوم", done: "مهمة اليوم مكتملة", goal: "في الطريق إلى الهدف" },
    ur: {
      zero: "ابھی شروع نہیں ہوا",
      pending: "آج کا کام باقی ہے",
      done: "آج کا کام مکمل",
      goal: "ہدف کی طرف پیش رفت",
    },
  } satisfies Copy<{ zero: string; pending: string; done: string; goal: string }>,
  celebrationHop: {
    en: {
      title: "Application sent!",
      description: "You're one step closer.",
      applications: "Applications",
      profile: "Profile",
      weeklyGoal: "Weekly goal",
      replay: "Replay",
      slowMotion: "Slow motion",
    },
    ar: {
      title: "تم إرسال طلبك!",
      description: "اقتربت من فرصتك لدى {company}.",
      applications: "طلبات التوظيف",
      profile: "الملف الشخصي",
      weeklyGoal: "الهدف الأسبوعي",
      replay: "إعادة العرض",
      slowMotion: "حركة بطيئة",
    },
    ur: {
      title: "درخواست بھیج دی گئی!",
      description: "آپ {company} میں ملازمت کے ایک قدم اور قریب ہیں۔",
      applications: "درخواستیں",
      profile: "پروفائل",
      weeklyGoal: "ہفتہ وار ہدف",
      replay: "دوبارہ چلائیں",
      slowMotion: "آہستہ حرکت",
    },
  } satisfies Copy<{
    title: string;
    description: string;
    applications: string;
    profile: string;
    weeklyGoal: string;
    replay: string;
    slowMotion: string;
  }>,
};
