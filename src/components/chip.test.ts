import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Chip, ChipGroup } from "./chip.tsx";

it("resolves chips' pressed state from the group's values and defaults to combining filters", () => {
  const html = renderToStaticMarkup(
    createElement(
      ChipGroup,
      { "aria-label": "Job filters", defaultValue: ["remote", "paid"] },
      createElement(Chip, { value: "remote" }, "Remote"),
      createElement(Chip, { value: "paid" }, "Paid"),
      createElement(Chip, { value: "visa", disabled: true }, "Visa sponsor"),
    ),
  );
  expect(html).toContain('data-multiple=""');
  expect(html.match(/<button\b[^>]*aria-pressed="true"/g)).toHaveLength(2);
  const disabled = html.match(/<button\b[^>]*>/g)?.find((button) => button.includes('data-disabled=""'));
  expect(disabled).toContain('disabled=""');
  expect(disabled).toContain('aria-pressed="false"');
});
