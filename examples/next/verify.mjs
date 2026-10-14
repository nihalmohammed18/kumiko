// Run after `next build`: proves the packed kumiko-ui works in a real Next app.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

for (const entry of ["kumiko-ui", "kumiko-ui/tokens"]) {
  try {
    await import(entry);
  } catch (e) {
    fail(`plain Node can't import ${entry}: ${e.message}`);
  }
}
if (!process.exitCode) console.log("✓ kumiko-ui works in this Next app");
