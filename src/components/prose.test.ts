import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Prose } from "./prose.tsx";

it("renders without a provider, keeps its slot and merges the consumer's class", () => {
  const html = renderToStaticMarkup(
    createElement(Prose, { className: "max-w-none", lang: "en" }, createElement("p", null, "Hi")),
  );
  expect(html).toBe('<div lang="en" data-slot="prose" class="kumiko-prose max-w-none"><p>Hi</p></div>');
});
