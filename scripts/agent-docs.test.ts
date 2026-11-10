import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const entries = { "kumiko-ui": "src/index.ts", "kumiko-ui/email": "src/email/index.ts" };
const modules = new Map<string, string[]>();
const imports = Object.entries(entries).map(([entry, file]) => {
  const source = ts.createSourceFile(file, readFileSync(join(root, file), "utf8"), ts.ScriptTarget.Latest, true);
  const names: string[] = [];
  for (const statement of source.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    )
      continue;
    const path = resolve(root, dirname(file), statement.moduleSpecifier.text);
    const exports = statement.exportClause.elements.map((exported) => exported.name.text);
    modules.set(path, [...(modules.get(path) ?? []), ...exports]);
    names.push(
      ...statement.exportClause.elements.map(
        (exported) => `${exported.isTypeOnly ? "type " : ""}${exported.name.text}`,
      ),
    );
  }
  return `import { ${names.join(", ")} } from ${JSON.stringify(entry)};`;
});

function temporaryRoot() {
  const cache = join(root, ".vitest");
  mkdirSync(cache, { recursive: true });
  return mkdtempSync(join(cache, "agent-docs-"));
}

it("generates linked guides for every public module with declared props and inherited contracts", () => {
  const destination = temporaryRoot();
  try {
    const result = spawnSync(process.execPath, [join(root, "scripts/agent-docs.ts"), destination], {
      encoding: "utf8",
    });
    expect(result.status, result.stdout + result.stderr).toBe(0);
    const docs = join(destination, "dist/docs");
    const index = readFileSync(join(docs, "README.md"), "utf8");
    const llms = readFileSync(join(destination, "llms.txt"), "utf8");
    for (const [file, exports] of modules) {
      const name = `${basename(file).replace(/\.tsx?$/, "")}.md`;
      const document = readFileSync(join(docs, "components", name), "utf8");
      for (const exported of exports)
        if (!exports.includes(exported.replace(/Props$/, "")) || !exported.endsWith("Props"))
          expect(document).toContain(`## ${exported}\n`);
      expect(document).toContain("Use when:");
      expect(document).toContain("Avoid when:");
      expect(index).toContain(`components/${name}`);
    }
    const dialog = readFileSync(join(docs, "components/dialog.md"), "utf8");
    expect(dialog).toContain("Plus Base UI Dialog.Popup's props");
    expect(dialog).toContain("installed with Kumiko, or https://base-ui.com/react/components/dialog");
    expect(readFileSync(join(docs, "components/badge.md"), "utf8")).toContain('`BadgeTone` (`"danger" \\| "info"');
    expect(dialog).toContain("### Props (`DialogPopupProps`)");
    expect(dialog).not.toContain("## DialogPopupProps");
    expect(dialog).toContain('| `size?` | `"sm" \\| "md" \\| "lg"` | `"md"` |');
    expect(dialog).toContain("Portal destination for a themed island");
    expect(dialog).toContain("<DialogTrigger>Application details</DialogTrigger>");
    expect(dialog).not.toContain("onPointerDown");
    const button = readFileSync(join(docs, "components/button.md"), "utf8");
    expect(button).toContain("| `loading?` | `boolean` | `false` | Shows a spinner");
    expect(button).toContain("## IconButton\n");
    expect(button).toContain('`"aria-label"`');
    expect(readFileSync(join(docs, "components/job-alert-digest-email.md"), "utf8")).toMatch(/\| `` `[^`]+` `` \|/);
    for (const guide of ["setup", "theming", "forms"]) {
      const document = readFileSync(join(docs, `${guide}.md`), "utf8");
      expect(document).toBe(
        readFileSync(join(root, "docs", `${guide}.md`), "utf8").replaceAll("../src/recipes/", "recipes/"),
      );
      for (const link of document.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g))
        expect(() => readFileSync(join(docs, link[1]!), "utf8")).not.toThrow();
    }
    expect(readFileSync(join(docs, "email.md"), "utf8")).toContain("renderEmail");
    expect(llms).toMatch(/^# Kumiko\n\n> /);
    for (const group of ["Actions", "Forms", "Overlays", "Navigation", "Feedback", "Data", "Delight", "Email"])
      expect(index).toContain(`## ${group}\n`);
    for (const document of [index, llms]) {
      expect(document).toContain("KumikoProvider");
      expect(document).toContain("FieldLabel");
      for (const link of document.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g))
        expect(() => readFileSync(join(document === index ? docs : destination, link[1]!), "utf8")).not.toThrow();
    }
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
}, 30_000);

it("typechecks every source JSDoc example against fresh package declarations", () => {
  const config = ts.readConfigFile(join(root, "tsconfig.build.json"), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const examples: { file: string; text: string }[] = [];
  for (const file of parsed.fileNames) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const seen = new Set<number>();
    const visit = (node: ts.Node) => {
      for (const tag of ts.getJSDocTags(node)) {
        if (tag.tagName.text !== "example" || seen.has(tag.pos)) continue;
        seen.add(tag.pos);
        examples.push({ file, text: ts.getTextOfJSDocComment(tag.comment) ?? "" });
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  for (const file of modules.keys())
    if (file.endsWith(".tsx"))
      expect(
        examples.some((example) => example.file === file),
        `${relative(root, file)} needs an @example`,
      ).toBe(true);

  const destination = temporaryRoot();
  const tsc = createRequire(import.meta.url).resolve("typescript/lib/tsc.js");
  const compile = (args: string[]) => spawnSync(process.execPath, [tsc, ...args], { encoding: "utf8" });
  try {
    const declarations = compile([
      "-p",
      join(root, "tsconfig.build.json"),
      "--emitDeclarationOnly",
      "--outDir",
      join(destination, "dist"),
    ]);
    expect(declarations.status, declarations.stdout + declarations.stderr).toBe(0);
    const exampleImports = new Set<string>();
    const bodies = examples.map(({ file, text }, index) => {
      const source = ts.createSourceFile("example.tsx", text, ts.ScriptTarget.Latest, true);
      const body = source.statements
        .filter((statement) => {
          if (!ts.isImportDeclaration(statement)) return true;
          exampleImports.add(statement.getText(source));
          return false;
        })
        .map((statement) => statement.getText(source))
        .join("\n");
      return `// ${relative(root, file)}\nfunction Example${index}() {\n${body}\n}`;
    });
    const source = [
      ...imports,
      ...exampleImports,
      ...bodies,
      '// @ts-expect-error A made-up tone must fail against the published Button props.\n<Button tone="salary" />;',
    ].join("\n\n");
    writeFileSync(join(destination, "examples.tsx"), source);
    writeFileSync(
      join(destination, "tsconfig.json"),
      JSON.stringify({
        extends: join(root, "tsconfig.json"),
        compilerOptions: {
          paths: Object.fromEntries(
            Object.entries(entries).map(([entry, file]) => [
              entry,
              [`./dist/${file.slice(4).replace(/\.ts$/, ".d.ts")}`],
            ]),
          ),
        },
        include: ["examples.tsx"],
      }),
    );
    const result = compile(["-p", join(destination, "tsconfig.json")]);
    expect(result.status, result.stdout + result.stderr).toBe(0);
  } finally {
    rmSync(destination, { recursive: true, force: true });
  }
}, 30_000);
