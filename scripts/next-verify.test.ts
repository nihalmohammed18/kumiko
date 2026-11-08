import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const staticRoutes = ["/", "/forms", "/overlays", "/data", "/feedback", "/delight", "/email", "/dark", "/ar"];
const prerenderManifest = (routes = staticRoutes) =>
  JSON.stringify({ version: 4, routes: Object.fromEntries(routes.map((route) => [route, {}])) });

function verify(
  chunk: string,
  scripts = '<script src="/_next/static/chunks/button-only.js?dpl=test"></script>',
  overrides: Record<string, string> = {},
) {
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
    write(".next/prerender-manifest.json", prerenderManifest());
    // /navigation reads searchParams and is a server route rather than a prerendered page.
    write(".next/server/app-paths-manifest.json", '{"/(board)/navigation/page":"app/(board)/navigation/page.js"}');
    write(".next/server/app/(board)/navigation/page.js", "export default function Page() {}");
    write(
      ".next/server/app/(board)/index.html",
      '<html lang="en" dir="ltr"><a href="/navigation" data-slot="link-button">Browse jobs</a></html>',
    );
    write(
      ".next/server/app/(board)/data.html",
      '<table id="recent-applications" data-slot="table"><caption>Recent applications</caption><tbody><tr><td>Designer</td></tr></tbody></table>',
    );
    write(".next/server/app/(board)/delight.html", '<svg data-slot="character"><path /></svg>');
    write(".next/server/app/(board)/feedback.html", '<span role="status"><span data-slot="spinner"></span></span>');
    write(".next/server/app/(dark)/dark.html", '<html data-theme="dark" dir="ltr"></html>');
    write(".next/server/app/(arabic)/ar.html", '<html lang="ar" dir="rtl"></html>');
    write(".next/server/app/(fixture)/button-only.html", `<button data-slot="button">Only a button</button>${scripts}`);
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
    for (const [file, content] of Object.entries(overrides)) write(file, content);
    return spawnSync(process.execPath, ["verify.mjs"], { cwd: root, encoding: "utf8" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("Next consumer build verification", () => {
  it("accepts grouped static pages and a server route, keeps shared slots, and ignores other routes", () => {
    // `case"unrelated"` is the bare word, as React's own code has "link" for <link>; only the attribute counts.
    const result = verify(
      '({"data-slot":"button"}),({\'data-slot\':\'spinner\'}),({"data-slot":"shared"});switch(t){case"unrelated":}',
    );
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

  it("rejects a missing job-board route", () => {
    const result = verify("", undefined, {
      ".next/prerender-manifest.json": prerenderManifest(staticRoutes.filter((route) => route !== "/email")),
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("route /email is missing");
  });

  it.each([
    ["(board)/index.html", '<a href="/navigation">Browse jobs</a>', "server-rendered LinkButton"],
    [
      "(fixture)/button-only.html",
      '<div data-slot="button"></div><script src="/_next/static/chunks/button-only.js">',
      "server-rendered Button",
    ],
    ["(board)/feedback.html", '<script>({"data-slot":"spinner"})</script>', "server-rendered Spinner"],
    ["(board)/data.html", '<div data-slot="table">Recent applications</div>', "server-rendered Table"],
    ["(board)/delight.html", '<script>({"data-slot":"character"})</script>', "server-rendered Characters"],
    ["(dark)/dark.html", '<html><section data-theme="dark"></section></html>', '/dark HTML lacks data-theme="dark"'],
    ["(arabic)/ar.html", '<html dir="ltr"><section dir="rtl"></section></html>', '/ar HTML lacks dir="rtl"'],
  ])("rejects missing server markup in %s", (file, html, message) => {
    const result = verify("", undefined, { [`.next/server/app/${file}`]: html });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
  });
});
