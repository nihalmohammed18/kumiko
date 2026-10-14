import { afterEach, expect, inject } from "vitest";
import { page } from "vitest/browser";

declare module "vitest" {
  export interface ProvidedContext {
    mode: "light" | "dark" | "rtl";
    vrt: boolean;
  }
}

// After a story renders and its play test passes, compare a screenshot with the committed baseline. Baselines are
// only made on Linux in the pinned Playwright image (see .github/workflows/update-screenshots.yml).
afterEach(async ({ task }) => {
  if (!inject("vrt") || task.result?.errors?.length || window.__kumikoSkipVrt) return;
  await document.fonts.ready;
  await expect.element(page.elementLocator(document.body)).toMatchScreenshot(`${task.name}-${inject("mode")}`);
});
