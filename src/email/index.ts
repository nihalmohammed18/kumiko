/**
 * Compose static HTML emails with Kumiko's table-backed parts and ready-made templates.
 *
 * Use when: sending sign-in links, verification codes, receipts or job alert digests.
 * Avoid when: building an interactive app page; use the components from `kumiko-ui`.
 *
 * Import parts, templates and renderEmail from `kumiko-ui/email`. Render on the server and pass the returned
 * HTML to your mail provider. Emails need neither KumikoProvider nor the web stylesheets or fonts: styles are
 * inline, with email-safe font fallbacks. Use absolute URLs for links and logo images.
 *
 * Choose SignInEmail, VerifyEmail, ReceiptEmail, JobAlertDigestEmail or PlainEmail for a complete message.
 * Compose Email with EmailHeading, EmailText, EmailSection, EmailCard and EmailButton for a custom layout.
 * Pass the same `theme` overrides to Email and each coloured part; a parent does not propagate them.
 * Set `dir="rtl"` and `lang="ar"` or `lang="ur"` for Arabic or Urdu, and supply translated heading, preview
 * and action labels. Theme colours are plain strings from EmailTheme, never CSS variables; email client dark
 * mode is not controlled by Kumiko's web theme.
 *
 * @example
 * const html = renderEmail(
 *   <Email title="Your saved jobs" preview="A frontend role matches your alert.">
 *     <EmailHeading>Your next role awaits</EmailHeading>
 *     <EmailText>A frontend role at Cedar Labs matches your alert.</EmailText>
 *     <EmailButton href="https://jobs.example.com/jobs/frontend">View job</EmailButton>
 *   </Email>
 * );
 */
export { Email, type EmailProps } from "./email.tsx";
export { EmailButton, type EmailButtonProps } from "./email-button.tsx";
export { EmailCard, type EmailCardProps } from "./email-card.tsx";
export { EmailCode, type EmailCodeProps } from "./email-code.tsx";
export { EmailDivider, type EmailDividerProps } from "./email-divider.tsx";
export { EmailHeading, type EmailHeadingProps } from "./email-heading.tsx";
export { EmailLink, type EmailLinkProps } from "./email-link.tsx";
export { EmailLogo, type EmailLogoProps } from "./email-logo.tsx";
export { EmailSection, type EmailSectionProps } from "./email-section.tsx";
export { EmailText, type EmailTextProps } from "./email-text.tsx";
export { defaultEmailTheme, type EmailTheme } from "./email-theme.ts";
export { renderEmail } from "./render-email.ts";
export { JobAlertDigestEmail, type JobAlertDigestEmailProps } from "./templates/job-alert-digest-email.tsx";
export { PlainEmail, type PlainEmailProps } from "./templates/plain-email.tsx";
export { ReceiptEmail, type ReceiptEmailProps } from "./templates/receipt-email.tsx";
export { SignInEmail, type SignInEmailProps } from "./templates/sign-in-email.tsx";
export { VerifyEmail, type VerifyEmailProps } from "./templates/verify-email.tsx";
