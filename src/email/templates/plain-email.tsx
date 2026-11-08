import type { ReactNode } from "react";
import { Email, type EmailProps } from "../email.tsx";
import { EmailText } from "../email-text.tsx";
import { defaultEmailTheme } from "../email-theme.ts";

/** A personal note's body, signature and optional translated document metadata.
 * Use when: typing PlainEmail. Avoid when: adding a logo or call to action; use a branded template.
 */
export interface PlainEmailProps extends Omit<EmailProps, "children" | "title" | "preview"> {
  children: ReactNode;
  signature?: string;
  title?: string;
  preview?: string;
}

/** A complete personal note with underlined ink links and an optional signature.
 * Use when: sending body text without template decoration. Avoid when: needing branding; only theme.ink is used.
 *
 * @example
 * <PlainEmail title="Your application update" preview="The team would like to meet you." signature="Aisha at Cedar Labs">
 *   <p>Thanks for applying. We would love to hear about your recent work.</p>
 * </PlainEmail>
 */
export function PlainEmail({
  children,
  signature,
  title = "",
  preview = "",
  dir = "ltr",
  lang = "en",
  theme,
}: PlainEmailProps) {
  const ink = theme?.ink ?? defaultEmailTheme.ink;
  const plainTheme = { ink, canvas: defaultEmailTheme.surface, surface: defaultEmailTheme.surface };
  return (
    <Email dir={dir} lang={lang} theme={plainTheme} title={title} preview={preview}>
      {/* React hoists this stylesheet to the head, where mail clients expect it. */}
      <style href="kumiko-plain-email" precedence="email">
        {`a{color:${ink}!important;text-decoration:underline!important}`}
      </style>
      {children}
      {signature !== undefined && (
        <EmailText dir={dir} lang={lang} theme={plainTheme}>
          {signature}
        </EmailText>
      )}
    </Email>
  );
}
