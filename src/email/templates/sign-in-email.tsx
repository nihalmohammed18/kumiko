import { EmailButton } from "../email-button.tsx";
import { EmailCode } from "../email-code.tsx";
import { EmailSection } from "../email-section.tsx";
import { EmailText } from "../email-text.tsx";
import { type BrandedEmailProps, EmailTemplate } from "./email-template.tsx";

/** Sign-in destination, optional code, expiry and replaceable English copy.
 * Use when: typing SignInEmail. Avoid when: confirming an address; use VerifyEmailProps.
 */
export interface SignInEmailProps extends BrandedEmailProps {
  productName: string;
  url: string;
  code?: string;
  expiresInMinutes: number;
  buttonLabel?: string;
  codeLabel?: string;
  expiryText?: string;
  ignoreText?: string;
}

/** A complete sign-in email with a link, optional one-time code and expiry notice.
 * Use when: sending a requested sign-in email. Avoid when: verifying an address; use VerifyEmail.
 *
 * @example
 * <SignInEmail productName="Cedar Jobs" url="https://jobs.example.com/sign-in/token" code="482193" expiresInMinutes={15} />
 */
export function SignInEmail({
  productName,
  url,
  code,
  expiresInMinutes,
  dir = "ltr",
  lang = "en",
  theme,
  heading = `Sign in to ${productName}`,
  buttonLabel = "Sign in",
  codeLabel = "Or enter this one-time code:",
  expiryText = `Expires in ${new Intl.NumberFormat(lang).format(expiresInMinutes)} ${expiresInMinutes === 1 ? "minute" : "minutes"}.`,
  ignoreText = "If you didn't ask for this email, you can ignore it.",
  ...props
}: SignInEmailProps) {
  const parts = { dir, lang, theme };
  return (
    <EmailTemplate {...props} {...parts} heading={heading}>
      <EmailSection dir={dir} lang={lang}>
        <EmailButton {...parts} href={url}>
          {buttonLabel}
        </EmailButton>
      </EmailSection>
      {code !== undefined && (
        <EmailSection dir={dir} lang={lang}>
          <EmailText {...parts} muted>
            {codeLabel}
          </EmailText>
          <EmailCode {...parts}>{code}</EmailCode>
        </EmailSection>
      )}
      <EmailSection dir={dir} lang={lang}>
        <EmailText {...parts} muted>
          {expiryText}
        </EmailText>
        <EmailText {...parts} muted>
          {ignoreText}
        </EmailText>
      </EmailSection>
    </EmailTemplate>
  );
}
