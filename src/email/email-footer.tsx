import { Fragment } from "react";
import { emailTypeStyle } from "./email-styles.ts";
import { EmailTable } from "./email-table.tsx";
import { type EmailPartProps, resolveEmailTheme } from "./email-theme.ts";

/** Optional reason, destinations and extra content for a canvas footer.
 * Use when: typing EmailFooter. Avoid when: assuming it adds a postal address or unsubscribe destination.
 */
export interface EmailFooterProps extends EmailPartProps<"td"> {
  reason?: string;
  links?: readonly { label: string; href: string }[];
}

/** A centred muted footer below a branded email card.
 * Use when: explaining delivery or providing account and unsubscribe links. Avoid when: writing a personal note.
 *
 * @example
 * <EmailFooter reason="You saved a frontend job alert."
 *   links={[{ label: "Manage or stop this alert", href: "https://jobs.example.com/alerts/frontend" }]} />
 */
export function EmailFooter({ reason, links, children, theme, dir, lang, ...props }: EmailFooterProps) {
  const colors = resolveEmailTheme(theme);
  return (
    <EmailTable
      dir={dir}
      lang={lang}
      cell={{
        ...props,
        align: "center",
        bgcolor: colors.canvas,
        "data-slot": "email-footer",
        style: {
          padding: "24px 0 0",
          backgroundColor: colors.canvas,
          color: colors["ink-muted"],
          ...emailTypeStyle("footer"),
          textAlign: "center",
          overflowWrap: "anywhere",
        },
      }}
    >
      {reason !== undefined && <p style={{ margin: "0 0 8px" }}>{reason}</p>}
      {links && links.length > 0 && (
        <p style={{ margin: "0 0 8px" }}>
          {links.map((link, index) => (
            <Fragment key={link.href + link.label}>
              {index > 0 && " · "}
              <a
                href={link.href}
                style={{ color: colors["ink-muted"], textDecoration: "underline", cursor: "pointer" }}
              >
                {link.label}
              </a>
            </Fragment>
          ))}
        </p>
      )}
      {children}
    </EmailTable>
  );
}
