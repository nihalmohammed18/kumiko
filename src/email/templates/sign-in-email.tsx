import type { BrandedEmailProps } from "../email.tsx";
import { EmailButton } from "../email-button.tsx";
import { EmailCode } from "../email-code.tsx";
import { EmailDivider } from "../email-divider.tsx";
import { EmailSection } from "../email-section.tsx";
import { EmailTemplate } from "./email-template.tsx";

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
  /** Legacy hero copy; subline takes precedence when both are provided. */
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
  codeLabel = "or enter this code",
  expiryText,
  subline = expiryText ??
    `Tap the button to sign in. The link and code expire in ${new Intl.NumberFormat(lang).format(expiresInMinutes)} ${expiresInMinutes === 1 ? "minute" : "minutes"}.`,
  ignoreText = "If you didn't ask to sign in, you can ignore this email.",
  footer,
  ...props
}: SignInEmailProps) {
  const parts = { dir, lang, theme };
  return (
    <EmailTemplate
      {...props}
      {...parts}
      productName={productName}
      heading={heading}
      subline={subline}
      footer={{ reason: ignoreText, ...footer }}
    >
      <EmailSection dir={dir} lang={lang}>
        <EmailButton {...parts} href={url} align="center">
          {buttonLabel}
        </EmailButton>
      </EmailSection>
      {code !== undefined && (
        <EmailSection dir={dir} lang={lang}>
          <EmailDivider {...parts} label={codeLabel} />
          <EmailCode {...parts}>{code}</EmailCode>
        </EmailSection>
      )}
    </EmailTemplate>
  );
}
