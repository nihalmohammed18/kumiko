import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Checkbox } from "./checkbox.tsx";
import { CheckboxGroup } from "./checkbox-group.tsx";
import { Field, FieldError } from "./field.tsx";
import { Fieldset, FieldsetLegend } from "./fieldset.tsx";

const meta = {
  title: "Forms/CheckboxGroup",
  component: CheckboxGroup,
  args: { defaultValue: [], onValueChange: fn() },
  render: (args) => (
    <Fieldset className="w-full max-w-sm">
      <FieldsetLegend id="notifications-legend">Notifications</FieldsetLegend>
      <CheckboxGroup {...args} aria-labelledby="notifications-legend">
        <Checkbox value="email">Email</Checkbox>
        <Checkbox value="sms">SMS</Checkbox>
        <Checkbox value="push">Push notifications</Checkbox>
      </CheckboxGroup>
    </Fieldset>
  ),
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Email"));
    await userEvent.click(canvas.getByText("SMS"));
    await waitFor(() => {
      expect(canvas.getByRole("checkbox", { name: "Email" })).toHaveAttribute("aria-checked", "true");
      expect(canvas.getByRole("checkbox", { name: "SMS" })).toHaveAttribute("aria-checked", "true");
      expect(args.onValueChange).toHaveBeenLastCalledWith(["email", "sms"], expect.anything());
    });
  },
};

export const Selected: Story = { args: { defaultValue: ["email"] } };

export const Disabled: Story = {
  args: { disabled: true, defaultValue: ["email"] },
  play: async ({ args, canvas, userEvent }) => {
    const sms = canvas.getByRole("checkbox", { name: "SMS" });
    await userEvent.click(canvas.getByText("SMS"));
    await waitFor(() => {
      expect(sms).toHaveAttribute("aria-disabled", "true");
      expect(sms).toHaveAttribute("aria-checked", "false");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

/** The group's empty, selected, disabled and invalid states. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-6">
      {(["Empty", "Selected", "Disabled", "Invalid"] as const).map((state) => (
        <Field key={state} disabled={state === "Disabled"} invalid={state === "Invalid" || undefined}>
          <Fieldset>
            <FieldsetLegend id={`checkbox-group-${state}`}>{state}</FieldsetLegend>
            <CheckboxGroup
              {...args}
              aria-labelledby={`checkbox-group-${state}`}
              defaultValue={state === "Selected" ? ["email"] : []}
            >
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
            </CheckboxGroup>
          </Fieldset>
          {state === "Invalid" && <FieldError match>Choose a notification channel.</FieldError>}
        </Field>
      ))}
    </div>
  ),
};
