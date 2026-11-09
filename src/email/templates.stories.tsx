import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { EmailFrame } from "../../.storybook/email-preview.tsx";
import { emailArt, JobAlertDigestEmail, PlainEmail, ReceiptEmail, SignInEmail, VerifyEmail } from "./index.ts";

const logo = {
  src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA3ElEQVR4nO3ZSxJAMBCEYRdyABewdVd3cg5WrFIpY9Ldk5hUZYn/o8ojpsk4tvU4kdPaIw+GgdThLog61oVQR7oQ6jgXQh3lRqiDXAB1jBuhDkmAdcPaYO7j89n3HrxF/INgA1rG0wGt46kARDwNgIqnAJDxcAA6HgpgxMMArHgIgBlPBSDiaQBUPAWAjM8rEAGRd6FSJBORT+JaHAORb6NvopCI/CKzxCAQ/a9KKBa2WiH+u7QYZY4D6BEx1h+a3hDF+F4Q1fh7LPN+Rpyv4qMiTPGRIJ/DVSBrzwWxkmI4wUYebwAAAABJRU5ErkJggg==",
  width: 48,
  height: 48,
  alt: "Kumiko",
};
const usd = new Intl.NumberFormat("en", { style: "currency", currency: "USD" });
const manageUrl = "https://example.com/alerts/product-engineering";
const jobs = Array.from({ length: 12 }, (_, index) => ({
  title: index === 0 ? "Senior product engineer" : `Product engineer ${new Intl.NumberFormat("en").format(index + 1)}`,
  company: ["Acme", "Cedar Labs", "Northstar", "Sprout", "TideWorks"][index % 5]!,
  url: `https://example.com/jobs/${index + 1}`,
  ...(index < 2 && { location: "Remote", salary: `${usd.format(120000)}–${usd.format(160000)}` }),
  ...(index < 3 && { tags: ["Full-time", "Design systems"] }),
}));

const examples = {
  signIn: {
    title: "Sign-in email",
    height: 800,
    email: (
      <SignInEmail
        productName="Kumiko"
        url="https://example.com/sign-in"
        code="482019"
        expiresInMinutes={15}
        logo={logo}
        art={emailArt("pip-waving", "/email-art")}
      />
    ),
  },
  verify: {
    title: "Email address verification",
    height: 640,
    email: (
      <VerifyEmail
        productName="Kumiko"
        code="482019"
        url="https://example.com/verify"
        logo={logo}
        art={emailArt("sealed-envelope", "/email-art")}
        footer={{ reason: "You're receiving this because you have an account with Kumiko." }}
      />
    ),
  },
  digest: {
    title: "Job alert digest",
    height: 3200,
    email: (
      <JobAlertDigestEmail
        productName="Kumiko"
        alertName="Product engineering"
        jobs={jobs}
        manageUrl={manageUrl}
        logo={logo}
        art={emailArt("mori-cheering", "/email-art")}
        viewAllUrl="https://example.com/jobs"
      />
    ),
  },
  receipt: {
    title: "Payment receipt",
    height: 720,
    email: (
      <ReceiptEmail
        productName="Kumiko"
        items={[
          { label: "Kumiko Pro · one month", amount: usd.format(12) },
          { label: "Additional seats", amount: usd.format(8) },
        ]}
        total={usd.format(20)}
        date={new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date("2026-11-08"))}
        receiptUrl="https://example.com/receipt"
        logo={logo}
        art={emailArt("trophy", "/email-art")}
        paymentMethod="Visa ending in 4242"
        footer={{ reason: "You're receiving this because you made a purchase from Kumiko." }}
      />
    ),
  },
  plain: {
    title: "A personal note",
    height: 480,
    email: (
      <PlainEmail title="A personal note" signature="Nihal">
        <p>Hi Alex,</p>
        <p>Thanks for taking the time to try Kumiko. I would love to hear how it is working for you.</p>
        <p>
          Here is <a href="https://example.com/notes">my latest note</a>. Reply whenever you have a moment.
        </p>
      </PlainEmail>
    ),
  },
  signInRtl: {
    title: "تسجيل الدخول إلى كوميكو",
    height: 800,
    email: (
      <SignInEmail
        productName="كوميكو"
        url="https://example.com/sign-in"
        code="٤٨٢٠١٩"
        expiresInMinutes={15}
        logo={{ ...logo, alt: "كوميكو" }}
        art={{ ...emailArt("pip-waving", "/email-art"), alt: "بيب يلوّح مرحبًا" }}
        dir="rtl"
        lang="ar"
        title="تسجيل الدخول إلى كوميكو"
        preview="رابط تسجيل الدخول الآمن والرمز لمرة واحدة."
        heading="تسجيل الدخول إلى كوميكو"
        subline="اضغط على الزر لتسجيل الدخول. تنتهي صلاحية الرابط والرمز خلال ١٥ دقيقة."
        buttonLabel="تسجيل الدخول"
        codeLabel="أو أدخل هذا الرمز"
        expiryText={`تنتهي صلاحية الرابط والرمز خلال ${new Intl.NumberFormat("ar").format(15)} دقيقة.`}
        ignoreText="إذا لم تطلب هذه الرسالة، يمكنك تجاهلها."
      />
    ),
  },
};

function EmailPreview({ template }: { template: keyof typeof examples }) {
  const example = examples[template];
  return <EmailFrame title={example.title} email={example.email} height={example.height} />;
}

const meta = {
  title: "Email/Templates",
  component: EmailPreview,
  args: { template: "signIn" },
  play: async ({ args, canvas }) => {
    const frame = canvas.getByTitle(examples[args.template].title) as HTMLIFrameElement;
    await waitFor(() => {
      const document = frame.contentDocument;
      expect(frame.dataset.emailReady).toBe("true");
      expect(document?.readyState).toBe("complete");
      expect(document?.documentElement.dir).toBe(args.template === "signInRtl" ? "rtl" : "ltr");
      expect(document?.documentElement.lang).toBe(args.template === "signInRtl" ? "ar" : "en");
      expect(document!.documentElement.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
      expect(document!.body.scrollHeight).toBeLessThanOrEqual(frame.clientHeight);
      if (args.template === "digest") {
        expect(document?.querySelectorAll('[data-slot="email-job-card"]')).toHaveLength(10);
        const more = Array.from(document!.querySelectorAll("a")).find((link) => link.textContent === "and 2 more");
        expect(more?.getAttribute("href")).toBe(manageUrl);
        expect(document?.querySelector('[data-slot="email-footer"] a')?.getAttribute("href")).toBe(manageUrl);
      }
    });
  },
} satisfies Meta<typeof EmailPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = { name: "Sign-in" };
export const Verify: Story = { args: { template: "verify" } };
export const JobAlertDigest: Story = { name: "Job alert digest", args: { template: "digest" } };
export const Receipt: Story = { args: { template: "receipt" } };
export const Plain: Story = { args: { template: "plain" } };
export const SignInRightToLeft: Story = { name: "Sign-in, right to left", args: { template: "signInRtl" } };
