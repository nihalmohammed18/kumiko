// Node side of the UX harness: real mouse input through Playwright, which the browser can't fake.
import type { BrowserCommand } from "vitest/node";

type Action = "move" | "down" | "up" | "park";

declare module "vitest/browser" {
  interface BrowserCommands {
    /** move: put the mouse over the element matching `selector`; down/up: press or release the left button where
     * the mouse is; park: move the mouse to the page's top-left corner, then release the button. */
    uxMouse: (action: Action, selector?: string) => Promise<void>;
    /** Sends a real wheel event near a scroll surface's start corner and waits for it to be processed. */
    uxWheel: (selector: string, deltaY: number) => Promise<void>;
    /** Applies forced colours again: see the forced canary in vitest.setup.ts. */
    uxForcedColors: () => Promise<void>;
  }
}

// Chromium sometimes creates a test frame with the forced-colors media query on but forced colours not applied to its
// document (author colours stay), and that state lasts. Turning the emulation off and on again repaints the frame.
export const uxForcedColors: BrowserCommand<[]> = async (context) => {
  if (!("page" in context)) throw new Error("uxForcedColors needs the Playwright provider");
  await context.page.emulateMedia({ forcedColors: "none" });
  await context.page.emulateMedia({ forcedColors: "active" });
};

export const uxWheel: BrowserCommand<[selector: string, deltaY: number]> = async (context, selector, deltaY) => {
  if (!("page" in context)) throw new Error("uxWheel needs the Playwright provider");
  const frame = await context.frame();
  await frame.locator(selector).hover({ position: { x: 1, y: 1 }, force: true, timeout: 2000 });
  await context.page.mouse.wheel(0, deltaY);
  await frame.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
};

export const uxMouse: BrowserCommand<[action: Action, selector?: string]> = async (context, action, selector) => {
  if (!("page" in context)) throw new Error("uxMouse needs the Playwright provider");
  const { page } = context;
  if (action === "move") {
    if (!selector) throw new Error("uxMouse('move') needs a selector");
    // force: hover a disabled or covered control too; the rules decide whether that's a problem.
    await (await context.frame()).locator(selector).hover({ force: true, timeout: 2000 });
  } else if (action === "down") await page.mouse.down();
  else if (action === "up") await page.mouse.up();
  else {
    // Move away before releasing, so a press never ends in a click on the control.
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
};
