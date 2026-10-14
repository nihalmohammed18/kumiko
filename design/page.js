const DIRECTIONS = __DIRECTIONS__;
const BRANDS = __BRANDS__;
const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
const rtl = () => root.dir === "rtl";

const AR = {
  typeSample: "عينة الخط",
  headline: "اعثر على من سيبنون ما هو قادم.",
  bodyCopy:
    "كوميكو هي مجموعة الأدوات المشتركة لـ First Jobby ووفاقة وكل منتج قادم: المكوّنات نفسها سهلة الوصول، بهوية كل منتج.",
  appScreen: "شاشة التطبيق",
  appNote: "المحتوى نفسه في كل اتجاه، لتقارن بينها بإنصاف.",
  overview: "نظرة عامة",
  jobs: "الوظائف",
  applicants: "المتقدمون",
  messages: "الرسائل",
  reports: "التقارير",
  settings: "الإعدادات",
  plan: "الخطة",
  teamPlan: "خطة الفريق · 4 من 5 مقاعد",
  productDesigner: "مصمم منتجات",
  headSub: "مصمم منتجات · لشبونة أو عن بُعد داخل أوروبا",
  export: "تصدير",
  newJob: "وظيفة جديدة",
  totalApplicants: "إجمالي المتقدمين",
  vsLast: "مقارنة بالشهر الماضي",
  interviews: "المقابلات",
  offers: "العروض",
  daysToHire: "أيام التوظيف",
  fasterDays: "أيام أسرع",
  perWeek: "الطلبات أسبوعيًا",
  rate: "معدل المقابلات",
  sources: "مصادر المتقدمين",
  searchApplicants: "ابحث عن متقدمين",
  allStatuses: "كل الحالات",
  columns: "الأعمدة",
  selected3: "تم تحديد 3",
  archive: "أرشفة",
  delete: "حذف",
  selectAll: "تحديد الكل",
  name: "الاسم",
  stage: "المرحلة",
  applied: "تاريخ التقديم",
  score: "التقييم",
  actions: "الإجراءات",
  showing: "عرض 1–8 من 1,284",
  previous: "السابق",
  next: "التالي",
  createJob: "إنشاء وظيفة",
  createJobSub: "تظهر الوظائف المنشورة في صفحة الوظائف وفي تنبيهات الوظائف.",
  jobTitle: "المسمى الوظيفي",
  titlePh: "مصمم منتجات أول",
  titleErr: "أدخل المسمى الوظيفي",
  department: "القسم",
  design: "التصميم",
  openings: "الشواغر",
  locations: "المواقع",
  lisbon: "لشبونة",
  remoteEu: "عن بُعد · أوروبا",
  addCity: "أضف مدينة",
  employmentType: "نوع التوظيف",
  fullTime: "دوام كامل",
  partTime: "دوام جزئي",
  internship: "تدريب",
  salaryRange: "نطاق الراتب",
  startDate: "تاريخ البدء",
  remoteFriendly: "يمكن العمل عن بُعد",
  description: "الوصف",
  descText: "ستشكّل الطريقة التي يجد بها آلاف الأشخاص وظيفتهم الأولى، من صفحة البحث حتى لحظة التقديم.",
  descHint: "يظهر أعلى صفحة الوظيفة. اكتفِ بجملتين أو ثلاث.",
  attachments: "المرفقات",
  dropFiles: "أفلت الملفات هنا",
  or: "أو",
  browse: "تصفّح",
  fileHint: "PDF أو DOCX، حتى 10 ميغابايت لكل ملف",
  confirmOpen: "أؤكد أن هذه الوظيفة متاحة ومعتمدة",
  cancel: "إلغاء",
  saveDraft: "حفظ كمسودة",
  publishJob: "نشر الوظيفة",
  onPhones: "على الهاتف، يتحول هذا الجدول إلى بطاقات",
  deleteQ: "حذف 3 متقدمين؟",
  deleteD: "ستُحذف طلباتهم وملاحظاتهم. لا يمكن التراجع عن ذلك.",
  archived3: "تمت أرشفة 3 متقدمين",
  archivedSub: "لن يظهروا في هذه القائمة.",
  undo: "تراجع",
  components: "المكوّنات",
  componentsNote: "كل مكوّنات الإصدار الأول بجميع حالاتها.",
  buttons: "الأزرار",
  sDefault: "افتراضي",
  sHover: "تمرير",
  sFocus: "تركيز",
  sPressed: "مضغوط",
  sDisabled: "معطّل",
  sLoading: "تحميل",
  small: "صغير",
  medium: "متوسط",
  large: "كبير",
  day: "يوم",
  week: "أسبوع",
  month: "شهر",
  inputs: "حقول الإدخال",
  textField: "حقل نصي",
  moreStates: "حالات أخرى",
  withHint: "مع تلميح",
  hintText: "سنرسل دعوات المقابلات إلى هنا.",
  sInvalid: "غير صالح",
  emailErr: "أدخل بريدًا مثل name@company.com",
  selectOpen: "قائمة منسدلة مفتوحة",
  interview: "مقابلة",
  new: "جديد",
  screening: "فرز",
  offer: "عرض",
  comboOpen: "مربع اختيار أثناء الكتابة",
  textareaNumber: "نص طويل ورقم",
  notes: "ملاحظات",
  notesText: "ملف أعمال قوي. اسأل عن إعادة تصميم تجربة البداية.",
  rounds: "جولات المقابلة",
  datePicker: "اختيار نطاق تاريخ",
  october: "أكتوبر 2026",
  choices: "الخيارات",
  checkboxes: "مربعات الاختيار",
  unchecked: "غير محدد",
  checked: "محدد",
  mixed: "بعضها محدد",
  radios: "أزرار الاختيار",
  everyApp: "كل طلب",
  dailyDigest: "ملخص يومي",
  weeklyDigest: "ملخص أسبوعي",
  never: "أبدًا",
  switches: "المفاتيح",
  off: "إيقاف",
  on: "تشغيل",
  sliders: "أشرطة التمرير",
  minScore: "أدنى تقييم",
  experience: "سنوات الخبرة",
  feedback: "التنبيهات",
  aInfoT: "يصل متقدمون جدد كل ساعة",
  aInfoD: "نتحقق من كل مواقع الوظائف التي ربطتها.",
  aOkT: "تم نشر الوظيفة",
  aOkD: "أصبحت متاحة في صفحة الوظائف وفي التنبيهات.",
  aWarnT: "تنتهي فترتك التجريبية خلال 3 أيام",
  aWarnD: "أضف وسيلة دفع لتبقى وظائفك منشورة.",
  aErrT: "فشل الدفع",
  aErrD: "تم رفض بطاقتك. جرّب بطاقة أخرى.",
  tSaved: "تم حفظ التغييرات",
  tFail: "تعذّر إرسال العرض",
  tFailSub: "لم يستجب خادم البريد.",
  retry: "إعادة المحاولة",
  tExport: "جارٍ تصدير 1,284 متقدمًا…",
  progressLabel: "التقدّم",
  uploading: "جارٍ رفع السير الذاتية",
  profileDone: "اكتمال الملف",
  loading: "جارٍ التحميل",
  skeleton: "هيكل التحميل",
  bannerText: "يضيف Hirebase 3.0 ملاحظات الفريق وأدلة المقابلات.",
  seeWhatsNew: "اطّلع على الجديد",
  emptyT: "لا يوجد متقدمون بعد",
  emptyD: "شارك رابط الوظيفة لتبدأ باستقبال الطلبات.",
  copyLink: "نسخ الرابط",
  overlays: "النوافذ والتنقل",
  menu: "القائمة",
  edit: "تعديل",
  duplicate: "تكرار",
  moveTo: "نقل إلى وظيفة",
  showArchived: "إظهار المؤرشف",
  tooltipPopover: "تلميح ونافذة منبثقة",
  popoverText: "تقدّمت قبل يومين عبر توصية. أرفقت ملف أعمال ومرجعين.",
  schedule: "جدولة مقابلة",
  tabsLabel: "علامات التبويب",
  profile: "الملف الشخصي",
  activity: "النشاط",
  breadcrumbs: "مسار التنقل والترقيم",
  palette: "لوحة الأوامر",
  actionsGroup: "الإجراءات",
  inviteTeammate: "دعوة زميل",
  sendInvites: "إرسال دعوات المقابلات",
  pages: "الصفحات",
  dialogLabel: "نافذة حوار",
  inviteTitle: "دعوة إلى مقابلة",
  emailLabel: "البريد الإلكتروني",
  attachKit: "إرفاق دليل المقابلة",
  sendInvite: "إرسال الدعوة",
  drawerLabel: "لوحة جانبية",
  filters: "عوامل التصفية",
  remoteOnly: "عن بُعد فقط",
  reset: "إعادة تعيين",
  apply: "تطبيق",
  dataDisplay: "عرض البيانات",
  badges: "الشارات",
  draft: "مسودة",
  active: "نشطة",
  paused: "متوقفة",
  rejected: "مرفوض",
  featured: "مميزة",
  avatars: "الصور الرمزية",
  seniorFe: "مهندس واجهات أمامية أول",
  lisbonHybrid: "لشبونة · هجين",
  cardText: "React وTypeScript وعين للتفاصيل. ثلاث جولات مقابلة، والقرار خلال أسبوعين.",
  applicantsLower: "متقدمًا",
  offerAccept: "قبول العروض",
  emails: "رسائل البريد",
  emailsNote:
    "لا تدعم برامج البريد الخطوط المخصصة أو متغيرات CSS بشكل موثوق، لذلك تستخدم مكوّنات البريد خطوط النظام ولون العلامة كقيمة ثابتة.",
  primary: "أساسي",
  secondary: "ثانوي",
  outline: "محدد",
  ghost: "شفاف",
  danger: "خطر",
  link: "رابط",
  save: "حفظ",
  directionOf: "الاتجاه {n} من {t}",
  fonts: "الخطوط",
  corners: "الزوايا",
  controls: "ارتفاع الأدوات",
  motion: "الحركة",
  canvas: "الخلفية",
  surface: "السطح",
  text: "النص",
  mutedText: "نص ثانوي",
  border: "حدود الحقول",
  brand: "العلامة",
  accent: "اللون المميز",
  success: "نجاح",
  warning: "تحذير",
  info: "معلومة",
  referrals: "توصيات",
  jobBoards: "مواقع الوظائف",
  careersPage: "صفحة الوظائف",
  social: "التواصل الاجتماعي",
  events: "فعاليات",
  weekAxis: "الأسبوع",
  barSummary: "289 هذا الأسبوع، بزيادة 13% عن الأسبوع الماضي",
  lineSummary: "31% هذا الأسبوع، ارتفاعًا من 18% في الأسبوع 35",
};
const EN = {
  primary: "Primary",
  secondary: "Secondary",
  outline: "Outline",
  ghost: "Ghost",
  danger: "Danger",
  link: "Link",
  save: "Save",
  directionOf: "Direction {n} of {t}",
  fonts: "Fonts",
  corners: "Corners",
  controls: "Control height",
  motion: "Motion",
  canvas: "Canvas",
  surface: "Surface",
  text: "Text",
  mutedText: "Muted text",
  border: "Field border",
  brand: "Brand",
  accent: "Accent",
  success: "Success",
  warning: "Warning",
  danger2: "Danger",
  info: "Info",
  referrals: "Referrals",
  jobBoards: "Job boards",
  careersPage: "Careers page",
  social: "Social",
  events: "Events",
  weekAxis: "Week",
  stage: "Stage",
  applied: "Applied",
  score: "Score",
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};
const t = (k) => (rtl() ? AR[k] : EN[k]) ?? EN[k] ?? AR[k] ?? k;

