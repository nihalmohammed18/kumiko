import { describe, expect, it } from "vitest";
import { lintComponent, lintStory } from "./check.ts";

describe("lintComponent", () => {
  const flags = (cls: string) => lintComponent(`const c = "${cls}";`, "x.tsx").length > 0;

  it("flags physical direction classes", () => {
    for (const cls of [
      "ml-2",
      "-mr-1",
      "pl-4",
      "hover:pr-2",
      "left-0",
      "right-1/2",
      "border-l",
      "rounded-tr-md",
      "text-left",
    ])
      expect(flags(cls), cls).toBe(true);
  });

  it("allows logical and look-alike classes", () => {
    for (const cls of [
      "ms-2",
      "pe-4",
      "start-0",
      "border-s",
      "rounded-s-md",
      "text-start",
      "border-line",
      "rounded-lg",
      "place-items-center",
      "inset-x-0",
    ])
      expect(flags(cls), cls).toBe(false);
  });

  it("flags raw colours and allows tokens", () => {
    for (const cls of ["bg-blue-500", "text-white", "border-[#fff]", "fill-[oklch(0.5_0.1_20)]", "color: #FF0000"])
      expect(flags(cls), cls).toBe(true);
    for (const cls of ["bg-surface", "text-fg-muted", "bg-fg/6", "outline-focus", "bg-brand-hover"])
      expect(flags(cls), cls).toBe(false);
  });

  it("flags class names built from strings", () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: the sample is source code that builds a class name
    expect(lintComponent("const c = `bg-${tone}`;", "x.tsx")).toHaveLength(1);
  });

  it("ignores comments", () => {
    expect(lintComponent('// "ml-2" is physical', "x.tsx")).toHaveLength(0);
  });
});

describe("lintStory", () => {
  it("requires a reason to turn accessibility checks off", () => {
    expect(lintStory('parameters: { a11y: { test: "off" } },', "s.tsx")).toHaveLength(1);
    expect(
      lintStory('// a11y-exception: decorative chart demo\nparameters: { a11y: { test: "off" } },', "s.tsx"),
    ).toHaveLength(0);
  });
});
