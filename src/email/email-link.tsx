import { emailFonts } from "./email-styles.ts";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native anchor props and an explicit email theme.
 * Use when: typing EmailLink. Avoid when: typing the primary call to action; use EmailButtonProps.
 */
export interface EmailLinkProps extends EmailPartProps<"a"> {
  href: string;
}

/** An underlined brand-coloured email link.
 * Use when: linking a phrase or a secondary destination. Avoid when: presenting the primary destination; use EmailButton.
 *
 * @example
 * <EmailText><EmailLink href="https://jobs.example.com/alerts">Manage your job alerts</EmailLink>.</EmailText>
 */
export function EmailLink({ theme, ...props }: EmailLinkProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <a
      {...props}
      data-slot="email-link"
      style={{
        color: colors.brand,
        fontFamily: emailFonts.body,
        textDecoration: "underline",
        overflowWrap: "anywhere",
        cursor: "pointer",
      }}
    />
  );
}