/* Static text swap */
function translate() {
  const ar = rtl();
  for (const el of $$("[data-t]")) {
    if (el.dataset.en === undefined) el.dataset.en = el.tagName === "TEXTAREA" ? el.value : el.textContent;
    const v = ar ? (AR[el.dataset.t] ?? el.dataset.en) : el.dataset.en;
    if (el.tagName === "TEXTAREA") el.value = v;
    else el.textContent = v;
  }
  for (const el of $$("[data-tp]")) {
    if (el.dataset.enp === undefined) el.dataset.enp = el.placeholder;
    el.placeholder = ar ? (AR[el.dataset.tp] ?? el.dataset.enp) : el.dataset.enp;
  }
}

/* Table and phone cards */
const ROWS = [
  { n: "Maya Okafor", ar: null, e: "maya@hirebase.io", s: "interview", d: 12, sc: 92, av: 1, sel: true },
  { n: "Daniel Reyes", ar: null, e: "daniel.reyes@mail.com", s: "screening", d: 11, sc: 84, av: 2, sel: true },
  { n: "Aiko Tanaka", ar: null, e: "aiko@tanaka.design", s: "offer", d: 9, sc: 95, av: 3 },
  { n: "Omar Haddad", ar: "عمر حداد", e: "omar.haddad@mail.com", s: "new", d: 13, sc: 78, av: 4, sel: true },
  {
    n: "Ayesha Khan",
    ur: "عائشہ خان",
    ur2: "پروڈکٹ ڈیزائنر",
    e: "ayesha.khan@mail.pk",
    s: "interview",
    d: 10,
    sc: 89,
    av: 5,
  },
  { n: "Sofia Lindqvist", ar: null, e: "sofia@lindqvist.se", s: "rejected", d: 2, sc: 61, av: 6 },
  { n: "Layla Mansour", ar: "ليلى منصور", e: "layla.mansour@mail.com", s: "screening", d: 8, sc: 80, av: 1 },
  { n: "Priya Nair", ar: null, e: "priya.nair@mail.in", s: "interview", d: 8, sc: 88, av: 2 },
];
const TONE = {
  new: "tone-info",
  screening: "",
  interview: "tone-brand",
  offer: "tone-success",
  rejected: "tone-danger",
};
const initials = (n) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
const dateLabel = (d) => (rtl() ? `${d} أكتوبر` : `Oct ${d}`);
const nameCell = (r) => {
  if (rtl() && r.ur) return `<span lang="ur">${r.ur}</span><small lang="ur">${r.ur2}</small>`;
  const n = rtl() && r.ar ? `<span lang="ar">${r.ar}</span>` : r.n;
  return `${n}<small dir="ltr">${r.e}</small>`;
};
const badge = (s) => `<span class="badge ${TONE[s]}"><span class="bd"></span>${t(s)}</span>`;
function renderRows() {
  $("#rows").innerHTML = ROWS.map(
    (r) => `<tr class="${r.sel ? "is-sel" : ""}">
      <td><span class="choice ${r.sel ? "is-checked" : ""}" role="checkbox" aria-checked="${!!r.sel}" tabindex="0" aria-label="Select ${r.n}"><span class="box">${r.sel ? '<svg class="i"><use href="#i-check"/></svg>' : ""}</span></span></td>
      <td><span class="who"><span class="avatar" style="--av:var(--series-${r.av})">${initials(r.n)}</span><span>${nameCell(r)}</span></span></td>
      <td>${badge(r.s)}</td>
      <td class="num">${dateLabel(r.d)}</td>
      <td class="num">${r.sc}</td>
      <td><button class="btn btn--ghost btn--icon btn--sm" type="button" aria-label="Actions for ${r.n}"><svg class="i"><use href="#i-more"/></svg></button></td>
    </tr>`,
  ).join("");
  $("#phone").innerHTML = ROWS.slice(0, 3)
    .map(
      (r) => `<div class="card mcard">
        <div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span class="who row" style="flex-wrap:nowrap"><span class="avatar" style="--av:var(--series-${r.av})">${initials(r.n)}</span><b>${rtl() && r.ar ? r.ar : r.n}</b></span>${badge(r.s)}</div>
        <div class="meta"><span>${t("applied")} · <span class="num">${dateLabel(r.d)}</span></span><span>${t("score")} <b class="num" style="color:var(--fg)">${r.sc}</b></span></div>
      </div>`,
    )
    .join("");
}

