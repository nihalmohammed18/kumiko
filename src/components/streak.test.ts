import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { KumikoProvider, type KumikoProviderProps } from "../provider.tsx";
import { Streak } from "./streak.tsx";

afterEach(() => vi.restoreAllMocks());

function render(locale: string) {
  const settings: KumikoProviderProps = {
    locale,
    children: createElement(Streak, { count: 12, today: "2027-01-01", done: ["2026-12-31"] }),
  };
  return renderToStaticMarkup(createElement(KumikoProvider, settings));
}

it("keeps a calendar week across the year boundary and names completed and current days", () => {
  const html = render("en-GB");
  expect(Array.from(html.matchAll(/data-date="([^"]+)"/g), (match) => match[1])).toEqual([
    "2026-12-28",
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-01",
    "2027-01-02",
    "2027-01-03",
  ]);
  expect(html).toMatch(/<ul[^>]*data-slot="streak-week"/);
  expect(html).toMatch(/<li[^>]*data-date="2027-01-01"[^>]*aria-current="date"/);
  expect(html).toContain("Thursday, Done");
  expect(html).toContain("Friday, Today");
  expect(html).toContain("lucide-check");
});

it("supports legacy weekInfo and falls back to Monday when week information is unavailable", () => {
  const Locale = vi.spyOn(Intl, "Locale");
  Locale.mockImplementation(
    class {
      weekInfo = { firstDay: 7 };
    } as unknown as typeof Intl.Locale,
  );
  expect(render("en")).toContain('data-date="2026-12-27"');
  Locale.mockImplementation(class {} as unknown as typeof Intl.Locale);
  expect(render("en")).toContain('data-date="2026-12-28"');
});
