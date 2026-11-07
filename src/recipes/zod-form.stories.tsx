"use client";

import { Field as BaseField } from "@base-ui/react/field";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { flushSync } from "react-dom";
import { expect, fn, waitFor, within } from "storybook/test";
import { z } from "zod";
import { Button } from "../components/button.tsx";
import { Checkbox } from "../components/checkbox.tsx";
import { ChoiceTile, ChoiceTileGroup } from "../components/choice-tile.tsx";
import { Combobox, ComboboxInput, ComboboxItem, ComboboxPopup } from "../components/combobox.tsx";
import { Field, FieldDescription, FieldError, FieldLabel } from "../components/field.tsx";
import { Fieldset, FieldsetLegend } from "../components/fieldset.tsx";
import { Form, type FormProps } from "../components/form.tsx";
import { Input } from "../components/input.tsx";
import { NumberField } from "../components/number-field.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "../components/select.tsx";
import { Switch } from "../components/switch.tsx";
import { cities, frequencies, type JobAlert, jobAlertDefaults, jobAlertSchema, roles } from "./job-alert.ts";

/** Submits parsed values through Form; each external error clears on change.
 * Use when: a form needs schema validation without a form library. Avoid when: managing field arrays or watched values.
 */
function ZodJobAlertForm({ onSubmit }: { onSubmit: (values: JobAlert) => void }) {
  const [errors, setErrors] = useState<FormProps["errors"]>({});
  const roleLabelId = useId();
  return (
    <Form
      errors={errors}
      className="w-full max-w-md"
      // Old external errors block onFormSubmit, so retire them before Base UI validates the current values.
      onSubmitCapture={() => flushSync(() => setErrors({}))}
      onFormSubmit={(values) => {
        const result = jobAlertSchema.safeParse(values);
        if (!result.success) {
          setErrors(z.flattenError(result.error).fieldErrors);
          return;
        }
        setErrors({});
        onSubmit(result.data);
      }}
    >
      <Fieldset>
        <FieldsetLegend>Job alert</FieldsetLegend>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" autoComplete="email" defaultValue={jobAlertDefaults.email} aria-required />
          <BaseField.Validity>
            {({ validity }) =>
              validity.typeMismatch ? (
                <FieldError match="typeMismatch">Enter an email like name@example.com.</FieldError>
              ) : (
                <FieldError />
              )
            }
          </BaseField.Validity>
        </Field>
        <Field name="city">
          <FieldLabel>City</FieldLabel>
          <Combobox items={cities}>
            <ComboboxInput placeholder="Search cities" aria-required />
            <ComboboxPopup>
              {(city: string) => (
                <ComboboxItem key={city} value={city}>
                  {city}
                </ComboboxItem>
              )}
            </ComboboxPopup>
          </Combobox>
          <FieldError />
        </Field>
        <Field name="role">
          <Fieldset>
            <FieldsetLegend id={roleLabelId}>Kind of role</FieldsetLegend>
            <ChoiceTileGroup defaultValue={jobAlertDefaults.role} aria-labelledby={roleLabelId} aria-required>
              {roles.map(({ value, label }) => (
                <BaseField.Item key={value}>
                  <ChoiceTile value={value}>{label}</ChoiceTile>
                </BaseField.Item>
              ))}
            </ChoiceTileGroup>
          </Fieldset>
          <FieldError />
        </Field>
        <Field name="minSalary">
          <FieldLabel>Minimum salary</FieldLabel>
          <NumberField defaultValue={jobAlertDefaults.minSalary ?? undefined} step={5} min={0} />
          <FieldDescription>In thousands. Leave blank for any salary; otherwise use at least 10.</FieldDescription>
          <FieldError />
        </Field>
        <Field name="frequency">
          <FieldLabel>Frequency</FieldLabel>
          <Select items={frequencies} defaultValue={jobAlertDefaults.frequency}>
            <SelectTrigger aria-required>
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
          <FieldError />
        </Field>
        <Field name="remote">
          <FieldLabel className="flex min-h-10 items-center justify-between gap-3 cursor-pointer">
            <span className="min-w-0 wrap-break-word">Remote jobs</span>
            <Switch nativeButton render={<button type="button" />} defaultChecked={jobAlertDefaults.remote} />
          </FieldLabel>
          <FieldDescription>Include jobs you can do from home.</FieldDescription>
          <FieldError />
        </Field>
        <Field name="terms">
          <FieldLabel className="flex min-h-10 items-center gap-3 cursor-pointer">
            <Checkbox
              nativeButton
              render={<button type="button" />}
              defaultChecked={jobAlertDefaults.terms}
              aria-required
            />
            <span className="min-w-0 wrap-break-word">Email me about new jobs that match</span>
          </FieldLabel>
          <FieldError />
        </Field>
      </Fieldset>
      <Button type="submit" tone="primary" className="justify-self-start">
        Create alert
      </Button>
    </Form>
  );
}

