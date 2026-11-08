import { EmailButton } from "../email-button.tsx";
import { EmailCode } from "../email-code.tsx";
import { EmailSection } from "../email-section.tsx";
import { EmailText } from "../email-text.tsx";
import { type BrandedEmailProps, EmailTemplate } from "./email-template.tsx";

/** An address verification code, optional destination and replaceable English copy.
 * Use when: typing VerifyEmail. Avoid when: requesting a sign-in; use SignInEmailProps.
 */
export interface VerifyEmailProps extends BrandedEmailProps {
  productName: string;
  code: string;
  url?: string;
  codeLabel?: string;
  buttonLabel?: string;
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
  heading = `Verify your email for ${productName}`,
  codeLabel = "Enter this code to confirm your email address:",
  buttonLabel = "Verify email address",
  ...props
}: VerifyEmailProps) {
  const parts = { dir, lang, theme };
  return (
    <EmailTemplate {...props} {...parts} heading={heading}>
      <EmailSection dir={dir} lang={lang}>
        <EmailText {...parts}>{codeLabel}</EmailText>
        <EmailCode {...parts}>{code}</EmailCode>
      </EmailSection>
      {url !== undefined && (
        <EmailSection dir={dir} lang={lang}>
          <EmailButton {...parts} href={url}>
            {buttonLabel}
          </EmailButton>
        </EmailSection>
      )}
    </EmailTemplate>
  );
}