/* Button matrix */
function renderButtons() {
  const variants = ["primary", "secondary", "outline", "ghost", "danger", "link"];
  const states = [
    ["", ""],
    ["is-hover", ""],
    ["is-focus", ""],
    ["is-active", ""],
    ["", "disabled"],
    ["", "loading"],
  ];
  $("#btn-matrix").innerHTML = variants
    .map(
      (v) =>
        `<tr><th scope="row">${t(v)}</th>${states
          .map(
            ([cls, extra]) =>
              `<td><button class="btn btn--${v} ${cls}" type="button" ${extra === "disabled" ? "disabled" : ""} ${extra === "loading" ? 'aria-busy="true"' : ""}>${extra === "loading" ? '<span class="spin" aria-hidden="true"></span>' : ""}${t("save")}</button></td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
}

/* Calendar: October 2026 starts on a Thursday. */
function renderCalendar() {
  const dow = rtl() ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  $("#cal-dow").innerHTML = dow.map((d) => `<th scope="col">${d}</th>`).join("");
  const cells = [];
  for (let i = 0; i < 4; i++) cells.push({ d: 27 + i, out: true });
  for (let d = 1; d <= 31; d++) cells.push({ d });
  while (cells.length % 7) cells.push({ d: cells.length - 34, out: true });
  const rows = [];
  for (let i = 0; i < cells.length; i += 7)
    rows.push(
      `<tr>${cells
        .slice(i, i + 7)
        .map((c) => {
          const cls = c.out
            ? "out"
            : c.d === 6 || c.d === 10
              ? "edge"
              : c.d > 6 && c.d < 10
                ? "in"
                : c.d === 14
                  ? "today"
                  : "";
          return `<td class="${cls}"><span>${c.d}</span></td>`;
        })
        .join("")}</tr>`,
    );
  $("#cal-body").innerHTML = rows.join("");
}

/* Charts: drawn to scale from the data; mirrored in right-to-left. */
const NS = "http://www.w3.org/2000/svg";
const WEEKS = [35, 36, 37, 38, 39, 40, 41, 42];
const width = (sel) => Math.max(240, Math.round($(sel).clientWidth || 320));
function svg(w, h, label) {
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" direction="ltr" style="font-family:var(--font-sans)">`;
}
function renderBar() {
  const v = [148, 172, 160, 205, 231, 214, 256, 289],
    W = width("#chart-bar"),
    H = 200,
    padY = 10,
    padB = 26,
    axis = 34,
    max = 300;
  const plotW = W - axis - 6,
    band = plotW / v.length,
    y = (n) => padY + (H - padY - padB) * (1 - n / max);
  const x0 = (i) => (rtl() ? W - axis - (i + 1) * band : axis + i * band);
  let s = svg(W, H, "Applications per week, rising from 148 to 289");
  for (const tk of [0, 100, 200, 300]) {
    s += `<line x1="${rtl() ? 6 : axis}" x2="${rtl() ? W - axis : W - 6}" y1="${y(tk)}" y2="${y(tk)}" stroke="${css("--line")}" stroke-width="1"/>`;
    s += `<text x="${rtl() ? W - axis + 6 : axis - 6}" y="${y(tk) + 4}" text-anchor="${rtl() ? "start" : "end"}" font-size="11" fill="${css("--muted")}">${tk}</text>`;
  }
  v.forEach((n, i) => {
    const bw = band * 0.62,
      x = x0(i) + (band - bw) / 2,
      last = i === v.length - 1;
    s += `<rect x="${x}" y="${y(n)}" width="${bw}" height="${y(0) - y(n)}" rx="${Math.min(3, parseFloat(css("--r-control")) || 0)}" fill="${last ? css("--accent") : css("--series-1")}"/>`;
    s += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${css("--muted")}">${WEEKS[i]}</text>`;
    if (last)
      s += `<text x="${x + bw / 2}" y="${y(n) - 5}" text-anchor="middle" font-size="11" font-weight="600" fill="${css("--fg")}">${n}</text>`;
  });
  $("#chart-bar").innerHTML = s + "</svg>";
}
function renderLine() {
  const v = [18, 21, 19, 24, 26, 25, 29, 31],
    W = width("#chart-line"),
    H = 200,
    padY = 12,
    padB = 26,
    axis = 34,
    max = 40;
  const plotW = W - axis - 16,
    y = (n) => padY + (H - padY - padB) * (1 - n / max);
  const x = (i) => (rtl() ? W - axis - 8 - (i * plotW) / (v.length - 1) : axis + 8 + (i * plotW) / (v.length - 1));
  let s = svg(W, H, "Interview rate per week, from 18% to 31%");
  for (const tk of [0, 10, 20, 30, 40]) {
    s += `<line x1="${rtl() ? 6 : axis}" x2="${rtl() ? W - axis : W - 6}" y1="${y(tk)}" y2="${y(tk)}" stroke="${css("--line")}" stroke-width="1"/>`;
    s += `<text x="${rtl() ? W - axis + 6 : axis - 6}" y="${y(tk) + 4}" text-anchor="${rtl() ? "start" : "end"}" font-size="11" fill="${css("--muted")}">${tk}%</text>`;
  }
  const pts = v.map((n, i) => `${x(i)},${y(n)}`).join(" ");
  const c = css("--series-1");
  s += `<polygon points="${x(0)},${y(0)} ${pts} ${x(v.length - 1)},${y(0)}" fill="${c}" fill-opacity=".12"/>`;
  s += `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>`;
  v.forEach(
    (n, i) =>
      (s += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${css("--muted")}">${WEEKS[i]}</text>`),
  );
  const L = v.length - 1;
  s += `<circle cx="${x(L)}" cy="${y(v[L])}" r="5" fill="${css("--accent")}" stroke="${css("--surface")}" stroke-width="2"/>`;
  s += `<text x="${x(L)}" y="${y(v[L]) - 10}" text-anchor="middle" font-size="11" font-weight="600" fill="${css("--fg")}">${v[L]}%</text>`;
  $("#chart-line").innerHTML = s + "</svg>";
}
function renderDonut() {
  const parts = [
    ["referrals", 34],
    ["jobBoards", 28],
    ["careersPage", 21],
    ["social", 11],
    ["events", 6],
  ];
  const W = 200,
    cx = 100,
    cy = 92,
    r = 70,
    sw = 22,
    C = 2 * Math.PI * r;
  let s = svg(W, 184, "Applicant sources: referrals 34%, job boards 28%, careers page 21%, social 11%, events 6%");
  let off = 0;
  parts.forEach(([, p], i) => {
    const len = (p / 100) * C;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${css(`--series-${i + 1}`)}" stroke-width="${sw}" stroke-dasharray="${len - 2} ${C - len + 2}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})${rtl() ? ` scale(-1 1) translate(${-2 * cx} 0)` : ""}"/>`;
    off += len;
  });
  s += `<text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="22" font-weight="600" fill="${css("--fg")}" style="font-variant-numeric:tabular-nums">1,284</text>`;
  s += `<text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="11" fill="${css("--muted")}">${rtl() ? "متقدم" : "applicants"}</text>`;
  const legend = parts
    .map(
      ([k, p], i) =>
        `<span><i style="background:${css(`--series-${i + 1}`)}"></i>${t(k)} <b class="num" style="color:var(--fg)">${p}%</b></span>`,
    )
    .join("");
  $("#chart-donut").innerHTML = `<div class="stack">${s}</svg><div class="legend">${legend}</div></div>`;
}

