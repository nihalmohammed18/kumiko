import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { KumikoProvider, type KumikoProviderProps } from "../provider.tsx";
import { Streak, type StreakProps } from "./streak.tsx";

afterEach(() => vi.restoreAllMocks());

function render(locale: string, props?: Partial<StreakProps>) {
  const settings: KumikoProviderProps = {
    locale,
    children: createElement(Streak, { count: 12, today: "2027-01-01", done: ["2026-12-31"], ...props }),
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

it("shows a zero streak with its start hint and today's marker", () => {
  const html = render("en", { count: 0, done: [] });
  expect(html).toContain('data-state="zero"');
  expect(html).toContain("Start a streak today");
  const marker = html.match(/aria-current="date"[\s\S]*?data-slot="streak-today-marker" class="([^"]*)"/);
  expect(marker?.[1]).toBeDefined();
  expect(marker?.[1]).not.toContain("invisible");
});

it("shows a pending streak with a next-step hint and an inset ring on today", () => {
  const html = render("en");
  expect(html).toContain('data-state="pending"');
  expect(html).toContain("Practise today to keep your streak");
  expect(html).toMatch(/aria-current="date"[\s\S]*?data-slot="streak-mark" class="[^"]*ring-inset ring-brand-text/);
});

it("shows today's completed check and done hint", () => {
  const html = render("en", { done: ["2027-01-01"] });
  expect(html).toContain('data-state="done"');
  expect(html).toContain("Done for today. See you tomorrow!");
  expect(html).toMatch(/data-done="" aria-current="date"[\s\S]*?lucide-check/);
});

it("lets products replace the hint or hide its line", () => {
  expect(render("en", { hint: createElement("strong", null, "Apply today") })).toContain(
    "<strong>Apply today</strong>",
  );
  expect(render("en", { hint: false })).not.toContain('data-slot="streak-hint"');
});

it("formats remaining goal days with plurals and the provider's digits, and hides a reached goal", () => {
  expect(render("en", { goal: 13 })).toContain("1 more day to 13");
  expect(render("ur-u-nu-arabext", { goal: 14 })).toContain("۱۴ تک پہنچنے کے لیے مزید ۲ دن");
  expect(render("en", { goal: 12 })).not.toContain('data-slot="streak-goal"');
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
