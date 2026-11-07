import { expect, it } from "vitest";
import { avatarInitials } from "./avatar-initials.ts";

it("takes whole Latin graphemes from the first two words", () => {
  expect(avatarInitials("  e\u0301lodie Dupont Martin  ", "fr")).toBe("E\u0301D");
});

it("keeps the first Arabic grapheme, including its vowel mark", () => {
  expect(avatarInitials("نِهال محمد", "ar")).toBe("نِم");
});

it("uses one initial for a one-word name", () => {
  expect(avatarInitials("Ada", "en")).toBe("A");
});
