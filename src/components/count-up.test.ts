import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { KumikoProvider, type KumikoProviderProps } from "../provider.tsx";
import { CountUp } from "./count-up.tsx";

it("server-renders the final localized value, with only one accessible number", () => {
  const settings: KumikoProviderProps = {
    locale: "ar-u-nu-arab",
    children: createElement(CountUp, { value: 12, from: 0 }),
  };
  const html = renderToStaticMarkup(createElement(KumikoProvider, settings));
  expect(html).toMatch(/<span[^>]*data-slot="count-up-value"[^>]*aria-hidden="true"[^>]*>١٢<\/span>/);
  expect(html).toMatch(/<span[^>]*data-slot="count-up-final"[^>]*class="sr-only"[^>]*>١٢<\/span>/);
  expect(html).not.toContain('aria-live="assertive"');
});
