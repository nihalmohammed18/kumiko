// Copies the shipped stylesheets from src/ to dist/ after tsc has compiled the components.
import { copyFileSync, readdirSync } from "node:fs";

for (const f of readdirSync(new URL("../src/", import.meta.url)).filter((f) => f.endsWith(".css")))
  copyFileSync(new URL(`../src/${f}`, import.meta.url), new URL(`../dist/${f}`, import.meta.url));
