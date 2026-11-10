import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { KumikoProvider, type KumikoProviderProps } from "../provider.tsx";
import { Rating, type RatingProps } from "./rating.tsx";

function render(props: RatingProps, locale = "en") {
  const settings: KumikoProviderProps = { locale, children: createElement(Rating, props) };
  return renderToStaticMarkup(createElement(KumikoProvider, settings));
}

it("fills stars to the average rounded to one decimal, and names it with the count", () => {
  const html = render({ value: 4.66, count: 12345 });
  expect(Array.from(html.matchAll(/inline-size:(\d+)%/g), (match) => match[1])).toEqual([
    "100",
    "100",
    "100",
    "100",
    "70",
  ]);
  expect(html).toContain(">4.7<");
  expect(html).toContain(">(12,345)<");
  expect(html).toContain("Rated 4.7 out of 5 from 12,345 ratings");
});

it("clamps values outside the range and treats a missing number as zero", () => {
  expect(render({ value: 6.2 })).toContain("Rated 5.0 out of 5");
  expect(render({ value: Number.NaN })).toContain("Rated 0.0 out of 5");
});

it("uses the singular label for one rating", () => {
  expect(render({ value: 3, count: 1 })).toContain("Rated 3.0 out of 5 from 1 rating<");
});

it("says there are no ratings yet instead of showing a zero score", () => {
  const html = render({ value: 0, count: 0 });
  expect(html).toContain("No ratings yet");
  expect(html).not.toContain('data-slot="rating-star"');
});

it("translates the label and uses the locale's digits", () => {
  expect(render({ value: 4.5, count: 3 }, "ar-u-nu-arab")).toContain("التقييم ٤٫٥ من ٥ بناءً على ٣ تقييمات");
});
