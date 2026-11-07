import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateInput } from "./date-input.tsx";
import { Field, FieldDescription, FieldLabel } from "./field.tsx";

const meta = {
  title: "Forms/DateInput",
  component: DateInput,
  args: { defaultValue: "2026-11-07" },
  render: (args) => (
    <Field name="startDate" className="w-full max-w-sm">
      <FieldLabel>Start date</FieldLabel>
      <DateInput {...args} />
      <FieldDescription>Choose the first day of your project.</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
