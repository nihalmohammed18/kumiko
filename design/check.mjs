// Checks the built direction page: screenshots per direction × light/dark/rtl, axe (WCAG 2.2 AA), and Urdu glyph coverage
// in each direction's Arabic font. Uses Playwright and axe-core from elsewhere on this Mac until the repo has its own.
// Usage: node check.mjs [directionId ...]   (screenshots land in out/shots/)
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.HOME}/Documents/GitHub/nistrocloud-website/node_modules/playwright`);
const AXE = readFileSync(
  `${process.env.HOME}/Documents/GitHub/matrimony/node_modules/.pnpm/axe-core@4.13.0/node_modules/axe-core/axe.min.js`,
  "utf8",
);
const here = (f) => new URL(f, import.meta.url);
const { directions } = JSON.parse(readFileSync(here("./directions.json")));
const only = process.argv.slice(2);
const list = only.length ? directions.filter((d) => only.includes(d.id)) : directions;
mkdirSync(here("./out/shots/"), { recursive: true });

// Urdu letters that plain Arabic fonts often lack: ے ں ٹ ڈ
const URDU = [0x06d2, 0x06ba, 0x0679, 0x0688];
const arabicFamily = (d) => d.shape["font-sans"].match(/'([^']*(?:Arabic|Alexandria)[^']*)'/)?.[1];
async function covers(family) {
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}&display=swap`, {
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/141.0 Safari/537.36",
    },
  });
  const ranges = [...(await res.text()).matchAll(/unicode-range:\s*([^;]+);/g)].flatMap((m) =>
    m[1].split(",").map((r) => r.trim()),
  );
  const inRange = (cp) =>
    ranges.some((r) => {
      const [a, b] = r
        .replace("U+", "")
        .split("-")
        .map((h) => parseInt(h.replace("U+", ""), 16));
      return cp >= a && cp <= (b ?? a);
    });
  return URDU.filter((cp) => !inRange(cp)).map((cp) => String.fromCodePoint(cp));
}

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
let failed = 0;
for (const d of list) {
  const missing = await covers(arabicFamily(d));
  if (missing.length) {
    failed++;
    console.log(`${d.id}: ${arabicFamily(d)} lacks Urdu glyphs ${missing.join(" ")}`);
  }
  for (const mode of ["light", "dark", "rtl"]) {
    await page.goto(`${here("./out/preview.html").href}#${d.id}`);
    await page.click(`[data-theme-btn="${mode === "dark" ? "dark" : "light"}"]`);
    await page.click(`[data-dir-btn="${mode === "rtl" ? "rtl" : "ltr"}"]`);
    await page.addStyleTag({ content: ".bar{position:static!important}" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    for (const [part, sel] of [
      ["intro", ".intro"],
      ["app", ".app"],
      ["sheet", ".sheet"],
    ])
      await page
        .locator(sel)
        .screenshot({
          path: new URL(`./out/shots/${d.id}-${mode}-${part}.png`, import.meta.url).pathname,
          animations: "disabled",
        });
    await page.addScriptTag({ content: AXE });
    const result = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      }),
    );
    const v = result.violations;
    if (v.length) failed++;
    console.log(
      `${d.id} ${mode}: ${
        v.length
          ? v
              .map(
                (x) =>
                  `${x.id} ×${x.nodes.length} (${x.nodes
                    .slice(0, 2)
                    .map((n) => n.target.join(" "))
                    .join(" | ")})`,
              )
              .join("; ")
          : "axe clean"
      }`,
    );
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
