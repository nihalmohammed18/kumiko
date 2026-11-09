import type { ReactNode } from "react";
import { border, email } from "../tokens.ts";
import { emailAlignment } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Native cell props and an explicit theme for a bordered email group.
 * Use when: typing EmailCard. Avoid when: adding unbordered vertical spacing; use EmailSectionProps.
 */
export interface EmailCardProps extends EmailPartProps<"td"> {
  /** An unpadded top panel, usually EmailHero; the body retains its responsive padding. */
  hero?: ReactNode;
}

/** A table-backed card with 24px corners, a darker lower edge and responsive body padding.
 * Use when: grouping a branded email's hero and body. Avoid when: styling the canvas or footer; use Email and EmailFooter.
 *
 * @example
 * <EmailCard><EmailHeading level={2}>Frontend engineer</EmailHeading><EmailText>Cedar Labs · Remote</EmailText></EmailCard>
 */
export function EmailCard({ theme, dir, lang, hero, children, ...props }: EmailCardProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <EmailTable
      dir={dir}
      lang={lang}
      cell={{
        ...props,
        bgcolor: colors.surface,
        "data-slot": "email-card",
        style: {
          padding: 0,
          border: `${border} solid ${colors.line}`,
          borderBottom: `${email.edges.card} solid ${colors["edge-neutral"]}`,
          borderRadius: email.radii.card,
          overflow: "hidden",
          backgroundColor: colors.surface,
          color: colors.ink,
        },
      }}
    >
      {hero}
      <EmailTable
        dir={dir}
        lang={lang}
        cell={{
          "data-slot": "email-content",
          style: { padding: 32, textAlign: emailAlignment(dir), overflowWrap: "anywhere" },
        }}
      >
        {children}
      </EmailTable>
    </EmailTable>
  );
}
