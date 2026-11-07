/** The UX rule ids shared by static validation and the browser harness.
 * Use when: naming a UX rule or exception. Avoid when: naming a static source guard.
 */
export const RULE_IDS = [
  "cursor",
  "disabled-inert",
  "hover-visible",
  "press-visible",
  "no-layout-shift",
  "focus-ring",
  "target-size",
  "edge-clip",
  "edge-visible",
  "reduce-no-move",
  "transitions",
  "settle",
  "reflow",
  "text-overflow",
  "input-font",
  "no-sticky-hover",
  "boundary",
  "state-not-color",
  "directional",
  "color-scheme",
  "dead-class",
  "stale-exception",
] as const;

/** The projects supported by the UX harness.
 * Use when: scoping a UX exception. Avoid when: naming a rule.
 */
export const MODES = ["light", "dark", "rtl", "touch", "forced", "motion"] as const;

/** Debt packets whose exceptions must no longer suppress failures.
 * Use when: closing a completed debt packet. Avoid when: suppressing new violations.
 */
export const CLOSED_DEBTS: string[] = ["M2b"];

const ruleIds: ReadonlySet<string> = new Set(RULE_IDS);
const modes: ReadonlySet<string> = new Set(MODES);

/** Validates the complete parameters.ux.except value without modifying it.
 * Use when: validating static or runtime exceptions. Avoid when: checking whether selectors still match.
 */
export function validateUxExcept(value: unknown): string[] {
  if (!Array.isArray(value)) return ["except must be an array of exception objects"];
  const problems: string[] = [];
  value.forEach((entry: unknown, index) => {
    const path = `except[${index}]`;
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      problems.push(`${path} must be an exception object`);
      return;
    }
    const exception = entry as Record<string, unknown>;
    if (typeof exception.rule !== "string" || !ruleIds.has(exception.rule))
      problems.push(`${path}.rule must be a known UX rule id`);
    if (typeof exception.selector !== "string" || !exception.selector.trim())
      problems.push(`${path}.selector must be a non-empty string`);
    if (typeof exception.reason !== "string" || exception.reason.trim().length < 15)
      problems.push(`${path}.reason must contain at least 15 characters`);
    if ("debt" in exception) {
      if (typeof exception.debt !== "string") problems.push(`${path}.debt must be a string`);
      else if (CLOSED_DEBTS.includes(exception.debt)) problems.push(`${path} refers to closed debt ${exception.debt}`);
    }
    if ("projects" in exception) {
      const projects = exception.projects;
      if (!Array.isArray(projects) || projects.length === 0)
        problems.push(`${path}.projects must be a non-empty array of known modes`);
      else {
        if ([...projects].some((mode: unknown) => typeof mode !== "string" || !modes.has(mode)))
          problems.push(`${path}.projects must contain only known modes`);
        if (new Set(projects).size !== projects.length) problems.push(`${path}.projects must contain distinct modes`);
      }
    }
  });
  return problems;
}
