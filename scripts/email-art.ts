// Run with pnpm email:art; only this explicit command launches Chromium.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import type { CharacterProps } from "../src/components/character.tsx";
import type { IllustrationProps } from "../src/components/illustration.tsx";
import { type EmailArtName, emailArtDescriptions } from "../src/email/email-art.ts";
import { tokensCss } from "./build-tokens.ts";

const require = createRequire(import.meta.url);
const font = await readFile(require.resolve("@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2"));
const fontFace = `@font-face{font-family:"Nunito Variable";font-style:normal;font-weight:200 1000;src:url("data:font/woff2;base64,${font.toString("base64")}") format("woff2")}`;
const styles = tokensCss() + (await readFile(new URL("../src/art.css", import.meta.url), "utf8"));
const output = new URL("../src/email/art/", import.meta.url);

// Vite transpiles the source TSX without requiring a package build or opening a server.
const vite = await createServer({
  root: fileURLToPath(new URL("..", import.meta.url)),
  configFile: false,
  envDir: false,
  publicDir: false,
  server: { middlewareMode: true, hmr: false },
});
try {
  const { Character } = (await vite.ssrLoadModule(
    "/src/components/character.tsx",
  )) as typeof import("../src/components/character.tsx");
  const { Illustration } = (await vite.ssrLoadModule(
    "/src/components/illustration.tsx",
  )) as typeof import("../src/components/illustration.tsx");
  const browser = await chromium.launch({ headless: true });
  try {
    await mkdir(output, { recursive: true });
    const context = await browser.newContext({ viewport: { width: 160, height: 160 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    for (const name of Object.keys(emailArtDescriptions) as EmailArtName[]) {
      const character = /^(pip|mori|tuck)-(waving|cheering|idle|thinking)$/.exec(name);
      const element = character
        ? createElement(Character, {
            name: character[1] as CharacterProps["name"],
            pose: character[2] as CharacterProps["pose"],
            size: 160,
          })
        : createElement(Illustration, { name: name as IllustrationProps["name"], size: 160 });
      const svg = renderToStaticMarkup(element);
      await page.setContent(
        `<!doctype html><html lang="en" dir="ltr"><head><style>${styles}</style></head><body>${svg}</body></html>`,
      );
      await page.locator("svg").evaluate((svg, fontFace) => {
        const fontStyle = document.createElementNS("http://www.w3.org/2000/svg", "style");
        fontStyle.textContent = fontFace;
        svg.prepend(fontStyle);
      }, fontFace);
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      // Resolve authored variables, including color-mix, before rasterizing a standalone SVG.
      const standalone = await page.locator("svg").evaluate((svg) => {
        for (const element of [svg, ...svg.querySelectorAll("*")]) {
          const computed = getComputedStyle(element);
          for (const attribute of Array.from(element.attributes)) {
            if (!attribute.value.includes("var(")) continue;
            for (const match of attribute.value.matchAll(/var\((--[\w-]+)/g)) {
              if (!computed.getPropertyValue(match[1]!).trim()) throw new Error(`Missing art token: ${match[1]}`);
            }
            const value = computed.getPropertyValue(attribute.name);
            if (!value || value.includes("var(")) throw new Error(`Unresolved art attribute: ${attribute.name}`);
            element.setAttribute(attribute.name, value);
          }
        }
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        // Mori's cheering sparks extend above the original viewBox; keep them inside the PNG.
        svg.setAttribute("viewBox", "-4 -4 188 188");
        svg.setAttribute("style", "display:block;overflow:visible");
        if (svg.outerHTML.includes("var(")) throw new Error("Email art must be self-contained");
        return svg.outerHTML;
      });
      await page.setContent(`<!doctype html><html><body style="margin:0">${standalone}</body></html>`);
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const png = await page.screenshot({ omitBackground: true, scale: "device" });
      if (png.readUInt32BE(16) !== 320 || png.readUInt32BE(20) !== 320)
        throw new Error(`Email PNGs must be 320×320: ${name}`);
      await writeFile(new URL(`${name}.png`, output), png);
      console.log(`Exported ${name}.png (320×320)`);
    }
  } finally {
    await browser.close();
  }
} finally {
  await vite.close();
}
