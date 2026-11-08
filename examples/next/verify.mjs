// Run after `next build`: proves the packed kumiko-ui works in a real Next app.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
};
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );

// Route groups belong to the build's filenames, not to its public URLs.
const routePath = (path) => path.replace(/\/\([^/]+\)/g, "").replace(/\/(?:page|index)$/, "") || "/";
const prerender = JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8"));
const appPaths = JSON.parse(readFileSync(".next/server/app-paths-manifest.json", "utf8"));
const serverRoutes = new Set(
  Object.entries(appPaths)
    .filter(([, file]) => existsSync(join(".next/server", file)))
    .map(([path]) => routePath(path)),
);
for (const route of [
  "/",
  "/forms",
  "/overlays",
  "/navigation",
  "/data",
  "/feedback",
  "/delight",
  "/email",
  "/dark",
  "/ar",
])
  if (!(route in prerender.routes) && !serverRoutes.has(route)) fail(`route ${route} is missing from the build output`);

const appDirectory = ".next/server/app";
const htmlByRoute = new Map(
  files(appDirectory)
    .filter((file) => file.endsWith(".html"))
    .map((file) => [
      routePath(`/${relative(appDirectory, file).replaceAll("\\", "/").slice(0, -5)}`),
      readFileSync(file, "utf8"),
    ]),
);
function routeHtml(route) {
  const html = htmlByRoute.get(route);
  if (html === undefined) fail(`server HTML for ${route} is missing`);
  return html ?? "";
}

const css = files(".next/static")
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
for (const needle of ["--kumiko-canvas", ".rounded-control", ".bg-brand", "#0f766e"])
  if (!css.includes(needle)) fail(`built CSS lacks ${needle}: Tailwind didn't pick up Kumiko's classes or tokens`);

if (
  !/<a\b[^>]*\bhref="\/navigation"[^>]*\bdata-slot="link-button"|<a\b[^>]*\bdata-slot="link-button"[^>]*\bhref="\/navigation"/.test(
    routeHtml("/"),
  )
)
  fail("server-rendered LinkButton through NextLink missing from / HTML");
if (!/<button\b[^>]*\bdata-slot="button"/.test(routeHtml("/button-only")))
  fail("server-rendered Button missing from /button-only HTML");
if (!/<span\b[^>]*\bdata-slot="spinner"/.test(routeHtml("/feedback")))
  fail("server-rendered Spinner missing from /feedback HTML");

// Inspect actual elements: a slot name in the React payload doesn't prove server markup exists.
const table =
  routeHtml("/data").match(
    /<table\b(?=[^>]*\bid="recent-applications")(?=[^>]*\bdata-slot="table")[^>]*>[\s\S]*?<\/table>/,
  )?.[0] ?? "";
if (!/<caption\b[^>]*>Recent applications<\/caption>/.test(table) || !/<tbody\b/.test(table))
  fail("server-rendered Table missing from /data HTML");
if (!/<svg\b[^>]*\bdata-slot="character"/.test(routeHtml("/delight")))
  fail("server-rendered Characters missing from /delight HTML");
const documentElement = (route) => routeHtml(route).match(/<html\b[^>]*>/)?.[0] ?? "";
if (!/\bdata-theme="dark"/.test(documentElement("/dark"))) fail('/dark HTML lacks data-theme="dark" on <html>');
if (!/\bdir="rtl"/.test(documentElement("/ar"))) fail('/ar HTML lacks dir="rtl" on <html>');

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
const buttonHtml = routeHtml("/button-only");
const chunks = new Set(
  [...buttonHtml.matchAll(/<script\b[^>]*\ssrc=["'](\/_next\/static\/[^"']+)["']/g)].map((match) =>
    join(".next", match[1].replace(/^\/_next\//, "").split(/[?#]/)[0]),
  ),
);
if (!chunks.size) fail("button-only has no script chunks to inspect");
for (const chunk of chunks) {
  const source = readFileSync(chunk, "utf8");
  // Match the compiled attribute, not the bare word: React and Next contain strings like "link" for <link>.
  const shipped = new Set(
    Array.from(source.matchAll(/["']data-slot["']\s*:\s*["']([^"']+)["']/g), (match) => match[1]),
  );
  for (const slot of forbiddenSlots)
    if (shipped.has(slot)) fail(`button-only ships unrelated Kumiko data-slot "${slot}" in ${chunk}`);
}

for (const entry of ["kumiko-ui", "kumiko-ui/tokens"]) {
  try {
    await import(entry);
  } catch (e) {
    fail(`plain Node can't import ${entry}: ${e.message}`);
  }
}
if (!process.exitCode) console.log("✓ kumiko-ui works in this Next app");
