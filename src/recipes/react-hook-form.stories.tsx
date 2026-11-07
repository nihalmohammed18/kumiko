"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { fn } from "storybook/test";
import { Button } from "../components/button.tsx";
import { Checkbox } from "../components/checkbox.tsx";
import { ChoiceTile, ChoiceTileGroup } from "../components/choice-tile.tsx";
import { Combobox, ComboboxInput, ComboboxItem, ComboboxPopup } from "../components/combobox.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "../components/field.tsx";
import { Fieldset, FieldsetLegend } from "../components/fieldset.tsx";
import { Input } from "../components/input.tsx";
import { NumberField } from "../components/number-field.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "../components/select.tsx";
import { Switch } from "../components/switch.tsx";
import {
  cities,
  frequencies,
  type JobAlert,
  type JobAlertInput,
  jobAlertDefaults,
  jobAlertSchema,
  roles,
} from "./job-alert.ts";
import {
  EmptySubmit as FormEmptySubmit,
  FixingAnError as FormFixingAnError,
  ValidSubmit as FormValidSubmit,
} from "./zod-form.stories.tsx";

/** Validates on submit with React Hook Form and revalidates errors on change.
 * Use when: managing large forms, field arrays or watched values. Avoid when: Form and a schema suffice.
 */
function ReactHookFormJobAlert({ onSubmit }: { onSubmit: (values: JobAlert) => void }) {
  const roleLabelId = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobAlertInput, unknown, JobAlert>({
    resolver: zodResolver(jobAlertSchema),
    defaultValues: jobAlertDefaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  return (
    <form
      noValidate
      className="grid min-w-0 w-full max-w-md gap-6"
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <Fieldset>
        <FieldsetLegend>Job alert</FieldsetLegend>
        <Field name="email" invalid={Boolean(errors.email)}>
          <FieldLabel>Email</FieldLabel>
          <Input {...register("email")} type="email" autoComplete="email" aria-required />
          {errors.email && <FieldError match>{errors.email.message}</FieldError>}
        </Field>
        <Controller
          name="city"
          control={control}
          render={({ field, fieldState }) => (
            <Field name={field.name} invalid={Boolean(fieldState.error)}>
              <FieldLabel>City</FieldLabel>
              <Combobox
                name={field.name}
                items={cities}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <ComboboxInput ref={field.ref} onBlur={field.onBlur} placeholder="Search cities" aria-required />
                <ComboboxPopup>
                  {(city: string) => (
                    <ComboboxItem key={city} value={city}>
                      {city}
                    </ComboboxItem>
                  )}
                </ComboboxPopup>
              </Combobox>
              {fieldState.error && <FieldError match>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field, fieldState }) => (
            <Field name={field.name} invalid={Boolean(fieldState.error)}>
              <Fieldset>
                <FieldsetLegend id={roleLabelId}>Kind of role</FieldsetLegend>
                <ChoiceTileGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-labelledby={roleLabelId}
                  aria-required
                >
                  {roles.map(({ value, label }, index) => (
                    <BaseField.Item key={value}>
                      <ChoiceTile value={value} ref={index === 0 ? field.ref : undefined}>
                        {label}
                      </ChoiceTile>
                    </BaseField.Item>
                  ))}
                </ChoiceTileGroup>
              </Fieldset>
              {fieldState.error && <FieldError match>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          name="minSalary"
          control={control}
          render={({ field, fieldState }) => (
            <Field name={field.name} invalid={Boolean(fieldState.error)}>
              <FieldLabel>Minimum salary</FieldLabel>
              <NumberField
                name={field.name}
                value={field.value ?? null}
                onValueChange={field.onChange}
                inputProps={{ ref: field.ref, onBlur: field.onBlur }}
                step={5}
                min={0}
              />
              <FieldDescription>In thousands. Leave blank for any salary; otherwise use at least 10.</FieldDescription>
              {fieldState.error && <FieldError match>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          name="frequency"
          control={control}
          render={({ field, fieldState }) => (
            <Field name={field.name} invalid={Boolean(fieldState.error)}>
              <FieldLabel>Frequency</FieldLabel>
              <Select
                name={field.name}
                items={frequencies}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger ref={field.ref} onBlur={field.onBlur} aria-required>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {frequencies.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              {fieldState.error && <FieldError match>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          name="remote"
          control={control}
          render={({ field, fieldState }) => (
            <Field name={field.name} invalid={Boolean(fieldState.error)}>
              <FieldLabel className="flex min-h-10 items-center justify-between gap-3 cursor-pointer">
                <span className="min-w-0 wrap-break-word">Remote jobs</span>
                <Switch
                  name={field.name}
                  nativeButton
                  render={<button type="button" />}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  ref={field.ref}
                  onBlur={field.onBlur}
                />
              </FieldLabel>
              <FieldDescription>Include jobs you can do from home.</FieldDescription>
              {fieldState.error && <FieldError match>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          name="terms"
          control={control}
          render={({ field, fieldState }) => (
            <Field name={field.name} invalid={Boolean(fieldState.error)}>
              <FieldLabel className="flex min-h-10 items-center gap-3 cursor-pointer">
                <Checkbox
                  name={field.name}
                  nativeButton
                  render={<button type="button" />}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-required
                />
                <span className="min-w-0 wrap-break-word">Email me about new jobs that match</span>
              </FieldLabel>
              {fieldState.error && <FieldError match>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
      </Fieldset>
      <Button type="submit" tone="primary" className="justify-self-start">
        Create alert
      </Button>
    </form>
  );
}

const meta = {
  title: "Recipes/React Hook Form",
  component: ReactHookFormJobAlert,
  args: { onSubmit: fn() },
} satisfies Meta<typeof ReactHookFormJobAlert>;

/** Storybook metadata for the React Hook Form recipe.
 * Use when: browsing its resolver examples. Avoid when: importing a production form.
 */
export default meta;
type Story = StoryObj<typeof meta>;

// Both recipes must pass the same interactions and submit the same values.

/** Shows every empty required field and focuses email after submission.
 * Use when: checking the resolver and registered input ref. Avoid when: demonstrating a successful alert.
 */
export const EmptySubmit: Story = { name: "Empty submit", play: FormEmptySubmit.play };

/** Clears the email error on change while the other required errors remain.
 * Use when: checking revalidation and the Combobox input ref. Avoid when: checking blur-only validation.
 */
export const FixingAnError: Story = { name: "Fixing an error", play: FormFixingAnError.play };

/** Corrects constraints and submits one typed alert using Controller refs.
 * Use when: checking focus on tiles, salary and terms. Avoid when: demonstrating optional salary alone.
 */
export const ValidSubmit: Story = { name: "Valid submit", play: FormValidSubmit.play };
