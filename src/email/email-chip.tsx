import { email } from "../tokens.ts";
import { emailTypeStyle } from "./email-styles.ts";
import { type EmailPartProps, type EmailTone, emailTintStyle, resolveEmailTheme } from "./email-theme.ts";

/** Native span props and an accent for an email pill.
 * Use when: typing EmailChip. Avoid when: creating an interactive filter; email chips are text.
 */
export interface EmailChipProps extends EmailPartProps<"span"> {
  tone?: EmailTone | "neutral";
}

/** A small rounded text pill on a neutral or accent tint.
 * Use when: showing expiry, salary or job tags. Avoid when: presenting an email action; use EmailButton.
 *
 * @example
 * <EmailChip tone="sun">USD 120,000–160,000</EmailChip>
 */
export function EmailChip({ tone = "neutral", theme, ...props }: EmailChipProps) {
  return (
    <span
      {...props}
      data-slot="email-chip"
      style={{
        ...emailTintStyle(resolveEmailTheme(theme), tone),
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: email.radii.pill,
        ...emailTypeStyle("chip"),
        fontWeight: 700,
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowWrap: "anywhere",
      }}
    />
  );
}
