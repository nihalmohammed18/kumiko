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
  // Just the story, unless it opens something outside it (dialogs, menus, toasts): those set parameters.vrt = "page".
  const story = document.querySelector<HTMLElement>("[data-kumiko-story]");
  const target = window.__kumikoVrtPage || !story ? document.body : story;
  await expect.element(page.elementLocator(target)).toMatchScreenshot(`${task.name}-${inject("mode")}`);
});
