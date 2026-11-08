import type { CSSProperties, ReactNode } from "react";
import { fonts } from "../tokens.ts";
import { emailAlignment, emailTypeStyle } from "./email-styles.ts";
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
  /** Pass these overrides to each coloured part too; themes are explicit props, not inherited context. */
  theme?: Partial<EmailTheme>;
}

const reset = `body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt}
img{border:0}
:lang(ar),:lang(ur){letter-spacing:normal!important;text-transform:none!important}
@media only screen and (max-width:600px){[data-slot="email-container"]{width:100%!important}[data-slot="email-content"]{padding:24px!important}}`;

/** An email-safe document with a hidden preview and a centred, responsive 600px table.
 * Use when: composing sign-in links, receipts or digests. Avoid when: rendering an interactive application page.
 */
export function Email({ lang = "en", dir = "ltr", preview, title, theme, children }: EmailProps) {
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
          fontFamily: fonts.body,
          ...emailTypeStyle("body"),
        }}
      >
        <div aria-hidden="true" style={preheaderStyle}>
          {preview}
        </div>
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          bgcolor={colors.canvas}
          style={{ backgroundColor: colors.canvas, tableLayout: "fixed" }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "24px 12px" }}>
                <table
                  role="presentation"
                  width="600"
                  cellPadding="0"
                  cellSpacing="0"
                  bgcolor={colors.surface}
                  dir={dir}
                  data-slot="email-container"
                  style={{ width: "600px", maxWidth: "100%", backgroundColor: colors.surface, tableLayout: "fixed" }}
                >
                  <tbody>
                    <tr>
                      <td
                        align={emailAlignment(dir)}
                        data-slot="email-content"
                        style={{
                          padding: 32,
                          textAlign: emailAlignment(dir),
                          wordWrap: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {children}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
