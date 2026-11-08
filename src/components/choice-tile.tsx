"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { createContext, type ReactNode, use, useId } from "react";
import { CheckIcon } from "../icons.tsx";
import { cn } from "../lib/tv.ts";

const ChoiceTileModeContext = /*#__PURE__*/ createContext(false);

/** Props for one answer tile's value, title, icon and description.
 * Use when: typing ChoiceTile within a ChoiceTileGroup. Avoid when: typing a compact option; use RadioProps or CheckboxProps.
 */
export interface ChoiceTileProps extends Omit<BaseRadio.Root.Props<string>, "className"> {
  icon?: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** A large tactile answer tile with a check badge when selected.
 * Use when: presenting prominent choices in ChoiceTileGroup. Avoid when: compact form choices suffice; use Radio or Checkbox.
 *
 * @example
 * <Field name="department">
 *   <Fieldset>
 *     <FieldsetLegend id="department-legend">Your next team</FieldsetLegend>
 *     <ChoiceTileGroup aria-labelledby="department-legend" defaultValue="engineering" columns={2}>
 *       <ChoiceTile value="engineering" description="Build the product">Engineering</ChoiceTile>
 *       <ChoiceTile value="design" description="Shape the experience">Design</ChoiceTile>
 *     </ChoiceTileGroup>
 *   </Fieldset>
 *   <FieldError />
 * </Field>
 */
export function ChoiceTile({
  icon,
  description,
  children,
  className,
  nativeButton = true,
  render = <button type="button" />,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...props
}: ChoiceTileProps) {
  const multiple = use(ChoiceTileModeContext);
  const titleId = useId();
  const descriptionId = `${titleId}-description`;
  const Root = multiple ? BaseCheckbox.Root : BaseRadio.Root;
  const Indicator = multiple ? BaseCheckbox.Indicator : BaseRadio.Indicator;
  return (
    <Root
      {...props}
      data-slot="choice-tile"
      nativeButton={nativeButton}
      render={render}
      aria-labelledby={labelledBy ?? (props["aria-label"] == null ? titleId : undefined)}
      aria-describedby={[describedBy, description != null && descriptionId].filter(Boolean).join(" ") || undefined}
      className={cn(
        "press press-secondary [--press-radius:var(--kumiko-radius-card)] grid min-h-16 min-w-0 w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-4 text-start data-checked:press-selected focus-visible:transition-none",
        className,
      )}
    >
      {icon != null && (
        <span aria-hidden data-slot="choice-tile-icon" className="inline-grid size-6 shrink-0 place-items-center">
          {icon}
        </span>
      )}
      <span className={cn("min-w-0", icon == null && "col-span-2")}>
        <span
          id={titleId}
          data-slot="choice-tile-title"
          className="block wrap-break-word font-display font-bold text-title-sm"
        >
          {children}
        </span>
        {description != null && (
          <span
            id={descriptionId}
            data-slot="choice-tile-description"
            className="block wrap-break-word text-body-sm text-ink-muted in-data-checked:text-current in-data-disabled:text-current"
          >
            {description}
          </span>
        )}
      </span>
      <Indicator
        keepMounted
        aria-hidden
        data-slot="choice-tile-check"
        className="inline-grid size-6 shrink-0 place-items-center rounded-full bg-brand-text text-surface data-unchecked:invisible data-disabled:bg-disabled-text data-disabled:text-disabled-fill forced-colors:bg-forced-fg forced-colors:text-forced-fill forced-colors:data-disabled:bg-forced-surface forced-colors:data-disabled:text-forced-disabled"
      >
        <CheckIcon className="size-4" />
      </Indicator>
    </Root>
  );
}

/** Props for single or multiple answer values and an optional two-column container layout.
 * Use when: typing ChoiceTileGroup. Avoid when: typing an individual answer; use ChoiceTileProps.
 */
export type ChoiceTileGroupProps = {
  columns?: 1 | 2;
  className?: string;
} & (
  | ({ multiple?: false } & Omit<BaseRadioGroup.Props<string>, "className">)
  | ({ multiple: true } & Omit<BaseCheckboxGroup.Props, "className">)
);

/** Shares one answer by default, or several with multiple, between choice tiles.
 * Use when: collecting prominent answer choices. Avoid when: applying compact filters; use ChipGroup.
 */
export function ChoiceTileGroup({ columns = 1, className, ...props }: ChoiceTileGroupProps) {
  const classes = cn("grid min-w-0 gap-3", columns === 2 && "@md:grid-cols-2", className);
  let group: ReactNode;
  if (props.multiple) {
    const { multiple, ...groupProps } = props;
    group = (
      <ChoiceTileModeContext value={multiple}>
        <BaseCheckboxGroup {...groupProps} data-slot="choice-tile-group" className={classes} />
      </ChoiceTileModeContext>
    );
  } else {
    const { multiple = false, ...groupProps } = props;
    group = (
      <ChoiceTileModeContext value={multiple}>
        <BaseRadioGroup {...groupProps} data-slot="choice-tile-group" className={classes} />
      </ChoiceTileModeContext>
    );
  }
  return <div className="@container min-w-0">{group}</div>;
}
