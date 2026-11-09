import type { ReactNode } from "react";
import { type BrandedEmailProps, Email } from "../email.tsx";
import { EmailCard } from "../email-card.tsx";
import { EmailFooter } from "../email-footer.tsx";
import { EmailHero } from "../email-hero.tsx";
import { EmailLogo } from "../email-logo.tsx";
import { emailTypeStyle } from "../email-styles.ts";
import { EmailTable } from "../email-table.tsx";
import { type EmailTone, resolveEmailTheme } from "../email-theme.ts";

/** The shared header, hero card and canvas footer for branded emails.
 * Use when: implementing a ready-made branded email. Avoid when: styling a personal note.
 */
export function EmailTemplate({
  heading,
  title = heading,
  preview = heading,
  logo,
  productName,
  art,
  subline,
  footer,
  tone = "brand",
  fontHref,
  theme,
  dir,
  lang,
  children,
}: BrandedEmailProps & { productName: string; heading: string; tone?: EmailTone; children: ReactNode }) {
  const parts = { theme, dir, lang };
  const colors = resolveEmailTheme(theme);
  return (
    <Email {...parts} title={title} preview={preview} fontHref={fontHref}>
      <EmailTable
        dir={dir}
        lang={lang}
        cell={{ align: "center", "data-slot": "email-header", style: { paddingBottom: 24, textAlign: "center" } }}
      >
        {logo && (
          <EmailTable
            dir={dir}
            lang={lang}
            width="40"
            align="center"
            style={{ width: 40, marginInlineStart: "auto", marginInlineEnd: "auto" }}
            cell={{ align: "center", style: { paddingBottom: 8 } }}
          >
            <EmailLogo {...logo} dir={dir} lang={lang} width={40} height={40} />
          </EmailTable>
        )}
        <p
          style={{
            margin: 0,
            ...emailTypeStyle("header"),
            color: colors.ink,
            overflowWrap: "anywhere",
          }}
        >
          {productName}
        </p>
      </EmailTable>
      <EmailCard {...parts} hero={<EmailHero {...parts} heading={heading} subline={subline} art={art} tone={tone} />}>
        {children}
      </EmailCard>
      <EmailFooter {...footer} {...parts} />
    </Email>
  );
}
