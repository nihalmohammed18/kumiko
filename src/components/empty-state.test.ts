import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { EmptyState } from "./empty-state.tsx";

it("announces region failures as alerts while leaving empty collections quiet", () => {
  expect(renderToStaticMarkup(createElement(EmptyState, { title: "No applications yet" }))).not.toContain(
    'role="alert"',
  );
  expect(
    renderToStaticMarkup(
      createElement(EmptyState, { title: "Couldn't load applications", status: "error", role: "region" }),
    ),
  ).toContain('role="alert"');
});
