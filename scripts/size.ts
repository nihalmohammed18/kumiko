// Run after `pnpm build`; `node scripts/size.ts --update` records new gzip baselines in bytes.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "vite";

type Size = { raw: number; gzip: number };
const measure = (source: string | Uint8Array): Size => ({
  raw: Buffer.byteLength(source),
  gzip: gzipSync(source, { level: 9 }).length,
});

export function sizeProblems(sizes: Record<string, number>, baseline: Record<string, number>): string[] {
  return Object.entries(sizes).flatMap(([name, gzip]) => {
    const expected = baseline?.[name];
    if (typeof expected !== "number" || !Number.isFinite(expected) || expected <= 0)
      return [`${name}: missing or invalid gzip baseline in size-baseline.json`];
    if (gzip > expected * 1.1)
      return [
        `${name}: ${gzip} B gzip is ${((gzip / expected - 1) * 100).toFixed(1)}% over the ${expected} B baseline (limit: 10%)`,
      ];
    return [];
  });
}

if (import.meta.main) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const index = JSON.stringify(join(root, "dist/index.js"));
  const entries = {
    all: `export * from ${index};`,
    button: `export { Button } from ${index};`,
    tokens: `export * from ${JSON.stringify(join(root, "dist/tokens.js"))};`,
  };
  const sizes: Record<string, Size> = {};
  for (const [name, source] of Object.entries(entries)) {
    const entry = join(root, `.size-${name}.js`);
    const result = await build({
      root,
      configFile: false,
      envDir: false,
      publicDir: false,
      logLevel: "error",
      plugins: [
        {
          name: "kumiko-size-entry",
          resolveId: (id) => (id === entry ? entry : undefined),
          load: (id) => (id === entry ? source : undefined),
        },
      ],
      build: {
        lib: { entry, formats: ["es"] },
        minify: true,
        write: false,
        rolldownOptions: {
          external: ["react", "react-dom", "react/jsx-runtime"],
          // ESM library builds preserve whitespace by default; measure fully minified consumer code.
          output: { minify: true, comments: false },
        },
      },
    });
    const chunks = (Array.isArray(result) ? result : [result]).flatMap((bundle) => {
      if (!("output" in bundle)) throw new Error("Size builds must return in-memory output");
      return bundle.output.filter((output) => output.type === "chunk");
    });
    if (!chunks.length) throw new Error(`${name}: size build produced no JavaScript chunks`);
    sizes[name] = chunks
      .map((chunk) => measure(chunk.code))
      .reduce((total, size) => ({ raw: total.raw + size.raw, gzip: total.gzip + size.gzip }), { raw: 0, gzip: 0 });
  }
  sizes.css = measure(readFileSync(join(root, "dist/styles.css")));
  console.table(Object.entries(sizes).map(([entry, size]) => ({ entry, "raw (B)": size.raw, "gzip (B)": size.gzip })));

  const gzipSizes = Object.fromEntries(Object.entries(sizes).map(([name, size]) => [name, size.gzip]));
  const baseline = join(root, "size-baseline.json");
  if (process.argv.includes("--update")) {
    writeFileSync(baseline, `${JSON.stringify(gzipSizes, null, 2)}\n`);
    console.log("Recorded gzip baselines in size-baseline.json");
  } else {
    const problems = sizeProblems(gzipSizes, JSON.parse(readFileSync(baseline, "utf8")));
    if (problems.length) {
      console.error(problems.join("\n"));
      process.exitCode = 1;
    } else console.log("Gzip sizes are within 10% of size-baseline.json");
  }
}
