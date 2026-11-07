import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import type { RuleId } from "./rules.ts";

// Deliberately broken markup, one story per UX rule. The harness inverts its check for these stories: each must
// trigger its rule in every project where that rule runs, or the test fails. Hidden from the Storybook sidebar.
const meta = {
  title: "Internal/UX fixtures",
  tags: ["!dev", "!autodocs"],
  parameters: {
    vrt: false,
    // a11y-exception: these fixtures are broken on purpose to prove each UX rule catches its bug.
    a11y: { test: "off" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// A plain control look as a class, so each fixture's :hover/:active rule (more specific) can win over it.
const FACE = `.ux-face { cursor: pointer; padding: 10px 16px; border: 2px solid rgb(60, 60, 70); border-radius: 12px;
  background: rgb(235, 235, 240); color: rgb(20, 20, 25); font: 16px/1.25 sans-serif; }`;

function fixture(expect: RuleId[], render: () => ReactNode, except?: unknown[]): Story {
  return {
    parameters: { ux: { expect, except } },
    render: () => (
      <>
        <style>{FACE}</style>
        {render()}
      </>
    ),
  };
}

export const Cursor = fixture(["cursor"], () => (
  <button type="button" className="ux-face" style={{ cursor: "default" }}>
    Default cursor
  </button>
));

export const DisabledInert = fixture(["disabled-inert"], () => (
  <>
    <style>{".ux-inert:hover { background: rgb(200, 200, 220); }"}</style>
    <button type="button" className="ux-face ux-inert" style={{ cursor: "not-allowed" }} disabled>
      Reacts while disabled
    </button>
  </>
));

export const HoverVisible = fixture(["hover-visible"], () => (
  <button type="button" className="ux-face">
    No hover feedback
  </button>
));

export const PressVisible = fixture(["press-visible"], () => (
  <>
    <style>{"@media (hover: hover) { .ux-nopress:hover { background: rgb(210, 210, 225); } }"}</style>
    <button type="button" className="ux-face ux-nopress">
      No press feedback
    </button>
  </>
));

export const NoLayoutShift = fixture(["no-layout-shift"], () => (
  <>
    <style>{".ux-shift:active { padding-inline: 32px; }"}</style>
    <button type="button" className="ux-face ux-shift">
      Grows when pressed
    </button>
  </>
));

export const FocusRingMissing = fixture(["focus-ring"], () => (
  <>
    <style>{".ux-noring:focus-visible { outline: none; }"}</style>
    <button type="button" className="ux-face ux-noring">
      No focus ring
    </button>
  </>
));

export const FocusRingCovered = fixture(["focus-ring"], () => (
  <>
    <style>{".ux-ring:focus-visible { outline: 3px solid rgb(20, 20, 25); outline-offset: 2px; }"}</style>
    <div style={{ position: "relative", display: "inline-block" }}>
      <button type="button" className="ux-face ux-ring">
        Covered ring
      </button>
      <span
        style={{
          position: "absolute",
          zIndex: 1,
          insetInline: -8,
          top: -8,
          height: 6,
          background: "rgb(235, 235, 240)",
        }}
      />
    </div>
  </>
));

export const TargetSize = fixture(["target-size"], () => (
  <div style={{ display: "flex", gap: 4 }}>
    {["One", "Two"].map((name) => (
      <button
        key={name}
        type="button"
        aria-label={name}
        className="ux-face"
        style={{ width: 16, height: 16, padding: 0 }}
      />
    ))}
  </div>
));

export const EdgeClip = fixture(["edge-clip"], () => (
  <div style={{ display: "flex", overflow: "hidden" }}>
    <button type="button" className="ux-face" style={{ border: "none", boxShadow: "0 4px 0 rgb(60, 60, 70)" }}>
      Edge cut off
    </button>
  </div>
));

export const EdgeVisible = fixture(["edge-visible"], () => (
  <div style={{ paddingBlockEnd: 8 }}>
    <button type="button" className="ux-face" style={{ border: "none", boxShadow: "0 4px 0 transparent" }}>
      Invisible edge
    </button>
  </div>
));

export const ReduceNoMove = fixture(["reduce-no-move"], () => (
  <div style={{ transition: "translate 200ms" }}>Moves even under reduced motion</div>
));

export const Transitions = fixture(["transitions"], () => (
  <div style={{ transition: "all 200ms" }}>Transitions everything</div>
));

export const Settle = fixture(["settle"], () => (
  <>
    <style>{"@keyframes ux-spin { to { rotate: 1turn; } } .ux-loop { animation: ux-spin 1s linear infinite; }"}</style>
    <div className="ux-loop" style={{ inlineSize: 40, blockSize: 40, background: "rgb(60, 60, 70)" }} />
  </>
));

export const Reflow = fixture(["reflow"], () => <div style={{ inlineSize: 400 }}>Wider than a phone</div>);

export const TextOverflow = fixture(["text-overflow"], () => (
  <div style={{ inlineSize: 60, whiteSpace: "nowrap" }}>A label that is far too long</div>
));

export const InputFont = fixture(["input-font"], () => (
  <label>
    Name <input style={{ fontSize: 14 }} />
  </label>
));

export const NoStickyHover = fixture(["no-sticky-hover"], () => (
  <>
    <style>{".ux-sticky:hover { background: rgb(210, 210, 225); }"}</style>
    <button type="button" className="ux-face ux-sticky">
      Hover sticks after a tap
    </button>
  </>
));

export const Boundary = fixture(["boundary"], () => (
  <button type="button" className="ux-face" style={{ border: "none" }}>
    No border
  </button>
));

export const StateNotColor = fixture(["state-not-color"], () => (
  <div style={{ display: "flex", gap: 8 }}>
    <button type="button" aria-pressed="true" className="ux-face" style={{ background: "rgb(220, 222, 240)" }}>
      Bold
    </button>
    <button type="button" aria-pressed="false" className="ux-face">
      Italic
    </button>
  </div>
));

const arrow = (flip: boolean) => (
  <svg data-icon-directional viewBox="0 0 16 16" width={16} height={16} style={flip ? { scale: "-1 1" } : undefined}>
    <title>Next</title>
    <path d="M5 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth={2} />
  </svg>
);

// One arrow is never mirrored and one always is, so each direction has a wrong one.
export const Directional = fixture(["directional"], () => (
  <div style={{ display: "flex", gap: 8 }}>
    {arrow(false)}
    {arrow(true)}
  </div>
));

export const ColorScheme = fixture(["color-scheme"], () => (
  <div data-theme="dark" style={{ colorScheme: "light" }}>
    Dark theme, light colour scheme
  </div>
));

export const StaleException = fixture(["stale-exception"], () => <p>Nothing here needs an exception.</p>, [
  { rule: "transitions", selector: ".matches-nothing", reason: "fixture: an exception that matches nothing" },
]);
