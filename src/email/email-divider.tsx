import { border } from "../tokens.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native separator props and an explicit email theme.
 * Use when: typing EmailDivider. Avoid when: adding space without a line; use EmailSectionProps.
 */
export interface EmailDividerProps extends EmailPartProps<"hr"> {}

/** A two-pixel divider in the email theme's line colour.
 * Use when: separating email topics. Avoid when: boxing a digest item or receipt; use EmailCard.
 *
 * @example
 * <><EmailText>Your saved roles</EmailText><EmailDivider /><EmailText>Manage your alert anytime.</EmailText></>
 */
export function EmailDivider({ theme, ...props }: EmailDividerProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <hr
      {...props}
      data-slot="email-divider"
      style={{ margin: "16px 0", border: 0, height: border, backgroundColor: colors.line, color: colors.line }}
    />
  );
}
