// Guards that keep Kumiko consistent, beyond what lint and types catch.
//   node scripts/check.ts         checks src/
//   node scripts/check.ts --dist  checks the build (run after tsc)
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { themeCss, tokensCss } from "./build-tokens.ts";
import { CLOSED_DEBTS, validateUxExcept } from "./ux-rules.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const OVERLAY_FILES: ReadonlySet<string> = new Set();
const SHELL_FILES: ReadonlySet<string> = new Set();
const UPPERCASE_FILES = new Set(["src/components/button-styles.ts", "src/components/badge-styles.ts"]);
const OVERLAY_PATH = /^src\/components\/(dialog|alert-dialog|drawer|popover|sidebar|sheet)[^/]*$/;

/** A guard failure with a stable text match for debt tracking.
 * Use when: reporting or matching a static violation. Avoid when: checking browser behavior.
 */
export interface Problem {
  file: string;
  line: number;
  col: number;
  rule: string;
  message: string;
  match: string;
}

interface ClassToken {
  text: string;
  index: number;
  utility: string;
  variants: string[];
}
interface ClassContext {
  file: string;
  palette: ReadonlySet<string>;
  rtlTranslate: boolean;
}

const COLOR_PREFIXES = `ring-offset inset-ring inset-shadow text-shadow drop-shadow
  border-x border-y border-t border-b border-s border-e border-l border-r bg text border outline ring shadow
  fill stroke from via to decoration divide accent caret placeholder`.split(/\s+/);
