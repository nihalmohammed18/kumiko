import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Character } from "./character.tsx";

it("keeps each body clip local to its character and stable across server renders", () => {
  const characters = createElement(
    "div",
    null,
    createElement(Character, { name: "pip" }),
    createElement(Character, { name: "pip", pose: "cheering" }),
  );
  const html = renderToStaticMarkup(characters);
  const ids = Array.from(html.matchAll(/<clipPath id="([^"]+)"/g), (match) => match[1]);
  const references = Array.from(html.matchAll(/clip-path="url\(#([^)]+)\)"/g), (match) => match[1]);
  expect(ids).toHaveLength(2);
  expect(new Set(ids).size).toBe(2);
  expect(references).toEqual(ids);
  expect(renderToStaticMarkup(characters)).toBe(html);
});
