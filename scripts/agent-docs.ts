// Generates the documentation agents read in the installed package, after the build.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const destination = resolve(process.argv[2] ?? root);
const config = ts.readConfigFile(join(root, "tsconfig.build.json"), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
if (parsed.errors.length)
  throw new Error(parsed.errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n")).join("\n"));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const docs = join(destination, "dist/docs");
const groups = ["Actions", "Forms", "Overlays", "Navigation", "Feedback", "Data", "Delight", "Email"];
const guides = {
  setup: "Setup: styles, fonts, provider, dark mode, right-to-left and Next.js",
  theming: "Theming: brand variables and contrast checks",
  forms: "Forms: validation, Zod and React Hook Form recipes",
  email: "Email: static HTML, explicit themes and ready-made templates",
};
const rules = [
  "Wrap the app in one KumikoProvider.",
  "Import `kumiko-ui/styles.css` after Tailwind and `kumiko-ui/fonts.css` once.",
  "Navigate with LinkButton or Link; never use a Button with a navigation click handler.",
  "Name every icon-only control with an accessible label.",
  "Put form controls in Field with FieldLabel and FieldError.",
  "Theme through `--kumiko-*` variables; do not override Kumiko's colour, radius or shadow classes with Tailwind.",
  'Turn on dark mode with `.dark` or `[data-theme="dark"]` on `<html>`. Never add `dark:` classes to Kumiko components; if the app\'s own markup uses `dark:`, add the custom variant from the setup guide.',
  "Explain a disabled control's reason in visible text, never only in a tooltip.",
  "Use container queries, not viewport breakpoints, inside components.",
]
  .map((rule) => `- ${rule}`)
  .join("\n");

// Base UI ships its docs in the package; inherited props point at the page for the part's module.
const baseUiDocs = join(dirname(createRequire(import.meta.url).resolve("@base-ui/react")), "docs/react/components");
function baseUiDoc(specifier: string): string {
  const slug = specifier.split("/")[2];
  const page = slug && [slug, `${slug}-group`].find((name) => existsSync(join(baseUiDocs, `${name}.md`)));
  return page
    ? ` (see \`@base-ui/react/docs/react/components/${page}.md\`, installed with Kumiko, or https://base-ui.com/react/components/${page})`
    : "";
}

function original(symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function owned(node: ts.Node): boolean {
  return relative(root, node.getSourceFile().fileName).startsWith("src/");
}

function documentation(symbol: ts.Symbol): string {
  return ts
    .displayPartsToString(symbol.getDocumentationComment(checker))
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+(?=Use when:|Avoid when:)/g, "\n\n");
}

function examples(symbol: ts.Symbol): string {
  return symbol
    .getJsDocTags(checker)
    .filter((tag) => tag.name === "example")
    .map((tag) => `\n\n### Example\n\n\`\`\`tsx\n${ts.displayPartsToString(tag.text).trim()}\n\`\`\``)
    .join("");
}

function code(text: string): string {
  const content = text.replace(/\s+/g, " ").trim().replaceAll("|", "\\|");
  const fence = "`".repeat(Math.max(0, ...(content.match(/`+/g) ?? []).map((run) => run.length)) + 1);
  const padding = fence.length > 1 ? " " : "";
  return `${fence}${padding}${content}${padding}${fence}`;
}

function inheritance(
  node: ts.TypeNode | ts.ExpressionWithTypeArguments,
  substitutions = new Map<string, ts.TypeNode>(),
  seen = new Set<ts.Declaration>(),
): string[] {
  if (ts.isParenthesizedTypeNode(node)) return inheritance(node.type, substitutions, seen);
  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node))
    return node.types.flatMap((type) => inheritance(type, substitutions, seen));
  if (!ts.isTypeReferenceNode(node) && !ts.isExpressionWithTypeArguments(node)) return [];
  const reference = ts.isTypeReferenceNode(node) ? node.typeName : node.expression;
  const name = reference.getText();
  const args = node.typeArguments ?? [];
  if (name === "Omit" || name === "Pick")
    return inheritance(args[0]!, substitutions, seen).map(
      // Before a "(see …)" docs pointer, so the sentence reads in order.
      (part) =>
        part.replace(/(?= \(see |$)/, ` (${name === "Omit" ? "excluding" : "only"} ${code(args[1]!.getText())})`),
    );
  if (name === "ComponentProps" || name === "ComponentPropsWithoutRef") {
    const tag = substitutions.get(args[0]!.getText()) ?? args[0]!;
    return [`${code(`<${tag.getText().replaceAll('"', "")}>`)}'s DOM props`];
  }
  const symbol = checker.getSymbolAtLocation(reference);
  if (!symbol) return [];
  const declaration = original(symbol).declarations?.find(
    (declaration) => ts.isInterfaceDeclaration(declaration) || ts.isTypeAliasDeclaration(declaration),
  );
  if (declaration && owned(declaration)) {
    if (seen.has(declaration)) return [];
    const visited = new Set([...seen, declaration]);
    const parameters = declaration.typeParameters ?? [];
    const generics = new Map(substitutions);
    parameters.forEach((parameter, index) => {
      const argument = args[index] ?? parameter.default;
      if (argument) generics.set(parameter.name.text, substitutions.get(argument.getText()) ?? argument);
    });
    return ts.isTypeAliasDeclaration(declaration)
      ? inheritance(declaration.type, generics, visited)
      : (declaration.heritageClauses?.flatMap((clause) =>
          clause.types.flatMap((type) => inheritance(type, generics, visited)),
        ) ?? []);
  }
  let identifier: ts.Node = reference;
  while (ts.isQualifiedName(identifier) || ts.isPropertyAccessExpression(identifier))
    identifier = ts.isQualifiedName(identifier) ? identifier.left : identifier.expression;
  const imported = checker.getSymbolAtLocation(identifier)?.declarations?.find(ts.isImportSpecifier);
  if (imported) {
    const module = imported.parent.parent.parent.moduleSpecifier;
    if (ts.isStringLiteral(module) && module.text.startsWith("@base-ui/react"))
      return [
        `Base UI ${name.replace(identifier.getText(), (imported.propertyName ?? imported.name).text).replace(/\.Props$/, "")}'s props${baseUiDoc(module.text)}`,
      ];
    if (ts.isStringLiteral(module)) return [`${code(name)} from ${code(module.text)}`];
  }
  return [code(node.getText())];
}

function propsTable(component: ts.FunctionDeclaration): string {
  const parameter = component.parameters[0];
  if (!parameter?.type) return "";
  const defaults = new Map<string, string>();
  if (ts.isObjectBindingPattern(parameter.name))
    for (const binding of parameter.name.elements)
      if (binding.initializer) {
        const name = binding.propertyName ?? binding.name;
        defaults.set(ts.isStringLiteral(name) ? name.text : name.getText(), binding.initializer.getText());
      }
  const rows = checker
    .getTypeAtLocation(parameter)
    .getProperties()
    .flatMap((property) => {
      const declarations = property.declarations?.filter(
        (declaration): declaration is ts.PropertySignature => ts.isPropertySignature(declaration) && owned(declaration),
      );
      if (!declarations?.length) return [];
      const types = [...new Set(declarations.map((declaration) => declaration.type?.getText() ?? "unknown"))];
      const name = `${declarations[0]!.name.getText()}${property.flags & ts.SymbolFlags.Optional ? "?" : ""}`;
      const description = ts
        .displayPartsToString(property.getDocumentationComment(checker))
        .replace(/\s+/g, " ")
        .replaceAll("|", "&#124;");
      const defaultValue = defaults.get(property.name);
      // An alias such as BadgeTone hides its values; spell out a union of literals next to the written type.
      const written = types.join(" | ");
      const value = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(property, parameter));
      const members = value.isUnion() ? value.types : [value];
      const resolved = members.map((member) => checker.typeToString(member)).join(" | ");
      const literals = members.every((member) => member.isStringLiteral() || member.isNumberLiteral());
      const type = literals && resolved !== written ? `${code(written)} (${code(resolved)})` : code(written);
      return `| ${code(name)} | ${type} | ${defaultValue === undefined ? "—" : code(defaultValue)} | ${description} |`;
    });
  const inherited = [...new Set(inheritance(parameter.type))].map(
    (part, index) => `${rows.length || index ? "Plus" : "Takes"} ${part}.`,
  );
  const table = rows.length
    ? [["| Name | Type | Default | Description |", "| --- | --- | --- | --- |", ...rows].join("\n")]
    : [];
  return `\n\n### Props (${code(parameter.type.getText())})\n\n${[...table, ...inherited].join("\n\n") || "Takes no props."}`;
}

function storyGroup(file: string): string | undefined {
  if (file.startsWith("src/email/")) return "Email";
  const story = join(root, file.replace(/(?:-styles)?\.tsx?$/, ".stories.tsx"));
  if (existsSync(story)) {
    const source = ts.createSourceFile(story, readFileSync(story, "utf8"), ts.ScriptTarget.Latest, true);
    let group: string | undefined;
    const visit = (node: ts.Node) => {
      if (ts.isPropertyAssignment(node) && node.name.getText() === "title" && ts.isStringLiteral(node.initializer))
        group ??= node.initializer.text.split("/")[0];
      ts.forEachChild(node, visit);
    };
    visit(source);
    // The packet groups Storybook's Display parts with Data, without changing Storybook itself.
    return group === "Display" ? "Data" : groups.includes(group ?? "") ? group : undefined;
  }
  if (/\/(field(?:set|-styles)?|radio)\.tsx?$/.test(file)) return "Forms";
  return undefined;
}

const modules = new Map<string, { entry: string; exports: { name: string; symbol: ts.Symbol }[] }>();
for (const [entry, file] of Object.entries({ "kumiko-ui": "src/index.ts", "kumiko-ui/email": "src/email/index.ts" })) {
  const source = program.getSourceFile(join(root, file))!;
  for (const exported of checker.getExportsOfModule(checker.getSymbolAtLocation(source)!)) {
    const symbol = original(exported);
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration || !owned(declaration)) throw new Error(`Cannot document public export ${exported.name}`);
    const file = relative(root, declaration.getSourceFile().fileName);
    const module = modules.get(file) ?? { entry, exports: [] };
    module.exports.push({ name: exported.name, symbol });
    modules.set(file, module);
  }
}

mkdirSync(join(docs, "components"), { recursive: true });
const indexGroups = new Map([...groups, "Shared exports"].map((group) => [group, [] as string[]]));
for (const [file, module] of [...modules].sort(([a], [b]) => a.localeCompare(b))) {
  const stem = basename(file).replace(/\.tsx?$/, "");
  const componentName = stem.replace(/(^|-)(\w)/g, (_, _separator, letter: string) => letter.toUpperCase());
  const main =
    module.exports.find(({ name }) => name === componentName) ??
    module.exports.find(({ symbol }) => symbol.flags & ts.SymbolFlags.Value) ??
    module.exports[0]!;
  // A component's props type is documented in the component's Props section, not as a section of its own.
  const documented = module.exports.filter(
    ({ name }) => !(name.endsWith("Props") && module.exports.some((other) => `${other.name}Props` === name)),
  );
  const sections = documented.map(({ name, symbol }) => {
    const doc = documentation(symbol);
    if (!doc.includes("Use when:") || !doc.includes("Avoid when:"))
      throw new Error(`${file}: ${name} needs a summary, Use when and Avoid when`);
    const declaration = symbol.valueDeclaration;
    const props =
      declaration && ts.isFunctionDeclaration(declaration) && /^[A-Z]/.test(name) ? propsTable(declaration) : "";
    const type = symbol.declarations?.find(ts.isTypeAliasDeclaration);
    return `## ${name}\n\n${doc}${type ? `\n\n\`\`\`ts\n${type.getText()}\n\`\`\`` : ""}${props}${examples(symbol)}`;
  });
  writeFileSync(
    join(docs, "components", `${stem}.md`),
    `# ${main.name}\n\nImport from ${code(module.entry)}.\n\n${sections.join("\n\n")}\n`,
  );
  const group = storyGroup(file) ?? "Shared exports";
  const components = module.exports.filter(
    ({ name, symbol }) =>
      /^[A-Z]/.test(name) && !!symbol.valueDeclaration && ts.isFunctionDeclaration(symbol.valueDeclaration),
  );
  for (const component of components.length ? components : [main]) {
    const summary = documentation(component.symbol).split("\n\n")[0]!;
    indexGroups
      .get(group)!
      .push(`- [${component.name}](components/${stem}.md#${component.name.toLowerCase()}): ${summary}`);
  }
}

for (const guide of ["setup", "theming", "forms"]) {
  // Source links point into the repo; installed guides point at the recipe copies shipped beside them.
  const guideText = readFileSync(join(root, "docs", `${guide}.md`), "utf8");
  writeFileSync(join(docs, `${guide}.md`), guideText.replaceAll("../src/recipes/", "recipes/"));
}
mkdirSync(join(docs, "recipes"), { recursive: true });
for (const recipe of ["job-alert.ts", "zod-form.stories.tsx", "react-hook-form.stories.tsx"])
  copyFileSync(join(root, "src/recipes", recipe), join(docs, "recipes", recipe));
const emailSource = program.getSourceFile(join(root, "src/email/index.ts"))!;
const emailDoc = ts.getJSDocCommentsAndTags(emailSource.statements[0]!).find(ts.isJSDoc);
if (!emailDoc) throw new Error("src/email/index.ts needs its usage JSDoc");
writeFileSync(
  join(docs, "email.md"),
  `# Email kit\n\n${ts.getTextOfJSDocComment(emailDoc.comment) ?? ""}\n\n${
    emailDoc.tags
      ?.filter((tag) => tag.tagName.text === "example")
      .map((tag) => `\`\`\`tsx\n${ts.getTextOfJSDocComment(tag.comment)?.trim()}\n\`\`\``)
      .join("\n\n") ?? ""
  }\n`,
);

const guideLinks = (prefix: string) =>
  Object.entries(guides)
    .map(([guide, description]) => `- [${description}](${prefix}${guide}.md)`)
    .join("\n");
writeFileSync(
  join(docs, "README.md"),
  `# Kumiko agent guide\n\n## Rules for agents\n\n${rules}\n\n## Guides\n\n${guideLinks("")}\n\n${[...indexGroups]
    .map(([group, links]) => `## ${group}\n\n${links.join("\n")}`)
    .join("\n\n")}\n`,
);
writeFileSync(
  join(destination, "llms.txt"),
  `# Kumiko\n\n> Kumiko (kumiko-ui) is an accessible React 19 component library built on Base UI and Tailwind CSS v4, with a playful look in the spirit of Duolingo: buttons that press onto a darker edge, bright colours, characters and celebrations. It supports dark mode and right-to-left layouts.\n\n## Install and setup\n\n1. Install with \`npm install kumiko-ui\`; use React 19 and Tailwind CSS 4.3 or later.\n2. In global CSS, import \`tailwindcss\`, then \`kumiko-ui/styles.css\`.\n3. Import \`kumiko-ui/fonts.css\` once in the root layout.\n4. Import \`KumikoProvider\` from \`kumiko-ui\`.\n5. Wrap the app in \`<KumikoProvider direction="ltr" locale="en">{children}</KumikoProvider>\`; set theme, lang and dir on \`<html>\`.\n\n## Rules for agents\n\n${rules}\n\n## Documentation\n\n- [Component index](dist/docs/README.md): summaries, props and examples for every public module.\n- Base UI's own docs, for the props Kumiko passes through: \`docs/index.md\` in the installed \`@base-ui/react\` package, or https://base-ui.com.\n\n## Guides\n\n${guideLinks("dist/docs/")}\n`,
);
console.log(`Generated ${modules.size} component module guides, four guides and llms.txt`);
