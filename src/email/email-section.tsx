import type { ComponentProps } from "react";
import { emailAlignment } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";

/** Native cell props for a vertically spaced email section.
 * Use when: typing EmailSection. Avoid when: styling a bordered content group; use EmailCardProps.
 */
export interface EmailSectionProps extends Omit<ComponentProps<"td">, "className" | "style"> {}

/** A full-width layout table that adds vertical space around a group of email parts.
 * Use when: separating an email's content groups. Avoid when: inserting spacing within a sentence.
 *
 * @example
 * <EmailSection><EmailHeading>New jobs for you</EmailHeading><EmailText>Your saved alert has a match.</EmailText></EmailSection>
 */
export function EmailSection({ children, dir, lang, ...props }: EmailSectionProps) {
  return (
    <EmailTable
      dir={dir}
      lang={lang}
      cell={{
        ...props,
        "data-slot": "email-section",
        style: { padding: "12px 0", textAlign: emailAlignment(dir) },
      }}
    >
      {children}
    </EmailTable>
  );
}
