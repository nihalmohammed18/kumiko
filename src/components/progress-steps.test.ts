import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ProgressSteps } from "./progress-steps.tsx";

it("keeps a label containing several React nodes in one segment without shifting the current step", () => {
  const html = renderToStaticMarkup(
    createElement(ProgressSteps, {
      steps: [["Pro", "file"], "Preferences", "Review"],
      current: 1,
      "aria-label": "Application steps",
    }),
  );
  expect(html.match(/<li\b/g)).toHaveLength(3);
  expect(html).toContain("Profile, completed");
  expect(html).toMatch(/<li[^>]*aria-current="step"[^>]*><span[^>]*>Preferences<\/span>/);
  expect(html).toContain("Review, not started");
});

it("visibly names the current step in an aria-hidden summary with localized numbers", () => {
  const html = renderToStaticMarkup(
    createElement(ProgressSteps, {
      steps: ["Profile", "Preferences", "Review"],
      current: 1,
      "aria-label": "Application steps",
      locale: "ar-u-nu-arab",
    }),
  );
  const summary = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/)?.[0];
  expect(summary).toContain('aria-hidden="true"');
  expect(summary).not.toContain("sr-only");
  expect(summary).toContain("Step ٢ of ٣ · ");
  expect(summary).toMatch(/<strong[^>]*>Preferences<\/strong>/);
});
