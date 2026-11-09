import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { EmailFrame } from "../../.storybook/email-preview.tsx";
import { emailTypeStyle } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";
import {
  defaultEmailTheme,
  Email,
  EmailButton,
  EmailCard,
  EmailChip,
  EmailCode,
  EmailDivider,
  EmailFooter,
  EmailHeading,
  EmailHero,
  EmailImage,
  EmailLink,
  EmailLogo,
  EmailSection,
  EmailText,
  emailArt,
} from "./index.ts";

const logo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA3ElEQVR4nO3ZSxJAMBCEYRdyABewdVd3cg5WrFIpY9Ldk5hUZYn/o8ojpsk4tvU4kdPaIw+GgdThLog61oVQR7oQ6jgXQh3lRqiDXAB1jBuhDkmAdcPaYO7j89n3HrxF/INgA1rG0wGt46kARDwNgIqnAJDxcAA6HgpgxMMArHgIgBlPBSDiaQBUPAWAjM8rEAGRd6FSJBORT+JaHAORb6NvopCI/CKzxCAQ/a9KKBa2WiH+u7QYZY4D6BEx1h+a3hDF+F4Q1fh7LPN+Rpyv4qMiTPGRIJ/DVSBrzwWxkmI4wUYebwAAAABJRU5ErkJggg==";

const copy = {
  ltr: {
    title: "Your Kumiko sign-in link",
    preview: "Your secure sign-in link and latest receipt.",
    welcome: "Welcome back",
    body: "Here is your secure sign-in link. It expires soon.",
    signIn: "Sign in to Kumiko",
    codeIntro: "Or enter this one-time code:",
    receipt: "Your monthly receipt",
    plan: "Kumiko Pro · one month",
    paid: "Paid: ",
    viewReceipt: "View your receipt",
    ignore: "If you didn't ask for this email, you can ignore it.",
    help: "Need help? Contact us.",
    expiry: "Expires in 15 minutes",
    chipLabels: ["Account", "Expires soon", "Paid", "New", "Remote", "Receipt"],
  },
  rtl: {
    title: "رابط تسجيل الدخول إلى كوميكو",
    preview: "رابط تسجيل الدخول الآمن وإيصالك الأخير.",
    welcome: "مرحبًا بعودتك",
    body: "إليك رابط تسجيل الدخول الآمن. تنتهي صلاحيته قريبًا.",
    signIn: "تسجيل الدخول إلى كوميكو",
    codeIntro: "أو أدخل هذا الرمز لمرة واحدة:",
    receipt: "إيصالك الشهري",
    plan: "كوميكو برو · شهر واحد",
    paid: "المبلغ المدفوع: ",
    viewReceipt: "عرض الإيصال",
    ignore: "إذا لم تطلب هذه الرسالة، يمكنك تجاهلها.",
    help: "تحتاج إلى مساعدة؟ تواصل معنا.",
    expiry: "تنتهي الصلاحية خلال ١٥ دقيقة",
    chipLabels: ["الحساب", "تنتهي قريبًا", "مدفوع", "جديد", "عن بُعد", "الإيصال"],
  },
};

function EmailPreview({ dir }: { dir: "ltr" | "rtl" }) {
  const content = copy[dir];
  const lang = dir === "rtl" ? "ar" : "en";
  const direction = { dir, lang };
  const email = (
    <Email {...direction} title={content.title} preview={content.preview}>
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" {...direction}>
        <tbody>
          <tr>
            <td align="center" style={{ paddingBottom: 24 }}>
              <EmailTable
                {...direction}
                width="40"
                align="center"
                style={{ width: 40, marginInlineStart: "auto", marginInlineEnd: "auto" }}
              >
                <EmailLogo {...direction} src={logo} width={40} height={40} alt={dir === "rtl" ? "كوميكو" : "Kumiko"} />
              </EmailTable>
              <p
                style={{
                  margin: "8px 0 0",
                  ...emailTypeStyle("header"),
                  color: defaultEmailTheme.ink,
                }}
              >
                {dir === "rtl" ? "كوميكو" : "Kumiko"}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <EmailCard
        {...direction}
        hero={
          <EmailHero
            {...direction}
            tone="coral"
            heading={content.welcome}
            subline={content.body}
            art={{
              ...emailArt("pip-waving", "/email-art"),
              alt: dir === "rtl" ? "بيب يلوّح مرحبًا" : "Pip waving hello",
            }}
          />
        }
      >
        <EmailSection {...direction}>
          <EmailButton {...direction} href="https://example.com/sign-in" align="center">
            {content.signIn}
          </EmailButton>
        </EmailSection>
        <EmailSection {...direction}>
          <EmailDivider {...direction} label={content.codeIntro} />
          <EmailCode {...direction} note={content.expiry}>
            {dir === "rtl" ? "٤٨٢٠١٩" : "482019"}
          </EmailCode>
        </EmailSection>
        <EmailDivider {...direction} />
        <EmailSection {...direction}>
          <EmailImage
            {...emailArt("sealed-envelope", "/email-art")}
            {...direction}
            width={80}
            height={80}
            alt={dir === "rtl" ? "ظرف مختوم بنجمة" : "An envelope sealed with a star"}
          />
          <EmailHeading {...direction} level={2}>
            {content.receipt}
          </EmailHeading>
          <EmailText {...direction}>{content.plan}</EmailText>
          <EmailText {...direction} muted>
            {content.paid}
            {new Intl.NumberFormat(lang, { style: "currency", currency: "USD" }).format(12)}
          </EmailText>
          <EmailButton {...direction} href="https://example.com/receipt" variant="secondary" fullWidth>
            {content.viewReceipt}
          </EmailButton>
        </EmailSection>
        <EmailSection {...direction}>
          {(["brand", "sun", "leaf", "coral", "tide", "neutral"] as const).map((tone, index) => (
            <span key={tone} style={{ display: "inline-block", marginInlineEnd: 6, marginBlockEnd: 6 }}>
              <EmailChip {...direction} tone={tone}>
                {content.chipLabels[index]}
              </EmailChip>
            </span>
          ))}
          <EmailText {...direction} muted>
            <EmailLink {...direction} href="https://example.com/help">
              {content.help}
            </EmailLink>
          </EmailText>
        </EmailSection>
      </EmailCard>
      <EmailFooter
        {...direction}
        reason={content.ignore}
        links={[{ label: content.help, href: "https://example.com/help" }]}
      />
    </Email>
  );
  return <EmailFrame title={content.title} email={email} height={1400} />;
}

const meta = {
  title: "Email/Building blocks",
  component: EmailPreview,
  args: { dir: "ltr" },
  play: async ({ args, canvas }) => {
    const frame = canvas.getByTitle(copy[args.dir].title) as HTMLIFrameElement;
    await waitFor(() => {
      const document = frame.contentDocument;
      expect(frame.dataset.emailReady).toBe("true");
      expect(document?.readyState).toBe("complete");
      expect(document?.documentElement.dir).toBe(args.dir);
      expect(document?.querySelector('[data-slot="email-card"]')).toBeTruthy();
      expect(document!.documentElement.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
      expect(document!.body.scrollHeight).toBeLessThanOrEqual(frame.clientHeight);
    });
  },
} satisfies Meta<typeof EmailPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Kit: Story = {};
export const RightToLeft: Story = { name: "Right to left", args: { dir: "rtl" } };
