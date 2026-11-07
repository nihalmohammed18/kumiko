import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ChoiceTile, ChoiceTileGroup } from "./choice-tile.tsx";

it("renders a controlled single choice as a native radio with a separate title, description and disabled check badge", () => {
  const html = renderToStaticMarkup(
    createElement(
      ChoiceTileGroup,
      { "aria-label": "Role", name: "role", value: "full-time" },
      createElement(ChoiceTile, { value: "internship" }, "Internship"),
      createElement(
        ChoiceTile,
        { value: "full-time", description: "Forty hours a week.", disabled: true },
        "Full-time",
      ),
    ),
  );
  const selected = /<button\b[^>]*aria-checked="true"[^>]*>[\s\S]*?<\/button>/.exec(html)?.[0];
  const titleId = /aria-labelledby="([^"]+)"/.exec(selected ?? "")?.[1];
  const descriptionId = /aria-describedby="([^"]+)"/.exec(selected ?? "")?.[1];
  expect(selected).toContain('role="radio"');
  expect(selected).toContain('disabled=""');
  expect(selected).toContain('data-slot="choice-tile-check"');
  expect(titleId).toBeTruthy();
  expect(descriptionId).toBeTruthy();
  expect(titleId).not.toBe(descriptionId);
  expect(selected).toContain(`id="${titleId}"`);
  expect(selected).toContain(`id="${descriptionId}"`);
  expect(html).toMatch(/<input\b[^>]*name="role"[^>]*value="full-time"/);
});

it("renders multiple selected values as checkboxes without passing multiple to the DOM", () => {
  const html = renderToStaticMarkup(
    createElement(
      ChoiceTileGroup,
      { multiple: true, "aria-label": "Roles", defaultValue: ["internship", "part-time"] },
      createElement(ChoiceTile, { value: "internship" }, "Internship"),
      createElement(ChoiceTile, { value: "full-time" }, "Full-time"),
      createElement(ChoiceTile, { value: "part-time" }, "Part-time"),
    ),
  );
  expect(html.match(/<button\b[^>]*role="checkbox"/g)).toHaveLength(3);
  expect(html.match(/<button\b[^>]*aria-checked="true"/g)).toHaveLength(2);
  expect(html.match(/<button\b[^>]*aria-checked="false"/g)).toHaveLength(1);
  expect(html).not.toMatch(/\smultiple=/);
});
