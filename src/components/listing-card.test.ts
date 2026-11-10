import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ListingCard } from "./listing-card.tsx";

const slots = (html: string) => Array.from(html.matchAll(/data-slot="(listing-card-[a-z]+)"/g), (match) => match[1]);

it("renders only the parts it is given, and treats 0 as content", () => {
  expect(slots(renderToStaticMarkup(createElement(ListingCard, { title: "Python basics" })))).toEqual([
    "listing-card-header",
  ]);
  const html = renderToStaticMarkup(
    createElement(ListingCard, { title: "Python basics", titleLevel: 2, media: false, highlight: 0, action: "Save" }),
  );
  expect(slots(html)).toEqual([
    "listing-card-header",
    "listing-card-footer",
    "listing-card-highlight",
    "listing-card-action",
  ]);
  expect(html).toMatch(/<h2[^>]*data-slot="card-title"/);
  expect(html).toContain('data-slot="card"');
});
