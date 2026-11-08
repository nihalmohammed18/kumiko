"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";

/** Props for a numeric slider, its visible label and each thumb's accessible name.
 * Use when: typing Slider. Avoid when: collecting an exact typed value; use NumberFieldProps.
 */
export interface SliderProps<Value extends number | readonly number[] = number | readonly number[]>
  extends Omit<BaseSlider.Root.Props<Value>, "className"> {
  className?: string;
  label?: ReactNode;
  /** Props shared by the thumbs; use getAriaLabel to distinguish range endpoints. */
  thumbProps?: Omit<BaseSlider.Thumb.Props, "index" | "render" | "style" | "className" | "disabled"> & {
    className?: string;
  };
}

const renderThumb: Exclude<BaseSlider.Thumb.Props["render"], ReactElement | undefined> = (props, state) => {
  const { translate, ...style } = props.style ?? {};
  // Base UI positions with translate; reserve that property for the shared press movement.
  return (
    <div
      {...props}
      data-dragging={
        state.dragging && "data-index" in props && state.activeThumbIndex === props["data-index"] ? "" : undefined
      }
      style={{ ...style, transform: translate ? `translate(${String(translate).replace(" ", ", ")})` : undefined }}
    />
  );
};

/** A slider with a tactile thumb, an optional label and a locale-formatted value; arrays create range thumbs.
 * Use when: adjusting an approximate value or range. Avoid when: an exact entry is easier; use NumberField.
 * Only horizontal sliders are styled; vertical orientation needs consumer styling for now.
 *
 * @example
 * <Field name="minSalary">
 *   <FieldLabel>Minimum annual salary</FieldLabel><Slider defaultValue={80000} min={30000} max={150000} step={5000} /><FieldError />
 * </Field>
 */
export function Slider<Value extends number | readonly number[]>({
  className,
  label,
  children,
  thumbProps,
  value,
  defaultValue,
  locale,
  ...props
}: SliderProps<Value>) {
  const { locale: providerLocale } = useKumiko();
  const initialValue = value ?? defaultValue;
  const indexes = Array.from({ length: Array.isArray(initialValue) ? initialValue.length : 1 }, (_, index) => index);
  return (
    <BaseSlider.Root
      {...props}
      value={value}
      defaultValue={defaultValue}
      locale={locale ?? providerLocale}
      thumbAlignment={props.thumbAlignment ?? "edge"}
      data-slot="slider"
      className={cn("grid min-w-0 gap-2", className)}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        {label != null && (
          <BaseSlider.Label
            data-slot="slider-label"
            className="min-w-0 wrap-anywhere text-label font-bold text-ink cursor-pointer in-data-disabled:cursor-not-allowed in-data-disabled:text-disabled-text"
          >
            {label}
          </BaseSlider.Label>
        )}
        {children ?? <SliderValue />}
      </div>
      <BaseSlider.Control
        data-slot="slider-control"
        className="relative flex h-12 items-center touch-none select-none cursor-pointer data-disabled:cursor-not-allowed"
      >
        <BaseSlider.Track
          data-slot="slider-track"
          className="h-4 w-full rounded-full border-2 border-control-line bg-line data-disabled:border-disabled-line data-disabled:bg-disabled-fill forced-colors:data-disabled:border-forced-disabled"
        >
          <BaseSlider.Indicator
            data-slot="slider-indicator"
            className="rounded-full bg-brand outline-2 -outline-offset-2 outline-brand-text data-disabled:bg-disabled-text data-disabled:outline-disabled-text forced-colors:forced-color-adjust-none forced-colors:bg-forced-fill forced-colors:outline-forced-fill forced-colors:data-disabled:bg-forced-disabled forced-colors:data-disabled:outline-forced-disabled"
            style={{ blockSize: "100%" }}
          />
          {indexes.map((index) => (
            <BaseSlider.Thumb
              {...thumbProps}
              aria-label={thumbProps?.["aria-label"] ?? props["aria-label"]}
              key={index}
              index={index}
              data-slot="slider-thumb"
              render={renderThumb}
              className={cn(
                "press press-primary press-moat h-7 w-8 [--press-radius:var(--kumiko-radius-thumb)]",
                "before:absolute before:-inset-2 before:-m-0.5 before:content-[''] [&_input]:cursor-[inherit]",
                thumbProps?.className,
              )}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

/** Props for a slider's displayed value, including a custom formatter using Base UI's formatted numbers.
 * Use when: typing SliderValue. Avoid when: controlling the slider; use SliderProps.
 */
export interface SliderValueProps extends Omit<BaseSlider.Value.Props, "className"> {
  className?: string;
}

/** Displays the current slider value using its locale and format options.
 * Use when: showing the value above Slider's track. Avoid when: announcing every drag update in a live region.
 */
export function SliderValue({ className, ...props }: SliderValueProps) {
  return (
    <BaseSlider.Value
      {...props}
      data-slot="slider-value"
      className={cn(
        "min-w-0 wrap-anywhere font-display font-bold tabular-nums text-ink in-data-disabled:text-disabled-text",
        className,
      )}
    />
  );
}
