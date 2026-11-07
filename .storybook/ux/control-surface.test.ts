import { expect, it } from "vitest";
import { controlHitTarget, controlSurface } from "./control-surface.ts";

interface SurfaceFixture {
  tagName: string;
  parentElement: SurfaceFixture | null;
  getAttribute(name: string): string | null;
}

function node(
  tagName: string,
  attributes: Record<string, string> = {},
  parentElement: SurfaceFixture | null = null,
): SurfaceFixture {
  return { tagName, parentElement, getAttribute: (name) => attributes[name] ?? null };
}

it("measures slider thumbs and number-field groups where their focus rings and borders are painted", () => {
  const thumb = node("DIV", { "data-slot": "slider-thumb" });
  expect(controlSurface(node("INPUT", { type: "range" }, thumb))).toBe(thumb);
  const group = node("DIV", { "data-slot": "number-field-group" });
  const inputWrapper = node("DIV", {}, group);
  expect(controlSurface(node("INPUT", { "data-slot": "number-field-input" }, inputWrapper))).toBe(group);
});

it("keeps ordinary controls and inputs without a matching surface as their own measurement targets", () => {
  const button = node("BUTTON");
  expect(controlSurface(button)).toBe(button);
  const unownedRange = node("INPUT", { type: "range" }, node("DIV"));
  expect(controlSurface(unownedRange)).toBe(unownedRange);
});

it("measures a stretched link on its card while keeping inner actions as separate controls", () => {
  const card = node("DIV", { "data-slot": "card" });
  const title = node("H3", {}, card);
  const link = node("A", { "data-slot": "card-link" }, title);
  expect(controlSurface(link)).toBe(card);
  expect(controlHitTarget(link)).toBe(card);
  const action = node("BUTTON", {}, card);
  expect(controlSurface(action)).toBe(action);
  expect(controlHitTarget(action)).toBe(action);
});

it("uses the slider's painted thumb as its hit target while keeping the number input separate from its steppers", () => {
  const thumb = node("DIV", { "data-slot": "slider-thumb" });
  expect(controlHitTarget(node("INPUT", { type: "range" }, thumb))).toBe(thumb);
  const group = node("DIV", { "data-slot": "number-field-group" });
  const input = node("INPUT", { "data-slot": "number-field-input" }, group);
  expect(controlSurface(input)).toBe(group);
  expect(controlHitTarget(input)).toBe(input);
});
