import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { KumikoProvider, type KumikoProviderProps } from "../provider.tsx";
import { NumberField } from "./number-field.tsx";
import { Slider } from "./slider.tsx";

it("inherits the provider's numbering system when rendering numeric controls on the server", () => {
  const settings: KumikoProviderProps = {
    locale: "ar-u-nu-arab",
    children: [
      createElement(Slider, { key: "slider", label: "Volume", defaultValue: 12 }),
      createElement(NumberField, { key: "number", "aria-label": "Quantity", defaultValue: 12 }),
    ],
  };
  const markup = renderToStaticMarkup(createElement(KumikoProvider, settings));
  expect(markup).toMatch(/<output\b[^>]*data-slot="slider-value"[^>]*>١٢<\/output>/);
  expect(markup.match(/<input\b[^>]*data-slot="number-field-input"[^>]*>/)?.[0]).toContain('value="١٢"');
  expect(markup).toContain('aria-label="زيادة"');
});

it("honours an explicit numeric locale while keeping the provider's translated action names", () => {
  const settings: KumikoProviderProps = {
    locale: "ar-u-nu-arab",
    children: [
      createElement(Slider, { key: "slider", label: "Volume", value: 12, locale: "en" }),
      createElement(NumberField, { key: "number", "aria-label": "Quantity", value: 12, locale: "en" }),
    ],
  };
  const markup = renderToStaticMarkup(createElement(KumikoProvider, settings));
  expect(markup).toMatch(/<output\b[^>]*data-slot="slider-value"[^>]*>12<\/output>/);
  expect(markup.match(/<input\b[^>]*data-slot="number-field-input"[^>]*>/)?.[0]).toContain('value="12"');
  expect(markup).toContain('aria-label="زيادة"');
});

it("uses a native disabled increment at the maximum while leaving decrement available", () => {
  const markup = renderToStaticMarkup(createElement(NumberField, { defaultValue: 10, max: 10 }));
  expect(markup.match(/<button\b[^>]*data-slot="number-field-increment"[^>]*>/)?.[0]).toContain('disabled=""');
  expect(markup.match(/<button\b[^>]*data-slot="number-field-decrement"[^>]*>/)?.[0]).not.toContain('disabled=""');
});

it("uses native disabled steppers in a read-only field", () => {
  const markup = renderToStaticMarkup(createElement(NumberField, { defaultValue: 4, readOnly: true }));
  const steppers = markup.match(/<button\b[^>]*data-slot="number-field-(?:increment|decrement)"[^>]*>/g) ?? [];
  expect(steppers).toHaveLength(2);
  for (const stepper of steppers) expect(stepper).toContain('disabled=""');
});
