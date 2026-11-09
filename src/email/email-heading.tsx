import { emailAlignment, emailTypeStyle } from "./email-styles.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native heading props and the email heading's level.
 * Use when: typing EmailHeading. Avoid when: writing body copy; use EmailTextProps.
 */
export interface EmailHeadingProps extends EmailPartProps<"h1"> {
  level?: 1 | 2;
  align?: "center" | "start";
}

/** A Fredoka-first heading with email-safe fallback fonts and token type sizes.
 * Use when: naming an email or its sections. Avoid when: adding supporting body copy; use EmailText.
 *
 * @example
 * <EmailHeading level={2}>New frontend roles this week</EmailHeading>
 */
export function EmailHeading({ level = 1, align = "start", theme, dir, ...props }: EmailHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2";
  const colors = resolveEmailTheme(theme);
  return (
    <Heading
      {...props}
      dir={dir}
      data-slot="email-heading"
      style={{
        margin: "0 0 12px",
        ...emailTypeStyle(level === 1 ? "headline" : "title"),
        color: colors.ink,
        textAlign: align === "center" ? "center" : emailAlignment(dir),
        overflowWrap: "anywhere",
      }}
    />
  );
}
