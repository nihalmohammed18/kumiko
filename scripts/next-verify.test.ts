import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function verify(chunk: string, scripts = '<script src="/_next/static/chunks/button-only.js?dpl=test"></script>') {
  const cache = fileURLToPath(new URL("../.vitest/", import.meta.url));
  mkdirSync(cache, { recursive: true });
  const root = mkdtempSync(join(cache, "next-verify-"));
  const write = (file: string, content: string) => {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  };
  try {
    copyFileSync(new URL("../examples/next/verify.mjs", import.meta.url), join(root, "verify.mjs"));
    write("package.json", '{"name":"next-verify-fixture","type":"module"}');
    write(".next/static/styles.css", ":root { --kumiko-canvas: #0f766e; } .rounded-control {} .bg-brand {}");
    write(".next/server/app/index.html", 'Rendered from a server component <span role="status"></span>');
    write(".next/server/app/button-only.html", scripts);
    write(".next/static/chunks/button-only.js", chunk);
    write(".next/static/chunks/other-route.js", '({"data-slot":"unrelated"})');
    write(
      "node_modules/kumiko-ui/package.json",
      JSON.stringify({ type: "module", exports: { ".": "./dist/index.js", "./tokens": "./dist/tokens.js" } }),
    );
    const dist = "node_modules/kumiko-ui/dist";
    write(`${dist}/index.js`, 'export { Button } from "./components/button.js";');
    write(`${dist}/tokens.js`, "export const tokens = {};");
    write(
      `${dist}/components/button.js`,
      'import { Spinner } from "./spinner.js"; import "../shared.js"; export const Button = {"data-slot":"button", Spinner}; export const IconButton = {"data-slot":"icon-button"};',
    );
    write(
      `${dist}/components/spinner.js`,
      'export { shared } from "../shared.js"; export const Spinner = {"data-slot":"spinner"};',
    );
    write(`${dist}/shared.js`, 'import "./components/button.js"; export const shared = {"data-slot":"shared"};');
    write(
      `${dist}/components/unrelated.js`,
      'export const unrelated = {"data-slot":"unrelated", child: {"data-slot":"shared"}};',
    );
    return spawnSync(process.execPath, ["verify.mjs"], { cwd: root, encoding: "utf8" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("Next button-only tree-shaking", () => {
  it("allows transitive dependencies and shared slots, and ignores other routes", () => {
    const result = verify('({"data-slot":"button"}),({\'data-slot\':\'spinner\'}),({"data-slot":"shared"})');
    expect(result.status, result.stderr).toBe(0);
  });

  it("rejects an unrelated component and names its slot and chunk", () => {
    const result = verify('({"data-slot":"unrelated"})');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("unrelated");
    expect(result.stderr).toContain("button-only.js");
  });

  it("rejects a route with no script chunks to inspect", () => {
    const result = verify("", "<main>Only a button here</main>");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("no script chunks");
  });
});
