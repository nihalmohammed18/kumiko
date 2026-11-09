import { expect, it } from "vitest";
import { pickStoryCopy, storySettings } from "./story-copy.ts";

it("derives automatic direction from language, including Urdu", () => {
  expect(storySettings({ locale: "en", dir: "auto" })).toEqual({ language: "en", locale: "en", dir: "ltr" });
  expect(storySettings({ locale: "ur", dir: "auto" })).toEqual({ language: "ur", locale: "ur", dir: "rtl" });
});

it("keeps language and Arabic digits independent of a forced direction", () => {
  expect(storySettings({ locale: "ar", dir: "ltr" })).toEqual({
    language: "ar",
    locale: "ar-u-nu-arab",
    dir: "ltr",
  });
  expect(storySettings({ locale: "en", dir: "rtl" })).toEqual({ language: "en", locale: "en", dir: "rtl" });
});

it("selects story copy from the provider's full locale and falls back to English", () => {
  const copy = { en: "Hello", ar: "مرحبًا", ur: "سلام" };
  expect(pickStoryCopy(copy, "ar-u-nu-arab")).toBe("مرحبًا");
  expect(pickStoryCopy(copy, undefined)).toBe("Hello");
});
