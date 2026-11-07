/** Keyboard focus shared by compact choices and switch tracks.
 * Use when: styling a choice's focus target. Avoid when: drawing a pressable's edge-aware ring; use press.
 */
export const choiceFocusStyles =
  "focus-visible:outline-solid focus-visible:outline-(length:--kumiko-ring-width) focus-visible:outline-offset-2 focus-visible:outline-focus forced-colors:focus-visible:outline-forced-ink";

/** The 24px checkbox and radio box with a 40px hit area.
 * Use when: styling a compact choice. Avoid when: styling a switch track or a text field.
 */
export const choiceBoxStyles = [
  "relative inline-grid size-6 shrink-0 place-items-center border-2 border-control-line bg-surface cursor-pointer",
  // Absolute insets start inside the border; the extra margin includes its 2px in the 40px hit area.
  "before:absolute before:-inset-2 before:-m-0.5 before:content-['']",
  "active:not-data-disabled:before:-inset-3",
  "hover:not-data-disabled:border-ink-muted active:not-data-disabled:scale-90",
  "motion-safe:transition-[scale] motion-safe:duration-press-out motion-safe:ease-enter active:not-data-disabled:motion-safe:duration-press-in focus-visible:transition-none",
  choiceFocusStyles,
  "data-invalid:not-data-disabled:border-danger hover:not-data-disabled:data-invalid:border-danger-text",
  "data-disabled:bg-disabled-fill data-disabled:border-disabled-line data-disabled:cursor-not-allowed forced-colors:data-disabled:border-forced-disabled",
].join(" ");

/** A wrapping label that reflects a choice's resolved disabled state, including inherited state.
 * Use when: labeling a checkbox, radio or switch with children. Avoid when: labeling a control group; use FieldsetLegend.
 */
export const choiceLabelStyles =
  "inline-flex min-h-10 min-w-0 max-w-full items-start gap-3 text-body text-ink cursor-pointer has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:text-disabled-text";
