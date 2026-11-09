/**
 * Compose static HTML emails with Kumiko's table-backed parts and ready-made templates.
 *
 * Use when: sending sign-in links, verification codes, receipts or job alert digests.
 * Avoid when: building an interactive app page; use the components from `kumiko-ui`.
 *
 * Import parts, templates and renderEmail from `kumiko-ui/email`. Render on the server and pass the returned
 * HTML to your mail provider. Emails need neither KumikoProvider nor the web stylesheets or fonts: styles are
 * inline, with email-safe font fallbacks. Use absolute URLs for links and images.
 *
 * Choose SignInEmail, VerifyEmail, ReceiptEmail, JobAlertDigestEmail or PlainEmail for a complete message.
 * Compose Email with EmailCard's hero prop, EmailHero, EmailText, EmailSection, EmailButton and EmailFooter.
 * EmailButton offers primary/secondary variants, center/start alignment and fullWidth. EmailCode accepts a
 * note chip; EmailDivider accepts a centred label. EmailChip uses neutral, brand, sun, leaf, coral or tide tones.
 * EmailImage requires src, alt, width and height; dimensions describe display size, not the 2× PNG.
 * Pass the same `theme` overrides to Email and each coloured part; a parent does not propagate them.
 * Set `dir="rtl"` and `lang="ar"` or `lang="ur"` for Arabic or Urdu, and supply translated heading, preview
 * and action labels. Theme colours are plain strings from EmailTheme, never CSS variables; email client dark
 * mode is not controlled by Kumiko's web theme.
 *
 * Copy the default palette PNGs from node_modules/kumiko-ui/dist/email/art/ into your public folder or CDN,
 * then pass that absolute base URL to emailArt(name, baseUrl). It returns src, alt and 160×160 display dimensions.
 * EmailArtName lists the thirteen shipped images; the ./email/art/* package export exposes the files.
 * The PNGs use Kumiko's default colours and theme overrides do not recolour them; pass any image to art instead.
 *
 * Optional fontHref accepts Google Fonts' Fredoka 600/700 and Nunito 400/700/800 CSS URL or self-hosted CSS,
 * and defaults off because remote font requests can disclose recipient activity.
 * Gmail and classic Outlook ignore web fonts; rounded system fonts and Arial remain the fallbacks.
 * Outlook may square corners and simplify edges; each button cell retains its fill and padding fallback.
 * PlainEmail uses Arial 15px/22px, white canvas, start alignment and inline underlined links in native HTML children.
 * Branded templates accept art (or null), subline and footer; all English copy is replaceable.
 * JobAlertDigestEmail accepts job logos/tags and viewAllUrl (default manageUrl); its manage link always stays in the footer.
 * ReceiptEmail accepts paymentMethod, paidText and questionsText; VerifyEmail accepts expiresInMinutes and expiryText.
 *
 * @example
 * const html = renderEmail(
 *   <Email title="Your saved jobs" preview="A frontend role matches your alert.">
 *     <EmailCard hero={<EmailHero heading="Your next role awaits" tone="tide"
 *       art={emailArt("mori-cheering", "https://jobs.example.com/email-art")} />}>
 *       <EmailText>A frontend role at Cedar Labs matches your alert.</EmailText>
 *       <EmailButton href="https://jobs.example.com/jobs/frontend">View job</EmailButton>
 *     </EmailCard>
 *     <EmailFooter reason="You saved a frontend job alert."
 *       links={[{ label: "Manage or stop this alert", href: "https://jobs.example.com/alerts/frontend" }]} />
 *   </Email>
 * );
 */
export { type BrandedEmailProps, Email, type EmailProps } from "./email.tsx";
export { type EmailArtName, emailArt } from "./email-art.ts";
export { EmailButton, type EmailButtonProps } from "./email-button.tsx";
export { EmailCard, type EmailCardProps } from "./email-card.tsx";
export { EmailChip, type EmailChipProps } from "./email-chip.tsx";
export { EmailCode, type EmailCodeProps } from "./email-code.tsx";
export { EmailDivider, type EmailDividerProps } from "./email-divider.tsx";
export { EmailFooter, type EmailFooterProps } from "./email-footer.tsx";
export { EmailHeading, type EmailHeadingProps } from "./email-heading.tsx";
export { EmailHero, type EmailHeroProps } from "./email-hero.tsx";
export { EmailImage, type EmailImageProps } from "./email-image.tsx";
export { EmailLink, type EmailLinkProps } from "./email-link.tsx";
export { EmailLogo, type EmailLogoProps } from "./email-logo.tsx";
export { EmailSection, type EmailSectionProps } from "./email-section.tsx";
export { EmailText, type EmailTextProps } from "./email-text.tsx";
export { defaultEmailTheme, type EmailTheme, type EmailTone } from "./email-theme.ts";
export { renderEmail } from "./render-email.ts";
export { JobAlertDigestEmail, type JobAlertDigestEmailProps } from "./templates/job-alert-digest-email.tsx";
export { PlainEmail, type PlainEmailProps } from "./templates/plain-email.tsx";
export { ReceiptEmail, type ReceiptEmailProps } from "./templates/receipt-email.tsx";
export { SignInEmail, type SignInEmailProps } from "./templates/sign-in-email.tsx";
export { VerifyEmail, type VerifyEmailProps } from "./templates/verify-email.tsx";
