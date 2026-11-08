import type { CSSProperties } from "react";
import { edge, radii } from "../tokens.ts";
import { emailAlignment, emailFonts, emailJoinedScript, emailTypeStyle } from "./email-styles.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native link props and an explicit theme for an email call to action.
 * Use when: typing EmailButton. Avoid when: adding script-driven button actions to email.
 */
export interface EmailButtonProps extends EmailPartProps<"a"> {
  href: string;
  children?: string;
}

/** A table-backed, plain text link with Kumiko's brand fill and darker bottom edge.
 * Use when: offering an email's primary destination. Avoid when: linking a phrase within a paragraph; use EmailLink.
 *
 * @example
 * <EmailButton href="https://jobs.example.com/jobs/frontend">View frontend role</EmailButton>
 */
export function EmailButton({ theme, dir, lang, children, ...props }: EmailButtonProps) {
  const colors = resolveEmailTheme(theme);
  // Word-based Outlook ignores link padding; the cell preserves spacing even without radii or the edge.
  const cellStyle: CSSProperties & { msoPaddingAlt: string } = {
    backgroundColor: colors.brand,
    color: colors["brand-fg"],
    borderRadius: radii.control,
    borderBottom: `${edge} solid ${colors.edge}`,
    msoPaddingAlt: "14px 24px",
  };
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" dir={dir} style={{ tableLayout: "fixed" }}>
      <tbody>
        <tr>
          <td align={emailAlignment(dir)}>
            <table
              role="presentation"
              cellPadding="0"
              cellSpacing="0"
              align={emailAlignment(dir)}
              style={{ borderCollapse: "separate", marginInlineStart: 0, marginInlineEnd: "auto" }}
            >
              <tbody>
                <tr>
                  <td {...{ bgcolor: colors.brand }} style={cellStyle}>
                    <a
                      {...props}
                      dir={dir}
                      lang={lang}
                      data-slot="email-button"
                      style={{
                        display: "inline-block",
                        padding: "14px 24px",
                        backgroundColor: colors.brand,
                        color: colors["brand-fg"],
                        borderRadius: radii.control,
                        fontFamily: emailFonts.body,
                        ...emailTypeStyle("button"),
                        fontWeight: 800,
                        letterSpacing: emailJoinedScript(lang) ? "normal" : "0.06em",
                        textDecoration: "none",
                        textAlign: "center",
                        overflowWrap: "anywhere",
                        cursor: "pointer",
                      }}
                    >
                      {emailJoinedScript(lang) ? children : children?.toLocaleUpperCase(lang ?? "en")}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
