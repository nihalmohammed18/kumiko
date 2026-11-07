import { expect, it } from "vitest";
import { checkTheme, colors, themeCss } from "./tokens.ts";

it("reports the mode, pair and measured contrast, and unreadable colours", () => {
  expect(checkTheme({ light: { "brand-fg": colors.light.brand }, dark: { brand: "teal-ish" } })).toEqual([
    "light: brand-fg on brand is 1.00:1 (needs 4.5:1)",
    "dark.brand: can't read 'teal-ish'",
  ]);
});

it("writes only the overridden colours and radius in their token scopes", () => {
  expect(themeCss({ light: { brand: "#123456" }, dark: { brand: "#ABCDEF" }, radii: { control: "16px" } })).toBe(
    `:root,
.light,
[data-theme="light"] {
  --kumiko-brand: #123456;
}

.dark,
[data-theme="dark"] {
  --kumiko-brand: #ABCDEF;
}

:root {
  --kumiko-radius-control: 16px;
}
`,
  );
});
