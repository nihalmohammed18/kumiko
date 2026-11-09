import { createElement } from "react";
import { expect, it } from "vitest";
import {
  Email,
  EmailButton,
  EmailCard,
  EmailCode,
  EmailDivider,
  EmailHeading,
  EmailLink,
  EmailLogo,
  EmailSection,
  EmailText,
  emailArt,
  renderEmail,
} from "./index.ts";

it("renders a complete email kit with inline plain values", () => {
  const html = renderEmail(
    createElement(
      Email,
      { title: "Your Kumiko sign-in link", preview: "Sign in or use your one-time code." },
      createElement(
        EmailSection,
        null,
        createElement(EmailLogo, { src: "cid:kumiko-logo", width: 48, height: 48, alt: "Kumiko" }),
        createElement(EmailHeading, null, "Welcome back"),
        createElement(EmailText, null, "Use your secure sign-in link."),
        createElement(EmailButton, { href: "https://example.com/sign-in" }, "Sign in"),
        createElement(EmailCode, null, "482019"),
        createElement(EmailDivider),
        createElement(
          EmailCard,
          null,
          createElement(EmailHeading, { level: 2 }, "Your receipt"),
          createElement(EmailText, null, "Payment received."),
        ),
        createElement(
          EmailText,
          { muted: true },
          "Need help? ",
          createElement(EmailLink, { href: "https://example.com/help" }, "Contact us"),
        ),
      ),
    ),
  );

  expect(html).toMatch(/^<!doctype html><html lang="en" dir="ltr"/);
  expect(html).toContain("Sign in or use your one-time code.");
  expect(html).toContain("Your receipt");
  expect(html).toContain(">SIGN IN</a>");
  expect(html).not.toContain("var(");
  expect(html).not.toContain("class=");

  const direction = { dir: "rtl", lang: "ar" } as const;
  const rtl = renderEmail(
    createElement(
      Email,
      { ...direction, title: "تسجيل الدخول", preview: "رمز تسجيل الدخول" },
      createElement(
        EmailButton,
        { ...direction, align: "start", href: "https://example.com/sign-in" },
        "Kumiko · تسجيل الدخول",
      ),
      createElement(EmailCode, direction, "482019"),
    ),
  );
  expect(rtl).toContain('align="right"');
  expect(rtl).toContain(">Kumiko · تسجيل الدخول</a>");
  const code = rtl.match(/<code\b[^>]*>[^<]*<\/code>/)?.[0];
  expect(code).toContain("letter-spacing:normal");
  expect(code).toContain("482019");
});

it("builds public art URLs with display dimensions and meaningful alternative text", () => {
  expect(emailArt("pip-waving", "https://example.com/email-art/")).toEqual({
    src: "https://example.com/email-art/pip-waving.png",
    width: 160,
    height: 160,
    alt: "Pip waving hello",
  });
});

it("applies a custom theme brand to the button's cell and clickable link", () => {
  const theme = { brand: "#174EA6" };
  const html = renderEmail(
    createElement(
      Email,
      { title: "Sign in", preview: "Your secure sign-in link.", theme },
      createElement(EmailButton, { href: "https://example.com/sign-in", theme }, "Sign in"),
    ),
  );

  expect(html).toContain('bgcolor="#174EA6"');
  const link = html.match(/<a\b[^>]*data-slot="email-button"[^>]*>/)?.[0];
  expect(link).toContain('href="https://example.com/sign-in"');
  expect(link).toContain("background-color:#174EA6");
});

it("adds exactly one stylesheet link only when web fonts are opted in", () => {
  const props = { title: "Sign in", preview: "Your secure sign-in link." };
  expect(renderEmail(createElement(Email, props))).not.toContain('rel="stylesheet"');
  const html = renderEmail(createElement(Email, { ...props, fontHref: "https://example.com/email-fonts.css" }));
  expect(html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/g)).toHaveLength(1);
  expect(html).toContain('href="https://example.com/email-fonts.css"');
});
