import type { ComponentProps } from "react";
import { emailAlignment } from "./email-styles.ts";

/** Native cell props for a vertically spaced email section.
 * Use when: typing EmailSection. Avoid when: styling a bordered content group; use EmailCardProps.
 */
export interface EmailSectionProps extends Omit<ComponentProps<"td">, "className" | "style"> {}

/** A full-width layout table that adds vertical space around a group of email parts.
 * Use when: separating an email's content groups. Avoid when: inserting spacing within a sentence.
 */
export function EmailSection({ children, dir, ...props }: EmailSectionProps) {
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" dir={dir} style={{ tableLayout: "fixed" }}>
      <tbody>
        <tr>
          <td
            {...props}
            dir={dir}
            align={emailAlignment(dir)}
            data-slot="email-section"
            style={{ padding: "12px 0", textAlign: emailAlignment(dir) }}
          >
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
