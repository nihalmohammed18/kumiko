import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field.tsx";
import { NativeSelect } from "./native-select.tsx";

const meta = {
  title: "Forms/NativeSelect",
  component: NativeSelect,
  args: { defaultValue: "in", onValueChange: fn() },
  render: (args) => (
    <Field name="country" className="w-full max-w-sm">
      <FieldLabel>Country</FieldLabel>
      <NativeSelect {...args}>
        <option value="in">India</option>
        <option value="gb">United Kingdom</option>
        <option value="us">United States</option>
      </NativeSelect>
      <FieldDescription>The country where you live.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole("combobox", { name: "Country" });
    await userEvent.selectOptions(select, "gb");
    await waitFor(() => {
      expect(select).toHaveValue("gb");
      expect(args.onValueChange).toHaveBeenCalledWith("gb", expect.anything());
    });
  },
};

export const Disabled: Story = {
  render: (args) => (
    <Field name="country" disabled className="w-full max-w-sm">
      <FieldLabel>Country</FieldLabel>
      <NativeSelect {...args}>
        <option value="in">India</option>
      </NativeSelect>
    </Field>
  ),
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole("combobox", { name: "Country" })).toBeDisabled());
  },
};

export const Invalid: Story = {
  args: { defaultValue: "" },
  render: (args) => (
    <Field name="country" invalid className="w-full max-w-sm">
      <FieldLabel>Country</FieldLabel>
      <NativeSelect {...args} required>
        <option value="">Choose a country</option>
        <option value="in">India</option>
      </NativeSelect>
      <FieldError match>Choose a country.</FieldError>
    </Field>
  ),
};
