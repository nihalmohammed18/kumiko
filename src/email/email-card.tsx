import { border, radii } from "../tokens.ts";
import { emailAlignment } from "./email-styles.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native cell props and an explicit theme for a bordered email group.
 * Use when: typing EmailCard. Avoid when: adding unbordered vertical spacing; use EmailSectionProps.
 */
export interface EmailCardProps extends EmailPartProps<"td"> {}

/** A table-backed content box with a two-pixel border and 20px corners.
 * Use when: grouping a digest item or receipt block. Avoid when: wrapping the whole email; use Email.
 *
 * @example
 * <EmailCard><EmailHeading level={2}>Frontend engineer</EmailHeading><EmailText>Cedar Labs · Remote</EmailText></EmailCard>
 */
export function EmailCard({ theme, dir, children, ...props }: EmailCardProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      dir={dir}
      bgcolor={colors.surface}
      style={{ borderCollapse: "separate", tableLayout: "fixed" }}
    >
      <tbody>
        <tr>
          <td
            {...props}
            dir={dir}
            align={emailAlignment(dir)}
            data-slot="email-card"
            style={{
              padding: 24,
              border: `${border} solid ${colors.line}`,
              borderRadius: radii.card,
              backgroundColor: colors.surface,
              color: colors.ink,
              textAlign: emailAlignment(dir),
              overflowWrap: "anywhere",
            }}
          >
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
