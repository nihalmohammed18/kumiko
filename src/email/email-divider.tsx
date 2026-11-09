import { border } from "../tokens.ts";
import { emailTypeStyle } from "./email-styles.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native separator props and an explicit email theme.
 * Use when: typing EmailDivider. Avoid when: adding space without a line; use EmailSectionProps.
 */
export interface EmailDividerProps extends EmailPartProps<"hr"> {
  label?: string;
}

/** A two-pixel divider, optionally split around a centred label.
 * Use when: separating email topics. Avoid when: boxing a digest item or receipt; use EmailCard.
 *
 * @example
 * <><EmailText>Your saved roles</EmailText><EmailDivider /><EmailText>Manage your alert anytime.</EmailText></>
 */
export function EmailDivider({ label, theme, dir, lang, ...props }: EmailDividerProps) {
  const colors = resolveEmailTheme(theme);
  const line = { margin: 0, border: 0, height: border, backgroundColor: colors.line, color: colors.line };
  if (label !== undefined) {
    return (
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        dir={dir}
        lang={lang}
        style={{ margin: "16px 0", tableLayout: "fixed" }}
      >
        <tbody>
          <tr>
            <td width="25%">
              <hr {...props} data-slot="email-divider" style={line} />
            </td>
            <td
              align="center"
              style={{
                padding: "0 12px",
                ...emailTypeStyle("chip"),
                color: colors["ink-muted"],
                textAlign: "center",
                overflowWrap: "anywhere",
              }}
            >
              {label}
            </td>
            <td width="25%">
              <hr style={line} />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
  return <hr {...props} dir={dir} lang={lang} data-slot="email-divider" style={{ ...line, margin: "16px 0" }} />;
}
