// Run after `next build`: proves the packed kumiko-ui works in a real Next app.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
};
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );

const css = files(".next/static")
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
for (const needle of ["--kumiko-canvas", ".rounded-control", ".bg-brand", "#0f766e"])
  if (!css.includes(needle)) fail(`built CSS lacks ${needle}: Tailwind didn't pick up Kumiko's classes or tokens`);

const html = readFileSync(".next/server/app/index.html", "utf8");
if (!html.includes("Rendered from a server component")) fail("server-rendered Button missing from the HTML");
if (!html.includes('role="status"')) fail("server-rendered Spinner missing from the HTML");

const dist = "node_modules/kumiko-ui/dist";
const allowed = new Set();
function allow(file) {
  if (allowed.has(file)) return;
  allowed.add(file);
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)["'](\.[^"']+)["']/g))
    allow(join(dirname(file), match[1]));
}
allow(join(dist, "components/button.js"));

const allowedSlots = new Set();
const otherSlots = new Set();
for (const file of files(dist).filter((file) => file.endsWith(".js"))) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/["']data-slot["']\s*:\s*["']([^"']+)["']/g))
    (allowed.has(file) ? allowedSlots : otherSlots).add(match[1]);
}
const forbiddenSlots = [...otherSlots].filter((slot) => !allowedSlots.has(slot));
const buttonHtml = readFileSync(".next/server/app/button-only.html", "utf8");
const chunks = new Set(
  [...buttonHtml.matchAll(/<script\b[^>]*\ssrc=["'](\/_next\/static\/[^"']+)["']/g)].map((match) =>
    join(".next", match[1].replace(/^\/_next\//, "").split(/[?#]/)[0]),
  ),
);
if (!chunks.size) fail("button-only has no script chunks to inspect");
for (const chunk of chunks) {
  const source = readFileSync(chunk, "utf8");
  for (const slot of forbiddenSlots)
    if (source.includes(`"${slot}"`) || source.includes(`'${slot}'`))
      fail(`button-only ships unrelated Kumiko data-slot "${slot}" in ${chunk}`);
}

for (const entry of ["kumiko-ui", "kumiko-ui/tokens"]) {
  try {
    await import(entry);
  } catch (e) {
    fail(`plain Node can't import ${entry}: ${e.message}`);
  }
}
if (!process.exitCode) console.log("✓ kumiko-ui works in this Next app");
