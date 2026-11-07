import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ProgressRing } from "./progress-ring.tsx";

it("keeps the arc and localized accessible value in sync for a goal range and a clamped value", () => {
  const render = (value: number) =>
    renderToStaticMarkup(
      createElement(ProgressRing, { value, min: 1, max: 5, locale: "ar-u-nu-arab", "aria-label": "Goal" }),
    );
  const halfway = render(3);
  const offset = Number(/stroke-dashoffset="([^"]+)"/.exec(halfway)?.[1]);
  expect(offset).toBeCloseTo(Math.PI * 45);
  expect(halfway).toContain('aria-valuenow="3"');
  expect(halfway).toContain(new Intl.NumberFormat("ar-u-nu-arab", { style: "percent" }).format(0.5));
  const complete = render(9);
  expect(complete).toContain('aria-valuenow="5"');
  expect(complete).toContain('stroke-dashoffset="0"');
});

it("hides the round-capped arc at zero so it cannot draw a dot", () => {
  const html = renderToStaticMarkup(createElement(ProgressRing, { value: 0, "aria-label": "Goal", showValue: false }));
  expect(html).toMatch(/<circle[^>]*data-slot="progress-ring-indicator"[^>]*visibility="hidden"/);
  expect(html).not.toContain('data-slot="progress-ring-centre"');
});
