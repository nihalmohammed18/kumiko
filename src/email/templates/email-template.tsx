import type { ReactNode } from "react";
import { Email, type EmailProps } from "../email.tsx";
import { EmailHeading } from "../email-heading.tsx";
import { EmailLogo, type EmailLogoProps } from "../email-logo.tsx";
import { EmailSection } from "../email-section.tsx";

/** Shared branding, translated heading and document metadata for ready-made emails.
 * Use when: typing a branded email template. Avoid when: composing a personal note; use PlainEmailProps.
 */
export interface BrandedEmailProps extends Omit<EmailProps, "children" | "title" | "preview"> {
  logo?: EmailLogoProps;
  /** Replace the complete heading, including any localized counts. */
  heading?: string;
  /** Defaults to the heading, prefixed with the product name for job digests. */
  title?: string;
  /** Defaults to the heading. */
  preview?: string;
}

/** The shared document and optional logo for branded email templates.
 * Use when: implementing a ready-made branded email. Avoid when: adding a footer or styling a personal note.
 */
export function EmailTemplate({
  heading,
  title = heading,
  preview = heading,
  logo,
  theme,
  dir,
  lang,
  children,
}: BrandedEmailProps & { heading: string; children: ReactNode }) {
  const parts = { theme, dir, lang };
  return (
    <Email {...parts} title={title} preview={preview}>
      {logo && (
        <EmailSection dir={dir} lang={lang}>
          <EmailLogo {...logo} dir={dir} lang={lang} />
        </EmailSection>
      )}
      <EmailHeading {...parts}>{heading}</EmailHeading>
      {children}
    </Email>
  );
}
