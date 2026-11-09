import { border } from "../../tokens.ts";
import type { BrandedEmailProps } from "../email.tsx";
import { EmailButton } from "../email-button.tsx";
import { EmailSection } from "../email-section.tsx";
import { emailAlignment, emailFonts, emailTypeStyle } from "../email-styles.ts";
import { EmailText } from "../email-text.tsx";
import { resolveEmailTheme } from "../email-theme.ts";
import { EmailTemplate } from "./email-template.tsx";

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
  paymentMethod?: string;
  /** Complete translated payment line, including the date and optional method. */
  paidText?: string;
  questionsText?: string;
}

/** A complete receipt email with end-aligned amounts, a bold total and an optional receipt link.
 * Use when: confirming a payment. Avoid when: building an interactive invoice or collecting payment.
 *
 * @example
 * <ReceiptEmail productName="Cedar Jobs" date="8 November 2026"
 *   items={[{ label: "Featured job listing", amount: "USD 49.00" }]} total="USD 49.00"
 *   receiptUrl="https://jobs.example.com/receipts/r1" />
 */
export function ReceiptEmail({
  productName,
  items,
  total,
  date,
  receiptUrl,
  paymentMethod,
  dir = "ltr",
  lang = "en",
  theme,
  heading = "Thanks for your purchase!",
  totalLabel = "Total",
  receiptLabel = "View full receipt",
  paidText = `Paid ${date}${paymentMethod ? ` · ${paymentMethod}` : ""}`,
  questionsText = "Questions? Just reply to this email.",
  ...props
}: ReceiptEmailProps) {
  const parts = { dir, lang, theme };
  const colors = resolveEmailTheme(theme);
  const end = emailAlignment(dir === "rtl" ? "ltr" : "rtl");
  const rowStyle = { padding: "12px 0", borderBottom: `${border} solid ${colors.line}` };
  return (
    <EmailTemplate {...props} {...parts} productName={productName} heading={heading} tone="sun">
      <p
        style={{
          margin: "0 0 8px",
          ...emailTypeStyle("code"),
          color: colors.ink,
          textAlign: "center",
          overflowWrap: "anywhere",
        }}
      >
        {total}
      </p>
      <EmailText {...parts} muted align="center">
        {paidText}
      </EmailText>
      <EmailSection dir={dir} lang={lang}>
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          dir={dir}
          lang={lang}
          style={{ ...emailTypeStyle("body"), tableLayout: "fixed" }}
        >
          <tbody>
            {items.map((item) => (
              <tr key={item.label}>
                <td
                  width="65%"
                  align={emailAlignment(dir)}
                  style={{ ...rowStyle, paddingInlineEnd: 16, textAlign: "start" }}
                >
                  {item.label}
                </td>
                <td align={end} style={{ ...rowStyle, textAlign: "end" }}>
                  {item.amount}
                </td>
              </tr>
            ))}
            <tr style={{ fontFamily: emailFonts.display, fontWeight: 700 }}>
              <td align={emailAlignment(dir)} style={{ padding: "12px 0", paddingInlineEnd: 16, textAlign: "start" }}>
                {totalLabel}
              </td>
              <td align={end} style={{ padding: "12px 0", textAlign: "end" }}>
                {total}
              </td>
            </tr>
          </tbody>
        </table>
      </EmailSection>
      {receiptUrl !== undefined && (
        <EmailSection dir={dir} lang={lang}>
          <EmailButton {...parts} href={receiptUrl} variant="secondary" align="center">
            {receiptLabel}
          </EmailButton>
        </EmailSection>
      )}
      <EmailText {...parts} muted align="center">
        {questionsText}
      </EmailText>
    </EmailTemplate>
  );
}
