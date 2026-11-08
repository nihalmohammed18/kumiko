import { EmailCard } from "../email-card.tsx";
import { EmailLink } from "../email-link.tsx";
import { EmailSection } from "../email-section.tsx";
import { emailAlignment, emailFonts, emailTypeStyle } from "../email-styles.ts";
import { EmailText } from "../email-text.tsx";
import { type BrandedEmailProps, EmailTemplate } from "./email-template.tsx";

/** Receipt rows, caller-formatted amounts and date, and replaceable English copy.
 * Use when: typing ReceiptEmail. Avoid when: calculating or formatting money; the caller supplies display strings.
 */
export interface ReceiptEmailProps extends BrandedEmailProps {
  productName: string;
  items: readonly { label: string; amount: string }[];
  total: string;
  date: string;
  receiptUrl?: string;
  totalLabel?: string;
  receiptLabel?: string;
}

/** A complete receipt email with end-aligned amounts, a bold total and an optional receipt link.
 * Use when: confirming a payment. Avoid when: building an interactive invoice or collecting payment.
 */
export function ReceiptEmail({
  productName,
  items,
  total,
  date,
  receiptUrl,
  dir = "ltr",
  lang = "en",
  theme,
  heading = `Receipt from ${productName}`,
  totalLabel = "Total",
  receiptLabel = "View full receipt",
  ...props
}: ReceiptEmailProps) {
  const parts = { dir, lang, theme };
  const end = emailAlignment(dir === "rtl" ? "ltr" : "rtl");
  return (
    <EmailTemplate {...props} {...parts} heading={heading}>
      <EmailSection dir={dir} lang={lang}>
        <EmailCard {...parts}>
          <EmailText {...parts} muted>
            {date}
          </EmailText>
          <table
            role="presentation"
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            dir={dir}
            lang={lang}
            style={{ fontFamily: emailFonts.body, ...emailTypeStyle("body"), tableLayout: "fixed" }}
          >
            <tbody>
              {items.map((item) => (
                <tr key={item.label}>
                  <td width="65%" style={{ padding: "8px 0", paddingInlineEnd: 16 }}>
                    {item.label}
                  </td>
                  <td align={end} style={{ padding: "8px 0", textAlign: "end" }}>
                    {item.amount}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: "8px 0", paddingInlineEnd: 16 }}>
                  <strong>{totalLabel}</strong>
                </td>
                <td align={end} style={{ padding: "8px 0", textAlign: "end" }}>
                  <strong>{total}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </EmailCard>
      </EmailSection>
      {receiptUrl !== undefined && (
        <EmailSection dir={dir} lang={lang}>
          <EmailLink {...parts} href={receiptUrl}>
            {receiptLabel}
          </EmailLink>
        </EmailSection>
      )}
    </EmailTemplate>
  );
}
