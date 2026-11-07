import { afterEach, beforeAll, expect, inject } from "vitest";
import { page } from "vitest/browser";
import type { MODES } from "../scripts/ux-rules.ts";
import { checkUx } from "./ux/harness.ts";

type Mode = (typeof MODES)[number];

declare module "vitest" {
  export interface ProvidedContext {
    mode: Mode;
    vrt: "all" | "states" | "none";
  }
}

const mode = inject("mode");

/** Each project's conditions really hold, so a misconfigured project can't pass vacuously. */
function canary(): string[] {
  const media = (query: string) => matchMedia(query).matches;
  const expected: Array<[string, boolean]> = [
    ["(prefers-reduced-motion: reduce)", mode !== "motion"],
    ["(hover: none)", mode === "touch"],
    ["(pointer: coarse)", mode === "touch"],
    ["(forced-colors: active)", mode === "forced"],
  ];
  const problems = expected
    .filter(([query, want]) => media(query) !== want)
    .map(([query, want]) => `${query} should be ${want}`);
  if (mode === "forced") {
    // Emulated forced colours must actually repaint: an authored colour is replaced by a system colour.
    const probe = document.createElement("div");
    probe.style.color = "rgb(1, 2, 3)";
    document.body.append(probe);
    if (getComputedStyle(probe).color === "rgb(1, 2, 3)") problems.push("forced colours are not applied");
    probe.remove();
  }
  return problems;
}

beforeAll(() => {
  const problems = canary();
  if (problems.length) throw new Error(`The ${mode} project's conditions are not in effect:\n${problems.join("\n")}`);
});

// After a story renders and its play test passes: first compare a screenshot with the committed baseline (made only
// on Linux in the pinned Playwright image, see .github/workflows/update-screenshots.yml), then check the UX rules,
// which hover, press and focus things and so must come second.
afterEach(async ({ task }) => {
  if (task.result?.errors?.length) return;
  // Checked per story: Storybook resizes the page before each one (see vite.config.ts).
  const width = mode === "touch" ? 320 : 1200;
  if (innerWidth !== width) throw new Error(`The ${mode} project should be ${width}px wide, but it is ${innerWidth}px`);
  const vrt = inject("vrt");
  if (!window.__kumikoSkipVrt && (vrt === "all" || (vrt === "states" && task.name === "States"))) {
    await document.fonts.ready;
    // Just the story, unless it opens something outside it (dialogs, menus, toasts): those set parameters.vrt = "page".
    const story = document.querySelector<HTMLElement>("[data-kumiko-story]");
    const target = window.__kumikoVrtPage || !story ? document.body : story;
    await expect.element(page.elementLocator(target)).toMatchScreenshot(`${task.name}-${mode}`);
  }
  await checkUx(mode, window.__kumikoUx);
});