/* Intro, swatches, controls */
function renderIntro() {
  const i = DIRECTIONS.findIndex((d) => d.id === root.dataset.direction),
    d = DIRECTIONS[i];
  $("#dcount").textContent = t("directionOf")
    .replace("{n}", i + 1)
    .replace("{t}", DIRECTIONS.length);
  $("#dname").textContent = d.name;
  $("#dmood").textContent = d.mood;
  $("#dspecs").innerHTML = [
    [t("fonts"), d.fontsLabel],
    [t("corners"), `${d.shape["r-control"]} / ${d.shape["r-card"]}`],
    [t("controls"), d.shape["h-control"]],
    [t("motion"), d.shape.dur],
  ]
    .map(([k, v]) => `<span class="spec">${k}: <b>${v}</b></span>`)
    .join("");
  const sw = [
    ["canvas", "--canvas"],
    ["surface", "--surface"],
    ["text", "--fg"],
    ["mutedText", "--muted"],
    ["border", "--line-strong"],
    ["brand", "--brand"],
    ["accent", "--accent"],
    ["success", "--success"],
    ["warning", "--warning"],
    ["danger2", "--danger"],
    ["info", "--info"],
  ];
  $("#swatches").innerHTML = sw
    .map(
      ([k, v]) =>
        `<div class="sw"><i style="background:var(${v})"></i><b>${k === "danger2" && rtl() ? AR.danger : t(k)}</b><span class="num" dir="ltr">${css(v).toUpperCase()}</span></div>`,
    )
    .join("");
  for (const b of $$("#dirs button")) b.setAttribute("aria-pressed", String(b.dataset.id === d.id));
  for (const b of $$("[data-theme-btn]")) b.setAttribute("aria-pressed", String(b.dataset.themeBtn === currentTheme()));
  for (const b of $$("[data-dir-btn]"))
    b.setAttribute("aria-pressed", String(b.dataset.dirBtn === (rtl() ? "rtl" : "ltr")));
}
const media = matchMedia("(prefers-color-scheme: dark)");
const currentTheme = () => root.dataset.theme || (media.matches ? "dark" : "light");
function renderAll() {
  translate();
  renderIntro();
  renderRows();
  renderButtons();
  renderCalendar();
  renderBar();
  renderLine();
  renderDonut();
}

