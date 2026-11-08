import { EmailCard } from "../email-card.tsx";
import { EmailHeading } from "../email-heading.tsx";
import { EmailLink } from "../email-link.tsx";
import { EmailSection } from "../email-section.tsx";
import { EmailText } from "../email-text.tsx";
import { type BrandedEmailProps, EmailTemplate } from "./email-template.tsx";

/** An alert's jobs, management destination and replaceable English digest copy.
 * Use when: typing JobAlertDigestEmail. Avoid when: sending a single personal recommendation; use PlainEmailProps.
 */
export interface JobAlertDigestEmailProps extends BrandedEmailProps {
  productName: string;
  alertName: string;
  jobs: readonly { title: string; company: string; location?: string; salary?: string; url: string }[];
  manageUrl: string;
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
  dir = "ltr",
  lang = "en",
  theme,
  heading = `${alertName}: ${new Intl.NumberFormat(lang).format(jobs.length)} ${jobs.length === 1 ? "job" : "jobs"}`,
  title = `${productName} · ${heading}`,
  moreText = `and ${new Intl.NumberFormat(lang).format(jobs.length - 10)} more`,
  manageLabel = "Manage or stop this alert",
  ...props
}: JobAlertDigestEmailProps) {
  const parts = { dir, lang, theme };
  return (
    <EmailTemplate {...props} {...parts} title={title} heading={heading}>
      {jobs.slice(0, 10).map((job) => (
        <EmailSection key={job.url} dir={dir} lang={lang}>
          <EmailCard {...parts}>
            <EmailHeading {...parts} level={2}>
              <EmailLink {...parts} href={job.url}>
                {job.title}
              </EmailLink>
            </EmailHeading>
            <EmailText {...parts} muted>
              {job.company}
            </EmailText>
            {job.location && (
              <EmailText {...parts} muted>
                {job.location}
              </EmailText>
            )}
            {job.salary && (
              <EmailText {...parts} muted>
                {job.salary}
              </EmailText>
            )}
          </EmailCard>
        </EmailSection>
      ))}
      <EmailSection dir={dir} lang={lang}>
        {jobs.length > 10 && (
          <EmailText {...parts}>
            <EmailLink {...parts} href={manageUrl}>
              {moreText}
            </EmailLink>
          </EmailText>
        )}
        <EmailLink {...parts} href={manageUrl}>
          {manageLabel}
        </EmailLink>
      </EmailSection>
    </EmailTemplate>
  );
}
