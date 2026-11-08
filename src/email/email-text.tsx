import { emailAlignment, emailFonts, emailTypeStyle } from "./email-styles.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native paragraph props and a muted colour variant.
 * Use when: typing EmailText. Avoid when: naming a section; use EmailHeadingProps.
 */
export interface EmailTextProps extends EmailPartProps<"p"> {
  muted?: boolean;
}

/** Email body copy at 16px with a 24px line height, optionally muted.
 * Use when: explaining a sign-in link, receipt or digest. Avoid when: displaying a one-time code; use EmailCode.
 *
 * @example
 * <EmailText muted>You received this because you saved a frontend job alert.</EmailText>
 */
export function EmailText({ muted = false, theme, dir, ...props }: EmailTextProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <p
      {...props}
      dir={dir}
      data-slot="email-text"
      style={{
        margin: "0 0 16px",
        fontFamily: emailFonts.body,
        ...emailTypeStyle("body"),
        color: muted ? colors["ink-muted"] : colors.ink,
        textAlign: emailAlignment(dir),
        overflowWrap: "anywhere",
      }}
    />
  );
}
