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
