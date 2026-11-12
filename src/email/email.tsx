import type { CSSProperties, ReactNode } from "react";
import type { EmailFooterProps } from "./email-footer.tsx";
import type { EmailImageProps } from "./email-image.tsx";
import type { EmailLogoProps } from "./email-logo.tsx";
import { emailAlignment, emailTypeStyle } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";
import { type EmailTheme, resolveEmailTheme } from "./email-theme.ts";

/** Document metadata, reading direction and explicit email colours.
 * Use when: composing a complete email. Avoid when: typing an individual email part.
 */
export interface EmailProps {
  children?: ReactNode;
  lang?: string;
  dir?: "ltr" | "rtl";
  preview: string;
  title: string;
  /** Optional hosted Nunito CSS; off by default because fetching it can disclose recipient activity. */
  fontHref?: string;
  /** Pass these overrides to each coloured part too; themes are explicit props, not inherited context. */
  theme?: Partial<EmailTheme>;
}

/** Shared branding, translated heading and document metadata for ready-made emails.
 * Use when: typing a branded email template. Avoid when: composing a personal note; use PlainEmailProps.
 *
 * @example
 * const branding: BrandedEmailProps = { art: emailArt("pip-waving", "https://jobs.example.com/email-art") };
 */
export interface BrandedEmailProps extends Omit<EmailProps, "children" | "title" | "preview"> {
  logo?: EmailLogoProps;
  art?: Pick<EmailImageProps, "src" | "alt" | "width" | "height"> | null;
  subline?: string;
  footer?: EmailFooterProps;
  /** Replace the complete heading, including any localized counts. */
  heading?: string;
  /** Defaults to the heading, prefixed with the product name for job digests. */
  title?: string;
  /** Defaults to the heading. */
  preview?: string;
}

const reset = `body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt}
img{border:0}
:lang(ar),:lang(ur){letter-spacing:normal!important;text-transform:none!important}
@media only screen and (max-width:600px){[data-slot="email-container"]{width:100%!important}[data-slot="email-gutter"]{padding:32px 12px!important}[data-slot="email-content"]{padding:24px!important}[data-slot="email-hero"]{padding:24px 24px 28px!important}[data-full-width="true"]{width:100%!important}}`;

/** An email-safe document with a hidden preview and a centred, responsive 600px table.
 * Use when: composing sign-in links, receipts or digests. Avoid when: rendering an interactive application page.
 *
 * @example
 * <Email title="Your weekly job alert" preview="A frontend role matches your search.">
 *   <EmailHeading>Your next role awaits</EmailHeading><EmailText>Cedar Labs is hiring a frontend engineer.</EmailText>
 *   <EmailButton href="https://jobs.example.com/jobs/frontend">View job</EmailButton>
 * </Email>
 */
export function Email(props: EmailProps) {
  return <EmailDocument {...props} />;
}

/** The shared email document, with a plain layout reserved for personal notes.
 * Use when: implementing Email or PlainEmail. Avoid when: composing coloured public email parts.
 */
export function EmailDocument({
  lang = "en",
  dir = "ltr",
  preview,
  title,
  fontHref,
  theme,
  children,
  plain = false,
}: EmailProps & { plain?: boolean }) {
  const colors = resolveEmailTheme(theme);
  const preheaderStyle: CSSProperties & { msoHide: string } = {
    display: "none",
    visibility: "hidden",
    overflow: "hidden",
    maxHeight: 0,
    maxWidth: 0,
    opacity: 0,
    fontSize: 1,
    lineHeight: "1px",
    msoHide: "all",
  };
  return (
    <html lang={lang} dir={dir} style={{ colorScheme: "light" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="x-apple-disable-message-reformatting" content="" />
        <title>{title}</title>
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        <style>{reset}</style>
      </head>
      <body
        data-slot="email"
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: colors.canvas,
          color: colors.ink,
          colorScheme: "light",
          ...emailTypeStyle(plain ? "plain" : "body"),
        }}
      >
        <div aria-hidden="true" style={preheaderStyle}>
          {preview}
        </div>
        <EmailTable
          dir={dir}
          lang={lang}
          bgcolor={colors.canvas}
          style={{ backgroundColor: colors.canvas }}
          cell={{
            align: "center",
            "data-slot": plain ? "email-plain-gutter" : "email-gutter",
            style: { padding: plain ? 24 : "32px 16px" },
          }}
        >
          <EmailTable
            width="600"
            bgcolor={colors.canvas}
            dir={dir}
            lang={lang}
            data-slot="email-container"
            style={{ width: "600px", maxWidth: "100%", backgroundColor: colors.canvas }}
            cell={{
              "data-slot": "email-layout",
              style: { textAlign: emailAlignment(dir), wordWrap: "break-word", overflowWrap: "anywhere" },
            }}
          >
            {children}
          </EmailTable>
        </EmailTable>
      </body>
    </html>
  );
}
