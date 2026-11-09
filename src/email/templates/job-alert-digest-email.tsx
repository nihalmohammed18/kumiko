import { border, email } from "../../tokens.ts";
import type { BrandedEmailProps } from "../email.tsx";
import { EmailButton } from "../email-button.tsx";
import { EmailChip } from "../email-chip.tsx";
import { EmailLink } from "../email-link.tsx";
import { EmailLogo, type EmailLogoProps } from "../email-logo.tsx";
import { EmailSection } from "../email-section.tsx";
import { emailAlignment, emailJoinedScript, emailTypeStyle } from "../email-styles.ts";
import { EmailTable } from "../email-table.tsx";
import { EmailText } from "../email-text.tsx";
import { emailTintStyle, emailTones, resolveEmailTheme } from "../email-theme.ts";
import { EmailTemplate } from "./email-template.tsx";

/** An alert's jobs, management destination and replaceable English digest copy.
 * Use when: typing JobAlertDigestEmail. Avoid when: sending a single personal recommendation; use PlainEmailProps.
 */
export interface JobAlertDigestEmailProps extends BrandedEmailProps {
  productName: string;
  alertName: string;
  jobs: readonly {
    title: string;
    company: string;
    location?: string;
    salary?: string;
    url: string;
    logo?: EmailLogoProps;
    tags?: string[];
  }[];
  manageUrl: string;
  viewAllUrl?: string;
  viewAllLabel?: string;
  /** Complete copy for the remaining count; the link uses manageUrl. */
  moreText?: string;
  manageLabel?: string;
}

/** A complete job alert digest showing up to ten linked job cards.
 * Use when: sending saved alert results. Avoid when: rendering every result; link to the alert for the remainder.
 *
 * @example
 * <JobAlertDigestEmail productName="Cedar Jobs" alertName="Frontend roles"
 *   jobs={[{ title: "Frontend engineer", company: "Cedar Labs", location: "Remote", url: "https://jobs.example.com/jobs/frontend" }]}
 *   manageUrl="https://jobs.example.com/alerts/frontend" />
 */
export function JobAlertDigestEmail({
  productName,
  alertName,
  jobs,
  manageUrl,
  viewAllUrl = manageUrl,
  dir = "ltr",
  lang = "en",
  theme,
  heading = `${new Intl.NumberFormat(lang).format(jobs.length)} new ${new Intl.PluralRules(lang).select(jobs.length) === "one" ? "job" : "jobs"} for ${alertName}`,
  subline = "Fresh matches since your last alert.",
  title = `${productName} · ${heading}`,
  moreText = `and ${new Intl.NumberFormat(lang).format(jobs.length - 10)} more`,
  manageLabel = "Manage or stop this alert",
  viewAllLabel = `See all ${new Intl.NumberFormat(lang).format(jobs.length)} ${new Intl.PluralRules(lang).select(jobs.length) === "one" ? "job" : "jobs"}`,
  footer,
  ...props
}: JobAlertDigestEmailProps) {
  const parts = { dir, lang, theme };
  const colors = resolveEmailTheme(theme);
  const chipSpacing = { display: "inline-block", maxWidth: "100%", marginInlineEnd: 6, marginBlockEnd: 4 } as const;
  return (
    <EmailTemplate
      {...props}
      {...parts}
      productName={productName}
      title={title}
      heading={heading}
      subline={subline}
      tone="tide"
      footer={{
        reason: `You're getting this because you set up the ${alertName} alert.`,
        ...footer,
        links: [
          ...(footer?.links ?? []).filter((link) => link.href !== manageUrl),
          { label: manageLabel, href: manageUrl },
        ],
      }}
    >
      {jobs.slice(0, 10).map((job) => {
        let hash = 0;
        for (const character of job.company) hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
        const tint = emailTintStyle(colors, emailTones[hash % emailTones.length]!);
        const initial = Array.from(job.company.trim())[0] ?? "?";
        return (
          <EmailTable key={job.url} dir={dir} lang={lang} cell={{ style: { paddingBottom: 12 } }}>
            <EmailTable
              dir={dir}
              lang={lang}
              data-slot="email-job-card"
              cell={{
                "data-slot": "email-card",
                bgcolor: colors.surface,
                style: {
                  padding: 16,
                  border: `${border} solid ${colors.line}`,
                  borderBottom: `${email.edges.job} solid ${colors["edge-neutral"]}`,
                  borderRadius: email.radii.control,
                  backgroundColor: colors.surface,
                },
              }}
            >
              <table
                role="presentation"
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                dir={dir}
                lang={lang}
                style={{ tableLayout: "fixed" }}
              >
                <tbody>
                  <tr>
                    <td width="60" valign="top" align={emailAlignment(dir)}>
                      <EmailTable
                        dir={dir}
                        lang={lang}
                        width="44"
                        style={{ width: 44 }}
                        cell={{
                          align: "center",
                          height: 44,
                          bgcolor: tint.backgroundColor,
                          "data-slot": "email-avatar",
                          style: {
                            ...tint,
                            borderRadius: email.radii.pill,
                            overflow: "hidden",
                            ...emailTypeStyle("header"),
                            textAlign: "center",
                            verticalAlign: "middle",
                          },
                        }}
                      >
                        {job.logo ? (
                          <EmailLogo {...job.logo} dir={dir} lang={lang} width={44} height={44} />
                        ) : emailJoinedScript(lang) ? (
                          initial
                        ) : (
                          initial.toLocaleUpperCase(lang)
                        )}
                      </EmailTable>
                    </td>
                    <td style={{ textAlign: "start", overflowWrap: "anywhere" }}>
                      <h2
                        style={{
                          margin: "0 0 4px",
                          ...emailTypeStyle("job"),
                        }}
                      >
                        <a
                          href={job.url}
                          style={{ color: colors["brand-text"], textDecoration: "none", cursor: "pointer" }}
                        >
                          {job.title}
                        </a>
                      </h2>
                      <p
                        style={{
                          margin: "0 0 8px",
                          ...emailTypeStyle("body"),
                          color: colors["ink-muted"],
                        }}
                      >
                        {job.company}
                        {job.location && ` · ${job.location}`}
                      </p>
                      <p style={{ margin: 0 }}>
                        {job.salary && (
                          <span style={chipSpacing}>
                            <EmailChip {...parts} tone="sun">
                              {job.salary}
                            </EmailChip>
                          </span>
                        )}
                        {job.tags?.map((tag) => (
                          <span key={tag} style={chipSpacing}>
                            <EmailChip {...parts}>{tag}</EmailChip>
                          </span>
                        ))}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </EmailTable>
          </EmailTable>
        );
      })}
      <EmailSection dir={dir} lang={lang}>
        {jobs.length > 10 && (
          <EmailText {...parts} muted align="center">
            <EmailLink {...parts} href={manageUrl}>
              {moreText}
            </EmailLink>
          </EmailText>
        )}
        <EmailButton {...parts} href={viewAllUrl} align="center">
          {viewAllLabel}
        </EmailButton>
      </EmailSection>
    </EmailTemplate>
  );
}
