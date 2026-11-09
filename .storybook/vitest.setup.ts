import { afterEach, beforeAll, expect, inject } from "vitest";
import { commands, page } from "vitest/browser";
import type { MODES } from "../scripts/ux-rules.ts";
import { checkUx } from "./ux/harness.ts";

type Mode = (typeof MODES)[number];

declare module "vitest" {
  export interface ProvidedContext {
    mode: Mode;
    engine: "chromium" | "webkit";
    vrt: "all" | "states" | "none";
  }
}

const mode = inject("mode");

/** Each project's conditions really hold, so a misconfigured project can't pass vacuously. */
/** Emulated forced colours must actually repaint: an authored colour is replaced by a system colour. A test file's
 * fresh frame can be probed a moment before the emulation reaches it, so this waits up to half a second. */
async function forcedRepaint(): Promise<boolean> {
  for (let frame = 0; frame < 30; frame++) {
    const probe = document.createElement("div");
    probe.style.color = "rgb(1, 2, 3)";
    document.body.append(probe);
    const repainted = getComputedStyle(probe).color !== "rgb(1, 2, 3)";
    probe.remove();
    if (repainted) return true;
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return false;
}

async function canary(): Promise<string[]> {
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
  // A frame that came up with the media query but without forced colours is repainted once; if it still isn't
  // forced, the project's conditions really aren't in effect.
  if (mode === "forced" && !(await forcedRepaint())) {
    await commands.uxForcedColors();
    if (!(await forcedRepaint())) problems.push("forced colours are not applied");
  }
  return problems;
}

// Every face screenshots use, with Arabic and Urdu samples for Baloo Bhaijaan 2. Loaded up front so a screenshot never
// catches a fallback font, and checked so a missing font package fails loudly instead of drifting the baselines.
const FACES: Array<[string, string]> = [
  ['700 16px "Fredoka Variable"', "Aa"],
  ['500 16px "Nunito Variable"', "Aa"],
  ['800 16px "Nunito Variable"', "Aa"],
  ['600 16px "Baloo Bhaijaan 2 Variable"', "بت ےںٹڈ"],
];

beforeAll(async () => {
  await Promise.all(FACES.map(([font, text]) => document.fonts.load(font, text)));
  const missing = FACES.filter(([font, text]) => !document.fonts.check(font, text)).map(([font]) => font);
  if (missing.length) throw new Error(`Fonts didn't load: ${missing.join(", ")}`);
  const problems = await canary();
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
  const story = document.querySelector<HTMLElement>("[data-kumiko-story]");
  expect(document.documentElement.dir).toBe(mode === "rtl" ? "rtl" : "ltr");
  expect(document.documentElement.lang).toBe(mode === "rtl" ? "ar" : "en");
  expect(story?.dataset.kumikoLocale).toBe(mode === "rtl" ? "ar-u-nu-arab" : "en");
  const vrt = inject("vrt");
  if (!window.__kumikoSkipVrt && (vrt === "all" || (vrt === "states" && task.name === "States"))) {
    await document.fonts.ready;
    // Just the story, unless it opens something outside it (dialogs, menus, toasts): those set parameters.vrt = "page".
    const target = window.__kumikoVrtPage || !story ? document.body : story;
    // Chromium paints only the part of the test frame inside its viewport, so a taller target came out blank below
    // the fold: grow the frame to fit it, then restore the height for the UX checks.
    const height = innerHeight;
    const bottom = Math.ceil(
      target === document.body
        ? document.documentElement.scrollHeight
        : target.getBoundingClientRect().bottom + scrollY,
    );
    if (bottom > height) await page.viewport(innerWidth, bottom);
    try {
      await expect.element(page.elementLocator(target)).toMatchScreenshot(`${task.name}-${mode}`);
    } finally {
      if (bottom > height) await page.viewport(innerWidth, height);
    }
  }
  await checkUx(mode, window.__kumikoUx, inject("engine"));
});