$("#dirs").innerHTML = DIRECTIONS.map((d) => `<button type="button" data-id="${d.id}">${d.name}</button>`).join("");
$("#dirs").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  root.dataset.direction = b.dataset.id;
  history.replaceState(null, "", "#" + b.dataset.id);
  renderAll();
});
for (const b of $$("[data-theme-btn]"))
  b.addEventListener("click", () => {
    root.dataset.theme = b.dataset.themeBtn;
    renderAll();
  });
for (const b of $$("[data-dir-btn]"))
  b.addEventListener("click", () => {
    const r = b.dataset.dirBtn === "rtl";
    root.dir = r ? "rtl" : "ltr";
    root.lang = r ? "ar" : "en";
    renderAll();
  });
const brandSel = $("#brand");
brandSel.insertAdjacentHTML(
  "beforeend",
  Object.entries(BRANDS)
    .map(([id, b]) => `<option value="${id}">${b.label} brand</option>`)
    .join(""),
);
brandSel.addEventListener("change", () => {
  if (brandSel.value) root.dataset.brand = brandSel.value;
  else delete root.dataset.brand;
  renderAll();
});
for (const tl of $$('[role="tablist"]'))
  tl.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    for (const x of $$('[role="tab"]', tl)) {
      x.setAttribute("aria-selected", String(x === tab));
      x.tabIndex = x === tab ? 0 : -1;
    }
  });
media.addEventListener("change", () => !root.dataset.theme && renderAll());
addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (DIRECTIONS.some((d) => d.id === id)) {
    root.dataset.direction = id;
    renderAll();
  }
});
root.dir = root.dir || "ltr";
root.lang = root.lang || "en";
renderAll();
document.fonts?.ready.then(renderAll);
let lastW = 0;
new ResizeObserver(() => {
  const w = $("#chart-bar").clientWidth;
  if (Math.abs(w - lastW) > 2) {
    lastW = w;
    renderBar();
    renderLine();
  }
}).observe($(".charts"));
