import { border, email } from "../tokens.ts";
import { EmailChip } from "./email-chip.tsx";
import { emailJoinedScript, emailTypeStyle } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native code props and an explicit email theme.
 * Use when: typing EmailCode. Avoid when: displaying a call to action; use EmailButtonProps.
 */
export interface EmailCodeProps extends EmailPartProps<"code"> {
  note?: string;
}

/** A centred display code in a dashed panel, with an optional note chip.
 * Use when: offering a code alongside a sign-in link. Avoid when: rendering source code or long identifiers.
 *
 * @example
 * <EmailCode>482193</EmailCode>
 */
export function EmailCode({ note, theme, dir, lang, ...props }: EmailCodeProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <EmailTable
      dir={dir}
      lang={lang}
      cell={{
        align: "center",
        bgcolor: colors.field,
        style: {
          padding: 20,
          backgroundColor: colors.field,
          color: colors.ink,
          border: `${border} dashed ${colors.line}`,
          borderRadius: email.radii.control,
          textAlign: "center",
        },
      }}
    >
      <code
        {...props}
        dir={dir}
        lang={lang}
        data-slot="email-code"
        style={{
          display: "block",
          ...emailTypeStyle("code"),
          color: colors.ink,
          letterSpacing: emailJoinedScript(lang) ? "normal" : "0.24em",
          textAlign: "center",
          overflowWrap: "anywhere",
          userSelect: "all",
        }}
      />
      {note !== undefined && (
        <p style={{ margin: "12px 0 0" }}>
          <EmailChip theme={theme} dir={dir} lang={lang}>
            {note}
          </EmailChip>
        </p>
      )}
    </EmailTable>
  );
}
