// Copies the shipped stylesheets and generated email PNGs after tsc has compiled the components.
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";

for (const f of readdirSync(new URL("../src/", import.meta.url)).filter((f) => f.endsWith(".css")))
  copyFileSync(new URL(`../src/${f}`, import.meta.url), new URL(`../dist/${f}`, import.meta.url));

mkdirSync(new URL("../dist/email/art/", import.meta.url), { recursive: true });
for (const name of readdirSync(new URL("../src/email/art/", import.meta.url)).filter((name) => name.endsWith(".png")))
  copyFileSync(
    new URL(`../src/email/art/${name}`, import.meta.url),
    new URL(`../dist/email/art/${name}`, import.meta.url),
  );
