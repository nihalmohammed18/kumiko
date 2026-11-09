import { email } from "../tokens.ts";
import { EmailHeading } from "./email-heading.tsx";
import { EmailImage } from "./email-image.tsx";
import { emailTypeStyle } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";
import { type EmailPartProps, type EmailTone, emailTintStyle, resolveEmailTheme } from "./email-theme.ts";

/** A hero's headline, supporting copy, optional PNG and accent family.
 * Use when: typing EmailHero. Avoid when: composing a personally written note.
 */
export interface EmailHeroProps extends Omit<EmailPartProps<"td">, "children"> {
  heading: string;
  subline?: string;
  art?: { src: string; alt: string; width?: number; height?: number } | null;
  tone?: EmailTone;
}

/** A centred tinted hero with optional art and a rounded display headline.
 * Use when: introducing a branded email inside EmailCard's hero prop. Avoid when: adding a second primary heading.
 *
 * @example
 * <EmailHero heading="Welcome back" subline="Your next role is waiting." tone="tide" />
 */
export function EmailHero({ heading, subline, art, tone = "brand", theme, dir, lang, ...props }: EmailHeroProps) {
  const colors = resolveEmailTheme(theme);
  const tint = emailTintStyle(colors, tone);
  const parts = { theme, dir, lang };
  return (
    <EmailTable
      dir={dir}
      lang={lang}
      cell={{
        ...props,
        align: "center",
        bgcolor: tint.backgroundColor,
        "data-slot": "email-hero",
        style: {
          padding: "32px 32px 28px",
          backgroundColor: tint.backgroundColor,
          borderStartStartRadius: email.radii.card,
          borderStartEndRadius: email.radii.card,
          textAlign: "center",
        },
      }}
    >
      {art && (
        <EmailTable dir={dir} lang={lang} cell={{ style: { paddingBottom: 16 } }}>
          <EmailImage {...art} width={art.width ?? 160} height={art.height ?? 160} dir={dir} lang={lang} />
        </EmailTable>
      )}
      <EmailHeading {...parts} align="center">
        {heading}
      </EmailHeading>
      {subline !== undefined && (
        <p
          dir={dir}
          lang={lang}
          style={{
            margin: 0,
            ...emailTypeStyle("subline"),
            color: tint.color,
            textAlign: "center",
            overflowWrap: "anywhere",
          }}
        >
          {subline}
        </p>
      )}
    </EmailTable>
  );
}
