// Builds the design-direction page from one template, one script and the token sets in directions.json.
// Writes out/kumiko-directions.html (content only, as Artifacts expect) and out/preview.html (a full page for local checks).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const here = (f) => new URL(f, import.meta.url);
const { fonts, brands, directions } = JSON.parse(readFileSync(here("./directions.json")));

const decl = (obj) =>
  Object.entries(obj)
    .map(([k, v]) => `--${k}: ${v};`)
    .join(" ");
const block = (sel, body) => `${sel} { ${body} }`;
const dark = (sel, vars) =>
  `@media (prefers-color-scheme: dark) { ${sel}:not([data-theme="light"]) { ${vars} color-scheme: dark; } }\n` +
  block(`${sel}[data-theme="dark"]`, `${vars} color-scheme: dark;`);

const [first, ...rest] = directions;
let tokens = block(":root", `${decl(first.shape)} ${decl(first.light)}`) + "\n";
tokens += dark(":root", decl(first.dark)) + "\n";
for (const d of [first, ...rest]) {
  const sel = `:root[data-direction="${d.id}"]`;
  tokens += block(sel, `${decl(d.shape)} ${decl(d.light)}`) + "\n";
  tokens += dark(sel, decl(d.dark)) + "\n";
}
for (const [id, b] of Object.entries(brands)) {
  const sel = `:root[data-brand="${id}"]`;
  tokens += block(sel, `--b-brand: ${b.light[0]}; --b-brand-fg: ${b.light[1]};`) + "\n";
  tokens += dark(sel, `--b-brand: ${b.dark[0]}; --b-brand-fg: ${b.dark[1]};`) + "\n";
}

const meta = directions.map(({ id, name, mood, fontsLabel, shape }) => ({ id, name, mood, fontsLabel, shape }));
const script = readFileSync(here("./page.js"), "utf8")
  .replace("__DIRECTIONS__", () => JSON.stringify(meta))
  .replace("__BRANDS__", () => JSON.stringify(brands));
const page = readFileSync(here("./template.html"), "utf8")
  .replace("__FONTS_HREF__", () => `https://fonts.googleapis.com/css2?${fonts}&display=swap`)
  .replace("__DIRECTION_IDS__", () => JSON.stringify(directions.map((d) => d.id)))
  .replace("/*__TOKENS__*/", () => tokens)
  .replace("/*__SCRIPT__*/", () => script);

mkdirSync(here("./out/"), { recursive: true });
writeFileSync(here("./out/kumiko-directions.html"), page);
// Mirrors the Artifact skeleton so local screenshots match what viewers get.
writeFileSync(
  here("./out/preview.html"),
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${page}</body></html>`,
);
console.log(`Built ${directions.length} directions: ${Math.round(page.length / 1024)} KB`);
