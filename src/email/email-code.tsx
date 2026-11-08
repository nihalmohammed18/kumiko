import { border, fonts, radii } from "../tokens.ts";
import { emailAlignment, emailJoinedScript, emailTypeStyle } from "./email-styles.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native code props and an explicit email theme.
 * Use when: typing EmailCode. Avoid when: displaying a call to action; use EmailButtonProps.
 */
export interface EmailCodeProps extends EmailPartProps<"code"> {}

/** A large, spaced one-time code on the field colour with a visible border.
 * Use when: offering a code alongside a sign-in link. Avoid when: rendering source code or long identifiers.
 */
export function EmailCode({ theme, dir, lang, ...props }: EmailCodeProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      dir={dir}
      bgcolor={colors.field}
      style={{ borderCollapse: "separate", tableLayout: "fixed" }}
    >
      <tbody>
        <tr>
          <td
            align={emailAlignment(dir)}
            style={{
              padding: 16,
              backgroundColor: colors.field,
              color: colors.ink,
              border: `${border} solid ${colors.line}`,
              borderRadius: radii.control,
            }}
          >
            <code
              {...props}
              dir={dir}
              lang={lang}
              data-slot="email-code"
              style={{
                fontFamily: fonts.code,
                ...emailTypeStyle("headline"),
                fontWeight: 700,
                letterSpacing: emailJoinedScript(lang) ? "normal" : "0.18em",
                textAlign: emailAlignment(dir),
                overflowWrap: "anywhere",
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