const COLOR_ONLY_PREFIXES = new Set(["bg", "fill", "from", "via", "to", "accent", "caret", "placeholder"]);
const CSS_NAMED_COLORS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond
  blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan
  darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange
  darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet
  deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite
  gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush
  lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey
  lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime
  limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
  mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin
  navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise
  palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue
  saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow
  springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`.split(
    /\s+/,
  ),
);
const BUILT_CLASS_PREFIXES = new Set([
  ...COLOR_PREFIXES,
  ...`m mx my ms me mt mb ml mr p px py ps pe pt pb pl pr
  scroll w h min max size gap rounded font leading tracking duration delay ease transition animate z translate
  rotate scale opacity grid col row flex basis grow shrink items justify content self overflow inset start end
  top bottom left right cursor object origin order`.split(/\s+/),
]);

function parseSource(text: string, file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}
function visit(node: ts.Node, inspect: (node: ts.Node) => void) {
  inspect(node);
  ts.forEachChild(node, (child) => visit(child, inspect));
}
function problemAt(source: ts.SourceFile, pos: number, rule: string, message: string, match: string): Problem {
  const { line, character } = source.getLineAndCharacterOfPosition(pos);
  return { file: source.fileName, line: line + 1, col: character + 1, rule, message, match };
}
function nodeProblem(node: ts.Node, rule: string, message: string): Problem {
  const source = node.getSourceFile();
  return problemAt(source, node.getStart(source), rule, message, node.getText(source));
}
function fileProblem(file: string, rule: string, message: string, match: string): Problem {
  return { file, line: 1, col: 1, rule, message, match };
}

/** Formats one failure for the command line.
 * Use when: printing guard results. Avoid when: matching debt; use the structured fields.
 */
export function formatProblem(problem: Problem): string {
  return `${problem.file}:${problem.line}:${problem.col}: ${problem.rule}: ${problem.message}: ${problem.match.replace(/\s+/g, " ")}`;
}

function classTokens(text: string): ClassToken[] {
  return Array.from(text.matchAll(/\S+/g), (match) => {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < match[0].length; i++) {
      const char = match[0][i];
      if (char === "\\") {
        i++;
        continue;
      }
      if (char === "[" || char === "(") depth++;
      else if (char === "]" || char === ")") depth--;
      else if (char === ":" && depth === 0) {
        parts.push(match[0].slice(start, i));
        start = i + 1;
      }
    }
    const utility = match[0].slice(start).replace(/^!|!$/g, "");
    return { text: match[0], index: match.index, utility, variants: parts };
  });
}
function colorUtility(utility: string) {
  const prefix = COLOR_PREFIXES.find((candidate) => utility.startsWith(`${candidate}-`));
  return prefix ? { prefix, value: utility.slice(prefix.length + 1) } : undefined;
}
function arbitraryValue(value: string): string | undefined {
  if (value.startsWith("[")) return value.slice(1, value.lastIndexOf("]"));
  if (value.startsWith("(")) return value.slice(1, value.lastIndexOf(")"));
  return undefined;
}
function physicalProperty(property: string, value: string): boolean {
  return (
    /^(?:margin|padding)-(?:left|right)$/.test(property) ||
    /^(?:border-(?:left|right)|left$|right$)/.test(property) ||
    (["float", "clear", "text-align"].includes(property) && /^(?:left|right)(?:\s*!important)?$/.test(value.trim()))
  );
}
function physicalUtility(token: ClassToken, context: ClassContext): boolean {
  const utility = token.utility;
  if (/^-?(?:(?:m|p|scroll-m|scroll-p)[lr]-|(?:left|right)-)/.test(utility)) return true;
  if (/^(?:border-[lr]|rounded-(?:[lr]|[tb][lr]))(?:-|$)/.test(utility)) return true;
  if (/^(?:text|float|clear)-(?:left|right)$/.test(utility)) return true;
  if (
    /^(?:origin|bg|object)-(?:left|right|top-left|top-right|bottom-left|bottom-right|left-top|left-bottom|right-top|right-bottom)$/.test(
      utility,
    )
  )
    return true;
  if (/^-?translate-x-/.test(utility) && !context.rtlTranslate) return true;
  if (utility.startsWith("[")) {
    const [property = "", ...value] = (arbitraryValue(utility) ?? "").split(":");
    return physicalProperty(property, value.join(":").replace(/_/g, " "));
  }
  return false;
}
function rawColor(token: ClassToken, context: ClassContext): boolean {
  const value = colorUtility(token.utility)?.value.split("/")[0];
  if (!value) return false;
  if (value === "black" || value === "white") return true;
  const shade = /^(.*)-\d+$/.exec(value);
  return !!shade && context.palette.has(shade[1]!);
}
function arbitraryColor(token: ClassToken): boolean {
  const color = colorUtility(token.utility);
  if (!color) return false;
  const value = arbitraryValue(color.value)
    ?.replace(/^[a-z-]+:/i, "")
    .trim();
  if (value === undefined) return false;
  const variables = value.startsWith("--")
    ? [value]
    : Array.from(value.matchAll(/var\(\s*(--[\w-]+)/g), (match) => match[1]!);
  if (value.startsWith("--") || value.startsWith("var(")) {
    return !variables.length || variables.some((name) => !name.startsWith("--kumiko-") && !name.startsWith("--press-"));
  }
  if (COLOR_ONLY_PREFIXES.has(color.prefix)) return !/^url\(/i.test(value);
  return (
    /^(?:#|rgb|hsl|oklch|oklab|lab\(|lch\(|hwb\(|color\(|color-mix)/i.test(value) ||
    CSS_NAMED_COLORS.has(value.toLowerCase())
  );
}
function viewportSize(token: ClassToken, context: ClassContext): boolean {
  if (/^(?:h|min-h|max-h|w|min-w|max-w)-screen$/.test(token.utility)) return true;
  const value = /\[(.*)\]/.exec(token.utility)?.[1] ?? "";
  return Array.from(value.matchAll(/\d([dsl]?v[hw])(?=[^a-z]|$)/gi)).some(
    (match) => match[1]!.length === 2 || !OVERLAY_FILES.has(context.file) || !OVERLAY_PATH.test(context.file),
  );
}

const CLASS_RULES: Array<[string, string, (token: ClassToken, context: ClassContext) => boolean]> = [
  ["physical-direction", "use logical properties and mirror horizontal translations in rtl", physicalUtility],
  ["raw-color", "use a theme colour token", rawColor],
  ["arbitrary-color", "add a colour token to src/tokens.ts", arbitraryColor],
  [
    "motion-raw",
    "use motion tokens and explicit transition properties",
    ({ utility }) =>
      /^(?:transition(?:-all)?|(?:duration|delay)-\d+(?:\.\d+)?|ease-(?:linear|in|out|in-out)|animate-(?:spin|pulse|bounce|ping))$/.test(
        utility,
      ),
  ],
  ["outline-none", "use outline-hidden or the focus recipe", ({ utility }) => utility === "outline-none"],
  [
    "focus-variant",
    "draw focus rings on focus-visible:, so a mouse press shows none",
    ({ utility, variants }) => variants.includes("focus") && /^(?:outline|ring)(?:-|$)/.test(utility),
  ],
  ["dark-variant", "let theme tokens switch in dark mode", ({ variants }) => variants.includes("dark")],
  ["raw-z", "use a named layer token", ({ utility }) => /^-?z-(?:\d+|\[.*\])$/.test(utility)],
  ["viewport-size", "use container sizes; dynamic viewport units require an overlay allowlist entry", viewportSize],
  [
    "disabled-opacity",
    "keep the disabled face and edge; never remove pointer events",
    ({ utility, variants }) =>
      variants.some((variant) => ["disabled", "data-disabled", "aria-disabled"].includes(variant)) &&
      (utility.startsWith("opacity-") || utility === "pointer-events-none"),
  ],
  [
    "elevation",
    "use the shared press edge without shadows, blur or gradients",
    ({ utility }) =>
      /^(?:shadow|drop-shadow)(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?$/.test(utility) ||
      /^(?:blur(?:-|$)|backdrop-|bg-(?:gradient|linear|radial|conic)(?:-|$))/.test(utility),
  ],
  [
    "uppercase",
    "uppercase belongs only in button and badge recipes",
    ({ utility }, { file }) => utility === "uppercase" && !UPPERCASE_FILES.has(file),
  ],
  [
    "viewport-breakpoint",
    "use container-query variants",
    ({ variants }, { file }) =>
      !OVERLAY_FILES.has(file) &&
      !SHELL_FILES.has(file) &&
      variants.some((variant) => /^(?:(?:max-)?(?:sm|md|lg|xl|2xl)|(?:min|max)-\[.*\])$/.test(variant)),
  ],
];

type Literal = ts.StringLiteral | ts.TemplateLiteralToken;
function isLiteral(node: ts.Node): node is Literal {
  return ts.isStringLiteral(node) || ts.isTemplateLiteralToken(node);
}
function templateOf(node: Literal): ts.TemplateExpression | undefined {
  if (ts.isTemplateExpression(node.parent)) return node.parent;
  if (ts.isTemplateSpan(node.parent) && ts.isTemplateExpression(node.parent.parent)) return node.parent.parent;
  return undefined;
}
function isFragmentAttribute(node: ts.Node): boolean {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isJsxAttribute(parent)) return ["href", "id", "to", "xlinkHref", "htmlFor"].includes(parent.name.getText());
  }
  return false;
}
function literalPosition(node: Literal, source: ts.SourceFile, offset: number): number {
  const start = node.getStart(source) + 1;
  const end = ts.isTemplateHead(node) || ts.isTemplateMiddle(node) ? -2 : -1;
  const raw = node.getText(source).slice(1, end);
  if (raw === node.text) return start + offset;
  let rawOffset = 0;
  let cookedOffset = 0;
  while (cookedOffset < offset && rawOffset < raw.length) {
    if (raw[rawOffset] === "\\") {
      rawOffset++;
      if (raw[rawOffset] === "\n" || raw[rawOffset] === "\r") {
        if (raw[rawOffset] === "\r" && raw[rawOffset + 1] === "\n") rawOffset++;
        rawOffset++;
        continue;
      }
      const escapeSequence = /^(?:u\{([\da-f]+)\}|u[\da-f]{4}|x[\da-f]{2}|[0-7]{1,3}|.)/i.exec(raw.slice(rawOffset));
      rawOffset += escapeSequence?.[0].length ?? 1;
      cookedOffset += escapeSequence?.[1] && Number.parseInt(escapeSequence[1], 16) > 0xffff ? 2 : 1;
    } else {
      if (raw[rawOffset] === "\r" && raw[rawOffset + 1] === "\n") rawOffset++;
      rawOffset++;
      cookedOffset++;
    }
  }
  return start + rawOffset;
}
function lintLiteral(node: Literal, source: ts.SourceFile, palette: ReadonlySet<string>): Problem[] {
  const problems: Problem[] = [];
  const template = templateOf(node);
  const text = template
    ? [template.head.text, ...template.templateSpans.map((span) => span.literal.text)].join(" ")
    : node.text;
  const context = {
    file: source.fileName,
    palette,
    rtlTranslate: classTokens(text).some(
      (token) => token.variants.includes("rtl") && /^-?translate-x-/.test(token.utility),
    ),
  };
  const position = (offset: number) => literalPosition(node, source, offset);
  for (const token of classTokens(node.text)) {
    for (const [rule, message, flag] of CLASS_RULES) {
      if (flag(token, context)) problems.push(problemAt(source, position(token.index), rule, message, token.text));
    }
  }
  if (!isFragmentAttribute(node)) {
    const withoutUrls = node.text.replace(/url\(\s*["']?#[^)]*\)/gi, (match) => " ".repeat(match.length));
    for (const match of withoutUrls.matchAll(/#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b/gi))
      problems.push(problemAt(source, position(match.index), "hex", "colours come from tokens", match[0]));
  }
  if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node)) {
    const token = classTokens(node.text).at(-1);
    const utility = token?.utility.replace(/^-/, "") ?? "";
    if (/^(?:[a-z0-9]+-)+$/.test(utility) && BUILT_CLASS_PREFIXES.has(utility.split("-")[0]!))
      problems.push(
        problemAt(
          source,
          position(token!.index),
          "built-class",
          "write each class in full so Tailwind can find it",
          token!.text,
        ),
      );
  }
  return problems;
}
function unwrap(node: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node)
  )
    node = node.expression;
  return node;
}
function propertyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  if (ts.isComputedPropertyName(name) && ts.isStringLiteral(name.expression)) return name.expression.text;
  return undefined;
}
function lintStyle(node: ts.JsxAttribute, source: ts.SourceFile): Problem[] {
  if (
    node.name.getText(source) !== "style" ||
    !node.initializer ||
    !ts.isJsxExpression(node.initializer) ||
    !node.initializer.expression
  )
    return [];
  const value = unwrap(node.initializer.expression);
  if (!ts.isObjectLiteralExpression(value)) return [];
  return value.properties.flatMap((property) => {
    if (!property.name) return [];
    const name = propertyName(property.name) ?? "";
    const styleValue = ts.isPropertyAssignment(property) ? literalValue(property.initializer) : undefined;
    const textAlign = name === "textAlign" && (styleValue === "left" || styleValue === "right");
    if (
      !["marginLeft", "marginRight", "paddingLeft", "paddingRight", "left", "right"].includes(name) &&
      !/^border(?:Left|Right)/.test(name) &&
      !textAlign
    )
      return [];
    return [nodeProblem(property, "physical-direction", "use logical inline style properties")];
  });
}

const CLIENT_HOOKS = new Set(
  `useState useEffect useLayoutEffect useInsertionEffect useReducer useRef useContext
  useSyncExternalStore useTransition useOptimistic useActionState useImperativeHandle useDeferredValue
  createContext`.split(/\s+/),
);
const BASE_HOOKS = new Set(["useRender", "useDirection"]);

function clientDirective(source: ts.SourceFile): ts.ExpressionStatement | undefined {
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    if (statement.expression.text === "use client") return statement;
  }
  return undefined;
}
function beginsWithClient(source: ts.SourceFile): boolean {
  const directive = clientDirective(source);
  return !!directive && directive === source.statements[0];
}
function lintClient(source: ts.SourceFile): Problem[] {
  const problems: Problem[] = [];
  const directive = clientDirective(source);
  if (directive && source.fileName.endsWith("-styles.ts"))
    problems.push(nodeProblem(directive, "client-directive", "class recipes must remain server-safe"));
  const names = new Set(CLIENT_HOOKS);
  const baseNamespaces = new Set<string>();
  let clientUse: ts.Node | undefined;
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.importClause?.isTypeOnly
    )
      continue;
    const module = statement.moduleSpecifier.text;
    const base = module === "@base-ui/react" || module.startsWith("@base-ui/react/");
    const bindings = statement.importClause?.namedBindings;
    if (base && bindings && ts.isNamespaceImport(bindings)) baseNamespaces.add(bindings.name.text);
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const specifier of bindings.elements) {
      if (specifier.isTypeOnly) continue;
      const imported = (specifier.propertyName ?? specifier.name).text;
      if (module === "react" && CLIENT_HOOKS.has(imported)) names.add(specifier.name.text);
      if (base && BASE_HOOKS.has(imported)) clientUse ??= specifier;
    }
  }
  visit(source, (node) => {
    if (clientUse || !ts.isCallExpression(node)) return;
    const callee = unwrap(node.expression);
    if (ts.isIdentifier(callee) && names.has(callee.text)) clientUse = node;
    if (
      ts.isPropertyAccessExpression(callee) &&
      (CLIENT_HOOKS.has(callee.name.text) ||
        (ts.isIdentifier(callee.expression) &&
          baseNamespaces.has(callee.expression.text) &&
          BASE_HOOKS.has(callee.name.text)))
    )
      clientUse = node;
    if (
      ts.isElementAccessExpression(callee) &&
      callee.argumentExpression &&
      ts.isStringLiteral(callee.argumentExpression) &&
      CLIENT_HOOKS.has(callee.argumentExpression.text)
    )
      clientUse = node;
  });
  if (clientUse && !beginsWithClient(source))
    problems.push(nodeProblem(clientUse, "client-directive", 'begin this file with "use client"'));
  return problems;
}

/** Checks component literals and inline styles using the TypeScript AST.
 * Use when: enforcing static component rules. Avoid when: checking stories or runtime styles.
 */
export function lintComponent(text: string, file: string, palette: ReadonlySet<string>): Problem[] {
  const source = parseSource(text, file);
  const problems: Problem[] = lintClient(source);
  visit(source, (node) => {
    if (isLiteral(node)) problems.push(...lintLiteral(node, source, palette));
    if (ts.isJsxAttribute(node)) problems.push(...lintStyle(node, source));
  });
  return problems;
}

/** Reads palette names from Tailwind's installed theme text.
 * Use when: preparing the component guard. Avoid when: maintaining a hard-coded palette list.
 */
export function readPaletteNames(css: string): Set<string> {
  return new Set(Array.from(maskCssComments(css).matchAll(/--color-([\w-]+)-\d+\s*:/g), (match) => match[1]!));
}

function maskCssComments(text: string): string {
  let masked = "";
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (char === "\\") {
      masked += text.slice(i, i + 2);
      i++;
      continue;
    }
    if (!quote && text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i + 2);
      const stop = end === -1 ? text.length : end + 2;
      masked += text.slice(i, stop).replace(/[^\r\n]/g, " ");
      i = stop - 1;
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    masked += char;
  }
  return masked;
}
function cssDeclarations(text: string) {
  const masked = maskCssComments(text);
  const declarations: Array<{ property: string; value: string; pos: number; text: string }> = [];
  let quote = "";
  let nesting = 0;
  let blocks = 0;
  let start = 0;
  for (let i = 0; i < masked.length; i++) {
    const char = masked[i];
    if (char === "\\") {
      i++;
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(" || char === "[") nesting++;
    else if (char === ")" || char === "]") nesting--;
    else if (nesting === 0 && char === "{") {
      blocks++;
      start = i + 1;
    } else if (nesting === 0 && (char === ";" || char === "}")) {
      const match = /^(\s*)([\w-]+)\s*:\s*([\s\S]*)$/.exec(masked.slice(start, i));
      if (blocks > 0 && match)
        declarations.push({
          property: match[2]!.toLowerCase(),
          value: match[3]!.trim().toLowerCase(),
          pos: start + match[1]!.length,
          text: text.slice(start + match[1]!.length, i).trim(),
        });
      if (char === "}") blocks--;
      start = i + 1;
    }
  }
  return declarations;
}

/** Checks CSS declarations while ignoring comments and quoted content.
 * Use when: enforcing logical CSS and explicit transitions. Avoid when: checking generated tokens.css or theme.css.
 */
export function lintCss(text: string, file: string): Problem[] {
  const source = parseSource(text, file);
  return cssDeclarations(text).flatMap(({ property, value, pos, text: declaration }) => {
    const physical = physicalProperty(property, value);
    const all =
      ["transition", "transition-property"].includes(property) && /(?:^|,)\s*all(?:\s|,|!important|$)/.test(value);
    return physical || all
      ? [
          problemAt(
            source,
            pos,
            "css-physical",
            physical ? "use logical CSS properties" : "never transition all",
            declaration,
          ),
        ]
      : [];
  });
}

/** Checks that generated CSS still matches its token source byte for byte.
 * Use when: validating src/tokens.css or src/theme.css. Avoid when: accepting hand-edited generated CSS.
 */
export function lintTokens(actual: string, expected: string, file = "src/tokens.css"): Problem[] {
  return actual === expected
    ? []
    : [fileProblem(file, "tokens-stale", "run `pnpm tokens`", "generated CSS differs from its generator")];
}

/** Checks that compilation preserved a leading client directive.
 * Use when: validating dist after building. Avoid when: deciding which source files need the directive.
 */
export function lintDist(sourceText: string, outputText: string, file: string): Problem[] {
  const source = parseSource(sourceText, file);
  const output = parseSource(outputText, file);
  if (!beginsWithClient(source)) return [];
  return beginsWithClient(output)
    ? []
    : [fileProblem(file, "client-directive", 'lost its "use client" line', '"use client"')];
}

function objectLiteral(expression: ts.Expression | undefined): ts.ObjectLiteralExpression | undefined {
  if (!expression) return undefined;
  const value = unwrap(expression);
  return ts.isObjectLiteralExpression(value) ? value : undefined;
}
function objectProperty(
  object: ts.ObjectLiteralExpression | undefined,
  name: string,
): ts.PropertyAssignment | undefined {
  return object?.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && propertyName(property.name) === name,
  );
}
function literalValue(expression: ts.Expression | undefined): unknown {
  if (!expression) return undefined;
  const value = unwrap(expression);
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  if (value.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value.kind === ts.SyntaxKind.FalseKeyword) return false;
  return undefined;
}
function staticValue(expression: ts.Expression): unknown {
  const value = unwrap(expression);
  if (ts.isArrayLiteralExpression(value)) return value.elements.map(staticValue);
  if (ts.isObjectLiteralExpression(value)) {
    const entries: Array<[string, unknown]> = [];
    for (const property of value.properties) {
      if (!ts.isPropertyAssignment(property)) return undefined;
      const name = propertyName(property.name);
      if (name === undefined) return undefined;
      entries.push([name, staticValue(property.initializer)]);
    }
    return Object.fromEntries(entries);
  }
  return literalValue(value);
}
function a11yOptOuts(root: ts.PropertyAssignment): ts.PropertyAssignment[] {
  const a11y = objectLiteral(objectProperty(objectLiteral(root.initializer), "a11y")?.initializer);
  const disabled: ts.PropertyAssignment[] = [];
  const add = (object: ts.ObjectLiteralExpression | undefined, key: string, values: unknown[]) => {
    const property = objectProperty(object, key);
    if (property && values.includes(literalValue(property.initializer))) disabled.push(property);
  };
  if (propertyName(root.name) === "globals") {
    add(a11y, "manual", [true]);
    return disabled;
  }
  add(a11y, "test", ["off", "todo"]);
  add(a11y, "disable", [true]);
  const config = objectLiteral(objectProperty(a11y, "config")?.initializer);
  const rules = objectProperty(config, "rules")?.initializer;
  if (rules && ts.isArrayLiteralExpression(unwrap(rules)))
    for (const rule of (unwrap(rules) as ts.ArrayLiteralExpression).elements)
      add(objectLiteral(rule), "enabled", [false]);
  const options = objectLiteral(objectProperty(a11y, "options")?.initializer);
  const optionRules = objectLiteral(objectProperty(options, "rules")?.initializer);
  for (const rule of optionRules?.properties ?? [])
    if (ts.isPropertyAssignment(rule)) add(objectLiteral(rule.initializer), "enabled", [false]);
  return disabled;
}
function hasA11yReason(property: ts.PropertyAssignment, root: ts.PropertyAssignment, source: ts.SourceFile): boolean {
  for (let node: ts.Node | undefined = property; node; node = node.parent) {
    if (ts.isPropertyAssignment(node)) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line;
      for (const comment of ts.getLeadingCommentRanges(source.text, node.getFullStart()) ?? []) {
        if (comment.kind !== ts.SyntaxKind.SingleLineCommentTrivia) continue;
        const commentLine = source.getLineAndCharacterOfPosition(comment.pos).line;
        const lineStart = source.getPositionOfLineAndCharacter(commentLine, 0);
        const reason = /^\/\/\s*a11y-exception:\s*(.*)$/.exec(source.text.slice(comment.pos, comment.end))?.[1]?.trim();
        if (
          commentLine === line - 1 &&
          !source.text.slice(lineStart, comment.pos).trim() &&
          reason &&
          reason.length >= 15
        )
          return true;
      }
    }
    if (node === root) break;
  }
  return false;
}

/** Checks story opt-outs using AST properties and their leading comments.
 * Use when: validating story parameters and globals. Avoid when: linting component class strings.
 */
export function lintStory(text: string, file: string): Problem[] {
  const source = parseSource(text, file);
  const problems: Problem[] = [];
  visit(source, (node) => {
    if (!ts.isPropertyAssignment(node) || !["parameters", "globals"].includes(propertyName(node.name) ?? "")) return;
    for (const property of a11yOptOuts(node)) {
      if (!hasA11yReason(property, node, source))
        problems.push(
          nodeProblem(property, "a11y-exception", "add a leading // a11y-exception: reason of at least 15 characters"),
        );
    }
    if (propertyName(node.name) === "parameters") {
      const ux = objectLiteral(objectProperty(objectLiteral(node.initializer), "ux")?.initializer);
      const except = objectProperty(ux, "except");
      if (except)
        for (const message of validateUxExcept(staticValue(except.initializer)))
          problems.push(nodeProblem(except, "ux-exception", message));
    }
  });
  return problems;
}

/** An exact, documented waiver for an existing violation.
 * Use when: recording debt for a later packet. Avoid when: exempting an entire file or rule.
 */
export interface DebtEntry {
  file: string;
  rule: string;
  match: string;
  debt: string;
  reason: string;
}
function isDebtEntry(value: unknown): value is DebtEntry {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return ["file", "rule", "match", "debt", "reason"].every(
    (key) => typeof entry[key] === "string" && (entry[key] as string).trim().length > 0,
  );
}
function matchesDebt(problem: Problem, entry: DebtEntry): boolean {
  return problem.file === entry.file && problem.rule === entry.rule && problem.match === entry.match;
}

/** Suppresses exact open debt and reports malformed, stale or closed entries.
 * Use when: applying check-debt.json to source problems. Avoid when: suppressing lost build directives.
 */
export function applyDebt(
  problems: readonly Problem[],
  value: unknown,
  closedDebts: readonly string[] = CLOSED_DEBTS,
): Problem[] {
  const debtProblems: Problem[] = [];
  const open: DebtEntry[] = [];
  const report = (rule: string, message: string, entry: unknown) =>
    debtProblems.push(fileProblem("scripts/check-debt.json", rule, message, JSON.stringify(entry) ?? "undefined"));
  if (!Array.isArray(value)) report("debt-entry", "debt ledger must be an array", value);
  else
    value.forEach((entry: unknown, index) => {
      if (!isDebtEntry(entry)) {
        report("debt-entry", `entry ${index} needs non-empty file, rule, match, debt and reason strings`, entry);
        return;
      }
      if (closedDebts.includes(entry.debt))
        report("closed-debt", `entry ${index} refers to closed debt ${entry.debt}`, entry);
      else open.push(entry);
      if (!problems.some((problem) => matchesDebt(problem, entry)))
        report("stale-debt", `stale debt: entry ${index} no longer matches a problem`, entry);
    });
  return [...problems.filter((problem) => !open.some((entry) => matchesDebt(problem, entry))), ...debtProblems];
}

/** Selects source files before the command line reads their contents.
 * Use when: choosing component, story or CSS guards. Avoid when: checking generated CSS staleness.
 */
export function sourceKind(file: string): "component" | "story" | "css" | undefined {
  if (!file.startsWith("src/") || file.split("/").at(-1)?.startsWith(".env") || /\.test\.tsx?$/.test(file))
    return undefined;
  if (file.endsWith(".stories.tsx")) return "story";
  if (["src/tokens.ts", "src/tokens.css", "src/theme.css"].includes(file)) return undefined;
  if (/\.tsx?$/.test(file)) return "component";
  if (file.endsWith(".css")) return "css";
  return undefined;
}
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : entry.isFile() ? [path] : [];
    })
    .sort();
}
function checkSource(): Problem[] {
  const palette = readPaletteNames(
    readFileSync(createRequire(import.meta.url).resolve("tailwindcss/theme.css"), "utf8"),
  );
  const problems = [
    ...lintTokens(readFileSync(join(root, "src/tokens.css"), "utf8"), tokensCss()),
    ...lintTokens(readFileSync(join(root, "src/theme.css"), "utf8"), themeCss(), "src/theme.css"),
  ];
  for (const path of walk(join(root, "src"))) {
    const file = relative(root, path);
    const kind = sourceKind(file);
    if (!kind) continue;
    const text = readFileSync(path, "utf8");
    if (kind === "story") problems.push(...lintStory(text, file));
    else if (kind === "css") problems.push(...lintCss(text, file));
    else problems.push(...lintComponent(text, file, palette));
  }
  return applyDebt(problems, JSON.parse(readFileSync(join(root, "scripts/check-debt.json"), "utf8")));
}
function checkDist(): Problem[] {
  const problems: Problem[] = [];
  for (const path of walk(join(root, "src"))) {
    const file = relative(root, path);
    if (sourceKind(file) !== "component") continue;
    const text = readFileSync(path, "utf8");
    const source = parseSource(text, file);
    if (!beginsWithClient(source)) continue;
    const out = file.replace(/^src\//, "dist/").replace(/\.tsx?$/, ".js");
    problems.push(...lintDist(text, readFileSync(join(root, out), "utf8"), out));
  }
  return problems;
}

if (import.meta.main) {
  const problems = process.argv.includes("--dist") ? checkDist() : checkSource();
  if (problems.length) {
    console.error(problems.map(formatProblem).join("\n"));
    process.exit(1);
  }
  console.log(process.argv.includes("--dist") ? "dist checks passed" : "source checks passed");
}
