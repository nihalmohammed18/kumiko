import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import {
  Email,
  EmailButton,
  EmailCard,
  EmailCode,
  EmailDivider,
  EmailHeading,
  EmailLink,
  EmailLogo,
  EmailSection,
  EmailText,
  renderEmail,
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
  },
};

function EmailPreview({ dir }: { dir: "ltr" | "rtl" }) {
  const content = copy[dir];
  const lang = dir === "rtl" ? "ar" : "en";
  const direction = { dir, lang };
  const html = renderEmail(
    <Email {...direction} title={content.title} preview={content.preview}>
      <EmailSection {...direction}>
        <EmailLogo {...direction} src={logo} width={48} height={48} alt="Kumiko" />
      </EmailSection>
      <EmailSection {...direction}>
        <EmailHeading {...direction}>{content.welcome}</EmailHeading>
        <EmailText {...direction}>{content.body}</EmailText>
      </EmailSection>
      <EmailSection {...direction}>
        <EmailButton {...direction} href="https://example.com/sign-in">
          {content.signIn}
        </EmailButton>
      </EmailSection>
      <EmailSection {...direction}>
        <EmailText {...direction} muted>
          {content.codeIntro}
        </EmailText>
        <EmailCode {...direction}>{new Intl.NumberFormat(lang, { useGrouping: false }).format(482019)}</EmailCode>
      </EmailSection>
      <EmailDivider />
      <EmailSection {...direction}>
        <EmailCard {...direction}>
          <EmailHeading {...direction} level={2}>
            {content.receipt}
          </EmailHeading>
          <EmailText {...direction}>{content.plan}</EmailText>
          <EmailText {...direction} muted>
            {content.paid}
            {new Intl.NumberFormat(lang, { style: "currency", currency: "USD" }).format(12)}
          </EmailText>
          <EmailLink {...direction} href="https://example.com/receipt">
            {content.viewReceipt}
          </EmailLink>
        </EmailCard>
      </EmailSection>
      <EmailSection {...direction}>
        <EmailText {...direction} muted>
          {content.ignore}
        </EmailText>
        <EmailText {...direction} muted>
          <EmailLink {...direction} href="https://example.com/help">
            {content.help}
          </EmailLink>
        </EmailText>
      </EmailSection>
    </Email>,
  );
  return (
    <iframe
      title={content.title}
      srcDoc={html}
      sandbox="allow-same-origin"
      tabIndex={-1}
      style={{ display: "block", width: 600, maxWidth: "100%", height: 1200, border: 0 }}
    />
  );
}

const meta = {
  title: "Email/Building blocks",
  component: EmailPreview,
  args: { dir: "ltr" },
  play: async ({ args, canvas }) => {
    const frame = canvas.getByTitle(copy[args.dir].title) as HTMLIFrameElement;
    await waitFor(() => {
      const document = frame.contentDocument;
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
