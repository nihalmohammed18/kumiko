import type { BrandedEmailProps } from "../email.tsx";
import { EmailButton } from "../email-button.tsx";
import { EmailCode } from "../email-code.tsx";
import { EmailSection } from "../email-section.tsx";
import { EmailTemplate } from "./email-template.tsx";

/** An address verification code, optional destination and replaceable English copy.
 * Use when: typing VerifyEmail. Avoid when: requesting a sign-in; use SignInEmailProps.
 */
export interface VerifyEmailProps extends BrandedEmailProps {
  productName: string;
  code: string;
  url?: string;
  /** Legacy hero copy; subline takes precedence when both are provided. */
  codeLabel?: string;
  buttonLabel?: string;
  expiresInMinutes?: number;
  expiryText?: string;
}

/** A complete email address verification email with a code and optional link.
 * Use when: confirming an email address. Avoid when: signing in an existing user; use SignInEmail.
 *
 * @example
 * <VerifyEmail productName="Cedar Jobs" code="482193" url="https://jobs.example.com/verify/token" />
 */
export function VerifyEmail({
  productName,
  code,
  url,
  dir = "ltr",
  lang = "en",
  theme,
  heading = "Confirm your email",
  codeLabel,
  subline = codeLabel ?? `Enter this code in ${productName} to finish setting up your account.`,
  buttonLabel = "Verify email address",
  expiresInMinutes = 15,
  expiryText = `Expires in ${new Intl.NumberFormat(lang).format(expiresInMinutes)} ${expiresInMinutes === 1 ? "minute" : "minutes"}`,
  ...props
}: VerifyEmailProps) {
  const parts = { dir, lang, theme };
  return (
    <EmailTemplate {...props} {...parts} productName={productName} heading={heading} subline={subline} tone="leaf">
      <EmailSection dir={dir} lang={lang}>
        <EmailCode {...parts} note={expiryText}>
          {code}
        </EmailCode>
      </EmailSection>
      {url !== undefined && (
        <EmailSection dir={dir} lang={lang}>
          <EmailButton {...parts} href={url} align="center">
            {buttonLabel}
          </EmailButton>
        </EmailSection>
      )}
    </EmailTemplate>
  );
}
