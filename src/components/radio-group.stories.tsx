import { Field as BaseField } from "@base-ui/react/field";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Button } from "./button.tsx";
import { Field, FieldError } from "./field.tsx";
import { Fieldset, FieldsetLegend } from "./fieldset.tsx";
import { Form } from "./form.tsx";
import { Radio } from "./radio.tsx";
import { RadioGroup } from "./radio-group.tsx";

const meta = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  subcomponents: { Radio },
  args: { name: "frequency", onValueChange: fn() },
  render: (args) => (
    <Fieldset className="w-full max-w-sm">
      <FieldsetLegend id="frequency-legend">Frequency</FieldsetLegend>
      <RadioGroup {...args} aria-labelledby="frequency-legend">
        <Radio value="daily">Daily</Radio>
        <Radio value="weekly">Weekly</Radio>
        <Radio value="monthly">Monthly</Radio>
      </RadioGroup>
    </Fieldset>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const daily = canvas.getByRole("radio", { name: "Daily" });
    const weekly = canvas.getByRole("radio", { name: "Weekly" });
    await userEvent.click(canvas.getByText("Daily"));
    await waitFor(() => expect(daily).toHaveAttribute("aria-checked", "true"));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(weekly).toHaveFocus();
      expect(weekly).toHaveAttribute("aria-checked", "true");
      expect(daily).toHaveAttribute("aria-checked", "false");
      expect(args.onValueChange).toHaveBeenLastCalledWith("weekly", expect.anything());
    });
  },
};

export const Checked: Story = { args: { defaultValue: "daily" } };

export const DisabledItem: Story = {
  name: "Disabled item",
  args: { defaultValue: "daily" },
  render: (args) => (
    <RadioGroup {...args} aria-label="Frequency">
      <Radio value="daily">Daily</Radio>
      <Radio value="weekly" disabled>
        Weekly
      </Radio>
      <Radio value="monthly">Monthly</Radio>
    </RadioGroup>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const weekly = canvas.getByRole("radio", { name: "Weekly" });
    await userEvent.click(canvas.getByText("Weekly"));
    await waitFor(() => {
      expect(weekly).toHaveAttribute("aria-disabled", "true");
      expect(weekly).toHaveAttribute("aria-checked", "false");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
    await userEvent.click(canvas.getByText("Daily"));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Monthly" })).toHaveAttribute("aria-checked", "true"));
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: "daily" } };

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true, defaultValue: "daily" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.click(canvas.getByText("Weekly"));
    await waitFor(() => {
      expect(canvas.getByRole("radio", { name: "Daily" })).toHaveAttribute("aria-checked", "true");
      expect(canvas.getByRole("radio", { name: "Weekly" })).toHaveAttribute("aria-checked", "false");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

export const Invalid: Story = {
  render: (args) => (
    <Form className="w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
      <Field name="frequency">
        <Fieldset>
          <FieldsetLegend id="required-frequency-legend">Frequency</FieldsetLegend>
          <RadioGroup {...args} required aria-labelledby="required-frequency-legend">
            <BaseField.Item>
              <Radio value="daily">Daily</Radio>
            </BaseField.Item>
            <BaseField.Item>
              <Radio value="weekly">Weekly</Radio>
            </BaseField.Item>
          </RadioGroup>
        </Fieldset>
        <FieldError match="valueMissing">Choose a frequency.</FieldError>
      </Field>
      <Button type="submit" tone="primary" className="justify-self-start">
        Save
      </Button>
    </Form>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(canvas.getByText("Choose a frequency.")).toBeVisible();
      expect(canvas.getByRole("radio", { name: "Daily" })).toHaveAccessibleDescription("Choose a frequency.");
    });
  },
};

/** Checked and unchecked radios, with each sample in its own named group. */
export const States: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {(["Unchecked", "Checked"] as const).map((state) => (
        <div key={state} className="grid gap-3">
          <p className="text-label font-bold">{state}</p>
          <div className="flex flex-wrap items-start gap-6">
            {(["rest", "hover", "focus", "active", "disabled"] as const).map((interaction) => (
              <RadioGroup
                {...args}
                key={interaction}
                name={`frequency-${state}-${interaction}`}
                aria-label={`${state} ${interaction} frequency`}
                defaultValue={state === "Checked" ? "choice" : undefined}
                disabled={interaction === "disabled"}
              >
                <Radio
                  value="choice"
                  data-demo={interaction === "rest" || interaction === "disabled" ? undefined : interaction}
                >
                  {interaction}
                </Radio>
                <Radio value="other">Other option</Radio>
              </RadioGroup>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
