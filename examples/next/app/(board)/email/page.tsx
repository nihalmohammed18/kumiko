import {
  EmailDivider,
  EmailLink,
  type EmailLogoProps,
  EmailText,
  JobAlertDigestEmail,
  PlainEmail,
  ReceiptEmail,
  renderEmail,
  SignInEmail,
  VerifyEmail,
} from "kumiko-ui/email";
import { jobs } from "../../jobs";

const currency = new Intl.NumberFormat("en", { style: "currency", currency: "USD" });
const productName = "Kumiko jobs";
// The same embedded mark as the email stories keeps these previews self-contained.
const logo: EmailLogoProps = {
  src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA3ElEQVR4nO3ZSxJAMBCEYRdyABewdVd3cg5WrFIpY9Ldk5hUZYn/o8ojpsk4tvU4kdPaIw+GgdThLog61oVQR7oQ6jgXQh3lRqiDXAB1jBuhDkmAdcPaYO7j89n3HrxF/INgA1rG0wGt46kARDwNgIqnAJDxcAA6HgpgxMMArHgIgBlPBSDiaQBUPAWAjM8rEAGRd6FSJBORT+JaHAORb6NvopCI/CKzxCAQ/a9KKBa2WiH+u7QYZY4D6BEx1h+a3hDF+F4Q1fh7LPN+Rpyv4qMiTPGRIJ/DVSBrzwWxkmI4wUYebwAAAABJRU5ErkJggg==",
  width: 48,
  height: 48,
  alt: "Kumiko",
};
const messages = [
  {
    title: "Sign in to your board",
    email: (
      <SignInEmail
        productName={productName}
        logo={logo}
        url="https://example.com/sign-in"
        code="482019"
        expiresInMinutes={15}
      />
    ),
  },
  {
    title: "Verify your email",
    email: <VerifyEmail productName={productName} logo={logo} code="482019" url="https://example.com/verify" />,
  },
  {
    title: "Your weekly job digest",
    email: (
      <JobAlertDigestEmail
        productName={productName}
        logo={logo}
        alertName="Your next role"
        jobs={jobs.slice(0, 3).map((job) => ({
          title: job.role,
          company: job.company,
          location: job.location,
          url: `https://example.com/jobs/${job.id}`,
        }))}
        manageUrl="https://example.com/alerts"
      />
    ),
  },
  {
    title: "Your coaching receipt",
    email: (
      <ReceiptEmail
        productName={productName}
        logo={logo}
        items={[{ label: "CV coaching session", amount: currency.format(25) }]}
        total={currency.format(25)}
        date={new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date("2026-11-08"))}
        receiptUrl="https://example.com/receipt"
      />
    ),
  },
  {
    title: "A note from your recruiter",
    email: (
      <PlainEmail title="Your next conversation" signature="Alex, your recruiter">
        <EmailText>Hi Sam, the team enjoyed reading your application. Let us find a time to talk.</EmailText>
        <EmailText>
          <EmailLink href="https://example.com/interview">Choose an interview time</EmailLink>.
        </EmailText>
        <EmailDivider />
      </PlainEmail>
    ),
  },
];

export default function EmailPage() {
  return (
    <>
      <h1 className="font-display text-headline font-bold">Your job-search inbox</h1>
      <p className="text-ink-muted">Preview the messages that keep your search moving. These samples are never sent.</p>
      {messages.map(({ title, email }) => (
        <section key={title} className="grid min-w-0 gap-3">
          <h2 className="font-display text-title font-bold">{title}</h2>
          <iframe
            title={title}
            srcDoc={renderEmail(email)}
            sandbox=""
            className="block h-96 w-full rounded-card border-2 border-line bg-surface"
          />
        </section>
      ))}
    </>
  );
}
