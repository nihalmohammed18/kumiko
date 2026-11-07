import { expect, it } from "vitest";
import { formatLabel } from "./labels.ts";

it("selects and formats English singular and plural labels", () => {
  const label = { one: "{count} job", other: "{count} jobs" };
  expect(formatLabel(label, "en", 1)).toBe("1 job");
  expect(formatLabel(label, "en", 2)).toBe("2 jobs");
});

it("formats count placeholders with the locale's numbering system", () => {
  expect(formatLabel("{count} items", "ar-u-nu-arab", 12)).toBe("١٢ items");
});
