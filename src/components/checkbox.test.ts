import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Checkbox } from "./checkbox.tsx";
import { CheckboxGroup } from "./checkbox-group.tsx";
import { Field, FieldLabel } from "./field.tsx";

it("uses the group's resolved mixed state for a parent checkbox's mark", () => {
  const html = renderToStaticMarkup(
    createElement(
      CheckboxGroup,
      { value: ["daily"], allValues: ["daily", "weekly"], "aria-label": "Schedule" },
      createElement(Checkbox, { parent: true }, "All schedules"),
    ),
  );
  expect(html).toContain('aria-checked="mixed"');
  expect(html).toContain("lucide-minus");
  expect(html).not.toContain("lucide-check");
});

it("keeps a checkbox without children composable with FieldLabel and named form inputs", () => {
  const html = renderToStaticMarkup(
    createElement(
      Field,
      { name: "terms" },
      createElement(FieldLabel, null, "Accept terms"),
      createElement(Checkbox, { id: "terms", value: "accepted", defaultChecked: true, required: true }),
    ),
  );
  expect(html.match(/<label\b/g)).toHaveLength(1);
  expect(html).toContain('role="checkbox"');
  const labelFor = /<label\b[^>]*for="([^"]+)"/.exec(html)?.[1];
  const input = /<input\b[^>]*>/.exec(html)?.[0];
  expect(labelFor).toBeTruthy();
  expect(input).toContain(`id="${labelFor}"`);
  expect(input).toContain('required=""');
  expect(input).toContain('name="terms"');
  expect(input).toContain('value="accepted"');
});

it("keeps the hidden input outside a native button's wrapping label", () => {
  const html = renderToStaticMarkup(
    createElement(
      Checkbox,
      { nativeButton: true, render: createElement("button", { type: "button", "data-consumer": "kept" }) },
      "Accept terms",
    ),
  );
  const label = /<label\b[\s\S]*?<\/label>/.exec(html)?.[0];
  expect(label).toContain("<button");
  expect(label).toContain('data-consumer="kept"');
  expect(label).toContain("Accept terms");
  expect(label).not.toContain("<input");
  expect(html).toContain("<input");
});
