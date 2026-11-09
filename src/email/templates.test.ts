import { createElement } from "react";
import { expect, it } from "vitest";
import {
  defaultEmailTheme,
  emailArt,
  JobAlertDigestEmail,
  PlainEmail,
  ReceiptEmail,
  renderEmail,
  SignInEmail,
  VerifyEmail,
} from "./index.ts";

const jobs = Array.from({ length: 12 }, (_, index) => ({
  title: `Product engineer ${index + 1}`,
  company: "Acme",
  location: "Remote",
  salary: "$120,000–$160,000",
  url: `https://example.com/jobs/${index + 1}`,
}));

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
      jobs,
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
  expect(html).not.toContain('data-slot="email-card"');
  expect(html.match(/<style\b/g)).toHaveLength(1);
  expect(html).toContain("font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:22px");
  expect(html).toContain("text-decoration:underline");
});

it("caps digest cards at ten and retains the management path with custom footer links", () => {
  const manageUrl = "https://example.com/alerts/product-engineering";
  const html = renderEmail(
    createElement(JobAlertDigestEmail, {
      productName: "Kumiko",
      alertName: "Product engineering",
      jobs,
      manageUrl,
      footer: { links: [{ label: "Help", href: "https://example.com/help" }] },
    }),
  );
  expect(html.match(/data-slot="email-job-card"/g)).toHaveLength(10);
  expect(html).not.toContain("Product engineer 11");
  const footer = html.slice(html.indexOf('data-slot="email-footer"'));
  expect(footer).toContain(`href="${manageUrl}"`);
  expect(footer).toContain("Manage or stop this alert");
});

it("gives every email image explicit alternative text and display dimensions", () => {
  const logo = { src: "cid:company-logo", width: 88, height: 88, alt: "Acme" };
  const html = renderEmail(
    createElement(JobAlertDigestEmail, {
      productName: "Kumiko",
      alertName: "Product engineering",
      jobs: [{ ...jobs[0]!, logo }],
      manageUrl: "https://example.com/alerts",
      logo,
      art: emailArt("pip-cheering", "https://example.com/email-art"),
    }),
  );
  const images = html.match(/<img\b[^>]*>/g) ?? [];
  expect(images).toHaveLength(3);
  for (const image of images) {
    expect(image).toMatch(/alt="[^"]+"/);
    expect(image).toMatch(/width="\d+"/);
    expect(image).toMatch(/height="\d+"/);
    expect(image).toContain("display:block");
    expect(image).toContain("border:0");
  }
});
