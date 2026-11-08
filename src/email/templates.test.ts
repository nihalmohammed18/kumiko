import { createElement } from "react";
import { expect, it } from "vitest";
import {
  defaultEmailTheme,
  JobAlertDigestEmail,
  PlainEmail,
  ReceiptEmail,
  renderEmail,
  SignInEmail,
  VerifyEmail,
} from "./index.ts";

it("renders the templates with plain values and keeps the personal note unbranded", () => {
  const plain = createElement(
    PlainEmail,
    null,
    createElement("p", null, "Hello, ", createElement("a", { href: "https://example.com" }, "read my note")),
  );
  const emails = [
    createElement(SignInEmail, {
      productName: "Kumiko",
      url: "https://example.com/sign-in",
      code: "482019",
      expiresInMinutes: 15,
    }),
    createElement(VerifyEmail, { productName: "Kumiko", code: "482019", url: "https://example.com/verify" }),
    createElement(JobAlertDigestEmail, {
      productName: "Kumiko",
      alertName: "Product engineering",
      jobs: Array.from({ length: 12 }, (_, index) => ({
        title: `Product engineer ${index + 1}`,
        company: "Acme",
        location: "Remote",
        salary: "$120,000–$160,000",
        url: `https://example.com/jobs/${index + 1}`,
      })),
      manageUrl: "https://example.com/alerts/product-engineering",
    }),
    createElement(ReceiptEmail, {
      productName: "Kumiko",
      items: [{ label: "Kumiko Pro", amount: "$12.00" }],
      total: "$12.00",
      date: "November 8, 2026",
      receiptUrl: "https://example.com/receipt",
    }),
    plain,
  ];

  for (const email of emails) expect(renderEmail(email)).not.toContain("var(");
  const html = renderEmail(plain);
  expect(html).not.toContain(defaultEmailTheme.brand);
  expect(html).not.toContain("<img");
});