const meta = {
  title: "Recipes/zod with Form",
  component: ZodJobAlertForm,
  args: { onSubmit: fn() },
} satisfies Meta<typeof ZodJobAlertForm>;

/** Storybook metadata for the Zod with Form recipe.
 * Use when: browsing its validation examples. Avoid when: importing a production form.
 */
export default meta;
type Story = StoryObj<typeof meta>;

/** Shows every empty required field and focuses email after submission.
 * Use when: checking submit validation. Avoid when: demonstrating a successful alert.
 */
export const EmptySubmit: Story = {
  name: "Empty submit",
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Create alert" }));
    await waitFor(() => {
      for (const message of [
        "Enter your email.",
        "Choose a city.",
        "Choose a kind of role.",
        "Tick this to get alerts.",
      ])
        expect(canvas.getByText(message)).toBeVisible();
      for (const control of [
        canvas.getByRole("textbox", { name: "Email" }),
        canvas.getByRole("combobox", { name: "City" }),
        canvas.getByRole("radiogroup", { name: "Kind of role" }),
        canvas.getByRole("checkbox", { name: "Email me about new jobs that match" }),
      ])
        expect(control).toHaveAttribute("aria-invalid", "true");
      expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();
      expect(canvas.getByRole("combobox", { name: "Frequency" })).toHaveTextContent("Weekly");
      expect(args.onSubmit).not.toHaveBeenCalled();
    });
  },
};

/** Clears the email error on change while the other required errors remain.
 * Use when: checking correction and the next invalid field's focus. Avoid when: checking blur-only validation.
 */
export const FixingAnError: Story = {
  name: "Fixing an error",
  play: async (context) => {
    await EmptySubmit.play?.(context);
    const { canvas, userEvent } = context;
    const email = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(email, "nihal@example.com");
    await waitFor(() => {
      expect(canvas.queryByText("Enter your email.")).not.toBeInTheDocument();
      expect(email).not.toHaveAttribute("aria-invalid", "true");
      for (const message of ["Choose a city.", "Choose a kind of role.", "Tick this to get alerts."])
        expect(canvas.getByText(message)).toBeVisible();
    });
    await userEvent.click(canvas.getByRole("button", { name: "Create alert" }));
    await waitFor(() => expect(canvas.getByRole("combobox", { name: "City" })).toHaveFocus());
  },
};

/** Corrects email and salary constraints, then submits one typed alert.
 * Use when: checking keyboard choices and focus on later errors. Avoid when: demonstrating optional salary alone.
 */
export const ValidSubmit: Story = {
  name: "Valid submit",
  play: async ({ args, canvas, canvasElement, globals, userEvent }) => {
    const email = canvas.getByRole("textbox", { name: "Email" });
    const submit = canvas.getByRole("button", { name: "Create alert" });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.type(email, "not-an-email");
    await userEvent.click(submit);
    await waitFor(() => expect(canvas.getByText("Enter an email like name@example.com.")).toBeVisible());
    await userEvent.clear(email);
    await userEvent.type(email, "nihal@example.com");
    await userEvent.type(canvas.getByRole("combobox", { name: "City" }), "Lon");
    await waitFor(() => expect(body.getByRole("option", { name: "London" })).toBeVisible());
    await userEvent.click(body.getByRole("option", { name: "London" }));
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await userEvent.click(submit);
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Internship" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("radio", { name: "Internship" }));
    await userEvent.keyboard(globals.dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
    await waitFor(() =>
      expect(canvas.getByRole("radio", { name: "Full-time" })).toHaveAttribute("aria-checked", "true"),
    );
    const salary = canvas.getByRole("textbox", { name: "Minimum salary" });
    await userEvent.type(salary, "5");
    await userEvent.click(submit);
    await waitFor(() => {
      expect(canvas.getByText("Use at least 10.")).toBeVisible();
      expect(salary).toHaveAttribute("aria-invalid", "true");
      expect(salary).toHaveFocus();
    });
    await userEvent.clear(salary);
    await userEvent.type(salary, "25");
    await userEvent.click(submit);
    const terms = canvas.getByRole("checkbox", { name: "Email me about new jobs that match" });
    await waitFor(() => {
      expect(canvas.queryByText("Use at least 10.")).not.toBeInTheDocument();
      expect(terms).toHaveFocus();
    });
    await userEvent.click(terms);
    await userEvent.click(submit);
    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledTimes(1);
      expect(args.onSubmit).toHaveBeenCalledWith({
        email: "nihal@example.com",
        city: "London",
        role: "full-time",
        minSalary: 25,
        frequency: "weekly",
        remote: false,
        terms: true,
      });
      expect(canvas.queryAllByText(/^(Enter |Choose |Tick |Use at least)/)).toHaveLength(0);
    });
  },
};
