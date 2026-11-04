import { describe, expect, it } from "vitest";
import { sizeProblems } from "./size.ts";

describe("gzip size budget", () => {
  it("allows reductions and exactly 10% growth", () => {
    expect(sizeProblems({ all: 110, button: 90 }, { all: 100, button: 100 })).toEqual([]);
  });

  it("reports every entry more than 10% over its own baseline", () => {
    const problems = sizeProblems(
      { all: 110, button: 111, tokens: 80, css: 220 },
      { all: 100, button: 100, tokens: 100, css: 200 },
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("button");
    expect(sizeProblems({ button: 111, css: 221 }, { button: 100, css: 200 })).toHaveLength(2);
  });

  it("fails when a baseline entry is missing or invalid", () => {
    expect(sizeProblems({ button: 100 }, {})).toHaveLength(1);
    for (const baseline of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
      expect(sizeProblems({ button: 100 }, { button: baseline })).toHaveLength(1);
  });
});
