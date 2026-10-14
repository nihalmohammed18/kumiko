// Storybook only. Lets a story draw hover, keyboard-focus and pressed styles without a pointer or keyboard, so
// screenshots catch changes to them: every :hover, :focus-visible and :active rule is copied to also match
// data-demo="hover" | "focus" | "active". Kumiko's shipped CSS is untouched.
const states: Array<[string, RegExp]> = [
  ["hover", /(?<!\\):hover(?![\w-])/],
  ["focus", /(?<!\\):focus-visible(?![\w-])/],
  ["active", /(?<!\\):active(?![\w-])/],
];
const seen = new WeakSet<CSSRule>();

// Handles both shapes Tailwind emits: flat rules inside @media/@supports (builds) and nested rules (dev server).
function mirror(owner: CSSStyleSheet | CSSGroupingRule) {
  const rules = owner.cssRules;
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];
    if (!rule || seen.has(rule)) continue;
    seen.add(rule);
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText;
      for (const [name, re] of states) {
        if (!re.test(selector) || !rule.cssText.startsWith(selector)) continue;
        const copy = selector.replace(new RegExp(re.source, "g"), `[data-demo~="${name}"]`);
        const added = owner.cssRules[owner.insertRule(copy + rule.cssText.slice(selector.length), i + 1)];
        if (added) seen.add(added);
      }
    }
    if ("cssRules" in rule) mirror(rule as CSSGroupingRule);
  }
}

export function mirrorDemoStates() {
  for (const sheet of document.styleSheets) {
    try {
      mirror(sheet);
    } catch {
      // A cross-origin stylesheet can't be read; Kumiko's own styles are always same-origin.
    }
  }
}
